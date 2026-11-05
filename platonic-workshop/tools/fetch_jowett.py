#!/usr/bin/env python3
"""Download Jowett's translations of Plato from Project Gutenberg.

The ebooks are listed in sources/jowett-gutenberg/ebooks.json. Each is saved
exactly as received to sources/jowett-gutenberg/pg<N>.txt, and fetched.json
records the URL, time, HTTP status, size and sha256 of every download, so the
committed copies can always be traced back to Gutenberg. The import
(tools/jowett.py) reads only the committed copies, so a later change to
Gutenberg's files cannot change the library unnoticed.

    python3 tools/fetch_jowett.py           # fetch ebooks not yet saved
    python3 tools/fetch_jowett.py --force   # download every ebook again

Standard library only. Waits two seconds between requests.
"""
import argparse
import hashlib
import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources" / "jowett-gutenberg"
URL = "https://www.gutenberg.org/cache/epub/{n}/pg{n}.txt"
USER_AGENT = "PlatonicWorkshop/6 (personal study; fetch_jowett.py)"


def ebooks():
    return json.loads((SRC / "ebooks.json").read_text(encoding="utf-8"))["ebooks"]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="download ebooks that are already saved")
    args = ap.parse_args()
    log_path = SRC / "fetched.json"
    log = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {}
    first = True
    for e in ebooks():
        n = e["ebook"]
        dest = SRC / f"pg{n}.txt"
        if dest.exists() and not args.force:
            print(f"[skip] pg{n}.txt")
            continue
        if not first:
            time.sleep(2)
        first = False
        url = URL.format(n=n)
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=120) as r:
            status, body = r.status, r.read()
        dest.write_bytes(body)
        log[f"pg{n}.txt"] = {
            "url": url, "status": status, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest(),
            "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
        print(f"[fetch] {url} -> {dest.name} ({len(body):,} bytes)")
    log_path.write_text(json.dumps(log, indent=1, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
