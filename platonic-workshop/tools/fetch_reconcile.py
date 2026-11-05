#!/usr/bin/env python3
"""Download the later Platonists that the reconciliation worksheet (milestone 12)
quotes, as Project Gutenberg's proofread transcriptions of Thomas Taylor's
translations, into sources/taylor-gutenberg/. Kept as received; fetched.json
records the URL, time and SHA-256 of each file.

    python3 tools/fetch_reconcile.py

The files are committed, so this is needed only to fetch them again.
"""
import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "sources" / "taylor-gutenberg"

# Gutenberg ebook number -> what it is (from its catalogue page, gutenberg.org/ebooks/<n>).
EBOOKS = {
    "77393": "Proclus, The Six Books on the Theology of Plato, tr. Thomas Taylor (London, 1816), vol. 1",
    "78800": "Proclus, The Six Books on the Theology of Plato, tr. Thomas Taylor (London, 1816), vol. 2",
    "77014": "Select Works of Porphyry, tr. Thomas Taylor (London, 1823)",
    "75391": "Ocellus Lucanus on the Nature of the Universe; Taurus on the Eternity of the World; tr. Thomas Taylor (London, 1831)",
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    log = {}
    for n, title in EBOOKS.items():
        url = f"https://www.gutenberg.org/cache/epub/{n}/pg{n}.txt"
        req = urllib.request.Request(url, headers={"User-Agent": "PlatonicWorkshop/12 (personal research)"})
        body = urllib.request.urlopen(req, timeout=120).read()
        (OUT / f"pg{n}.txt").write_bytes(body)
        log[f"pg{n}.txt"] = {"ebook": n, "title": title, "url": url, "catalogue": f"https://www.gutenberg.org/ebooks/{n}",
                             "fetched": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
                             "sha256": hashlib.sha256(body).hexdigest(), "bytes": len(body)}
        print(f"pg{n}.txt  {len(body):>9,} bytes  {title}")
    (OUT / "fetched.json").write_text(json.dumps(log, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
