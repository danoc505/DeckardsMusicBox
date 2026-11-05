#!/usr/bin/env python3
"""Download the theosophylib.com pages of Taylor's Works of Plato, vol. I.

The pages are listed in sources/taylor-1804-vol1-theosophylib/pages.json.
Each is saved exactly as received to html/<slug>.html, and fetched.json
records the URL, time, HTTP status, size and sha256 of every download, so
the committed copies can always be traced back to the site.

    python3 tools/fetch_theosophylib.py           # fetch pages not yet saved
    python3 tools/fetch_theosophylib.py --force   # download every page again

The site's robots.txt asks for 10 seconds between requests; this script waits
that long. Standard library only.
"""
import argparse
import hashlib
import json
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources" / "taylor-1804-vol1-theosophylib"
CRAWL_DELAY = 10
USER_AGENT = "PlatonicWorkshop/1.0 (personal study; one request per 10 s)"


def load_pages():
    return json.loads((SRC / "pages.json").read_text(encoding="utf-8"))["pages"]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status, r.headers.get("Content-Type", ""), r.read()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="download pages that are already saved")
    args = ap.parse_args()

    log_path = SRC / "fetched.json"
    log = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {}
    (SRC / "html").mkdir(parents=True, exist_ok=True)
    first = True
    for page in load_pages():
        dest = SRC / "html" / f"{page['slug']}.html"
        if dest.exists() and not args.force:
            print(f"[skip] {page['slug']}")
            continue
        if not first:
            time.sleep(CRAWL_DELAY)
        first = False
        status, ctype, body = fetch(page["url"])
        if status != 200:
            sys.exit(f"{page['url']}: HTTP {status}")
        dest.write_bytes(body)
        log[page["slug"]] = {
            "url": page["url"],
            "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "http_status": status,
            "content_type": ctype,
            "bytes": len(body),
            "sha256": hashlib.sha256(body).hexdigest(),
        }
        print(f"[fetch] {page['slug']}: {len(body):,} bytes")
    log_path.write_text(json.dumps(log, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
