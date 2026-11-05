#!/usr/bin/env python3
"""Start the Platonic Workshop with one command:

    python3 workshop.py

It does only what is needed, in order:

  1. downloads the sources not yet downloaded (tools/fetch_sources.py; the first
     time, about 640 MB and a few minutes);
  2. builds the library (tools/build_db.py, about four minutes) if it is missing,
     or if anything it is built from changed since it was built;
  3. starts the reader at http://localhost:8800/ and opens it in your browser.

Your own work (data/user.sqlite) is never rebuilt or written over: a rebuild
replaces only the library. Standard library only.

    python3 workshop.py --port 8900      another port
    python3 workshop.py --rebuild        build the library again whatever has changed
    python3 workshop.py --no-build       start with the library as it is
    python3 workshop.py --no-browser     do not open the browser
"""
import argparse
import json
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TOOLS = ROOT / "tools"
DB = ROOT / "data" / "workshop.sqlite"
# What the library is built from. Changing the reader, the server or your-work code needs no rebuild.
BUILD_INPUTS = ["db/schema.sql", "sources", "texts", "tools"]
NOT_BUILD = {"serve.py", "mywork.py", "fetch_sources.py", "verify_sources.py"}


def run(script, *args):
    print(f"\n$ python3 tools/{script} {' '.join(args)}".rstrip(), flush=True)
    r = subprocess.run([sys.executable, str(TOOLS / script), *args], cwd=ROOT)
    if r.returncode:
        raise SystemExit(f"tools/{script} failed (exit {r.returncode}); nothing else was done.")


def missing_sources():
    srcs = json.loads((ROOT / "sources" / "manifest.json").read_text(encoding="utf-8"))["sources"]
    return [s["id"] for s in srcs if s.get("kind") in ("git", "http") and s.get("status") != "planned"
            and not (ROOT / "data" / "raw" / s["id"] / ".fetched.json").exists()]


def newer_than_library():
    """The first build input changed after the library was built, or None."""
    if not DB.exists():
        return "the library has not been built yet"
    built = DB.stat().st_mtime
    for name in BUILD_INPUTS:
        p = ROOT / name
        files = [p] if p.is_file() else (f for f in p.rglob("*") if f.is_file())
        for f in files:
            if f.name in NOT_BUILD or "__pycache__" in f.parts or f.suffix in (".pyc", ".png"):
                continue
            if f.stat().st_mtime > built:
                return f"{f.relative_to(ROOT)} changed since the library was built"
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=8800)
    ap.add_argument("--rebuild", action="store_true", help="build the library again")
    ap.add_argument("--no-build", action="store_true", help="never build; start with the library as it is")
    ap.add_argument("--no-browser", action="store_true", help="do not open the browser")
    args = ap.parse_args()
    if sys.version_info < (3, 10):
        raise SystemExit(f"The Workshop needs Python 3.10 or later; this is {sys.version.split()[0]}.")
    if not args.no_build:
        need = missing_sources()
        if need:
            print(f"Downloading {len(need)} source{'s' if len(need) != 1 else ''} not yet here: {', '.join(need)}")
            run("fetch_sources.py")
        why = "you asked for a rebuild" if args.rebuild else newer_than_library()
        if why:
            print(f"Building the library ({why}); about four minutes. Your own work is not touched.")
            t0 = time.time()
            run("build_db.py")
            print(f"Built in {time.time() - t0:.0f}s.")
    elif not DB.exists():
        raise SystemExit("There is no library yet: run python3 workshop.py without --no-build.")
    sys.path.insert(0, str(TOOLS))
    import build_db
    import serve
    build_db.ensure_user_db()
    srv = serve.make_server(args.port)
    url = f"http://localhost:{args.port}/"
    print(f"\nPlatonic Workshop: {url}   (Ctrl+C to stop)", flush=True)
    if not args.no_browser:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
