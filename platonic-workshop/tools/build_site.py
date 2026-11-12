#!/usr/bin/env python3
"""Make the Workshop website (the one that opens on the iPad).

    python3 tools/build_db.py       # first, as for the laptop
    python3 tools/build_site.py     # writes data/site/, ready to publish

The website is the reader of reader/ plus web/: Python running in the browser
answers the reader with tools/serve.py itself, over the library database cut
into small compressed pieces that are fetched only when read. Your own work
is kept in the browser. `python3 tools/build_site.py --serve` opens the result
at http://localhost:8801/ to try it on this computer.

GitHub builds and publishes it by itself after every change to main
(.github/workflows/platonic-workshop-site.yml). Standard library only.
"""
import argparse
import gzip
import hashlib
import json
import shutil
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_db  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "site"
PIECE = 512 * 1024     # bytes of the database in each piece: fewer, larger pieces open faster than many small ones

HEAD = """<link rel="stylesheet" href="web/touch.css">
<link rel="manifest" href="web/manifest.webmanifest">
<link rel="apple-touch-icon" href="web/icon.png">
<link rel="icon" href="web/icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Workshop">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script src="web/standalone.js"></script>
"""


def pieces(db, out):
    """Cut the database into gzip pieces under db/<hash>/, so a rebuilt library
    gets new addresses and the iPad never mixes old and new pieces."""
    h = hashlib.sha256()
    with open(db, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    tag = h.hexdigest()[:16]
    folder = out / "db" / tag
    folder.mkdir(parents=True)
    size = db.stat().st_size
    with open(db, "rb") as f:
        for i in range((size + PIECE - 1) // PIECE):
            (folder / f"{i:05d}.gz").write_bytes(gzip.compress(f.read(PIECE), 6, mtime=0))
    return {"base": f"db/{tag}/", "size": size, "chunk": PIECE}


def build(out=OUT):
    if not build_db.DB_PATH.exists():
        raise SystemExit(f"{build_db.DB_PATH} not found; run python3 tools/build_db.py first")
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(ROOT / "reader", out)
    shutil.copytree(ROOT / "web", out / "web")
    shutil.move(out / "web" / "sw.js", out / "sw.js")     # at the top, so it can look after the whole site
    page = (out / "index.html").read_text(encoding="utf-8")
    anchor = '<link rel="stylesheet" href="reader.css">'
    if anchor not in page:
        raise SystemExit("reader/index.html has changed: put web/'s lines after its stylesheet by hand in tools/build_site.py")
    (out / "index.html").write_text(page.replace(anchor, anchor + "\n" + HEAD, 1), encoding="utf-8")
    # The Python the browser runs: the tools and the schemas, as on the laptop.
    files = {f"tools/{p.name}": p.read_text(encoding="utf-8") for p in sorted((ROOT / "tools").glob("*.py"))}
    files.update({f"db/{p.name}": p.read_text(encoding="utf-8") for p in sorted((ROOT / "db").glob("*.sql"))})
    # The small JSON files the server reads as it answers (the dossiers' index, the reconciliation tables, ...).
    for p in sorted([*(ROOT / "sources").rglob("*.json"), *(ROOT / "reports").glob("*.json")]):
        if p.stat().st_size > 2_000_000:
            continue
        files[p.relative_to(ROOT).as_posix()] = p.read_text(encoding="utf-8")
    # Taylor's prefatory texts the Library shelves (milestone 13), read whole by /api/taylor/<id>.
    for p in sorted((ROOT / "texts" / "taylor-1804" / "vol1").glob("*.json")):
        if p.stem in ("general-introduction", "platonic-terms", "olympiodorus-life"):
            files[p.relative_to(ROOT).as_posix()] = p.read_text(encoding="utf-8")
    # Aristotle milestone A1: Taylor's Introduction and Additional Notes to the Metaphysics, read whole the same way.
    for p in sorted((ROOT / "texts" / "aristotle" / "metaphysics").glob("taylor-*.json")):
        if p.stem in ("taylor-introduction", "taylor-additional-notes"):
            files[p.relative_to(ROOT).as_posix()] = p.read_text(encoding="utf-8")
    files["web/bridge.py"] = (ROOT / "web" / "bridge.py").read_text(encoding="utf-8")
    (out / "web" / "files.json").write_text(json.dumps(files, ensure_ascii=False), encoding="utf-8")
    # A compacted copy keeps each table's rows together, so a page of Plato is read from fewer pieces.
    packed = ROOT / "data" / "site-packed.sqlite"
    packed.unlink(missing_ok=True)
    src = sqlite3.connect(f"file:{build_db.DB_PATH}?mode=ro", uri=True)
    src.execute("VACUUM INTO ?", (str(packed),))
    src.close()
    try:
        info = pieces(packed, out)
    finally:
        packed.unlink()
    (out / "web" / "db.json").write_text(json.dumps(info), encoding="utf-8")
    (out / ".nojekyll").write_text("")
    n = len(list((out / info["base"]).iterdir()))
    mb = sum(p.stat().st_size for p in out.rglob("*") if p.is_file()) / 1e6
    print(f"wrote {out.relative_to(ROOT)}: {n} pieces of the library, {mb:.0f} MB in all")


def serve(port=8801):
    import functools
    import http.server
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(OUT))
    print(f"the website: http://localhost:{port}/   (Ctrl+C to stop)")
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--serve", action="store_true", help="after building, open it at http://localhost:8801/")
    ap.add_argument("--out", type=Path, default=OUT)
    args = ap.parse_args()
    build(args.out)
    if args.serve:
        serve()


if __name__ == "__main__":
    main()
