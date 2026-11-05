#!/usr/bin/env python3
"""Download the OCR text of the Timaeus commentaries (milestone 7) from the
Internet Archive, and record where each file came from.

- sources/proclus-1820/: The Commentaries of Proclus on the Timaeus of Plato,
  translated by Thomas Taylor (London, 1820), 2 vols; the University of
  Toronto copy (proclusontimaeus01procuoft, proclusontimaeus02procuoft).
- sources/archer-hind-1888/: The Timaeus of Plato, edited with introduction
  and notes by R. D. Archer-Hind (London, 1888); the University of California
  copy (timaeusofplato00platiala), whose OCR reads the Greek and the English
  well. (The Toronto copy, platonostimaiost00platuoft, was OCR'd as Greek
  throughout, its English included, so it is not used.)

Each file is kept exactly as received, with its URL, time and sha256 in the
folder's fetched.json.

    python3 tools/fetch_commentaries.py
"""
import hashlib
import json
import time
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ITEMS = {
    "proclus-1820": ["proclusontimaeus01procuoft", "proclusontimaeus02procuoft"],
    "archer-hind-1888": ["timaeusofplato00platiala"],
}


def fetch(url):
    """With curl: the Internet Archive's file servers answer Python's urllib with 500."""
    for attempt in range(5):
        out = subprocess.run(["curl", "-sSL", "--max-time", "300", "-w", "\n%{http_code} %{content_type}", url],
                             capture_output=True, check=True).stdout
        body, _, tail = out.rpartition(b"\n")
        status, _, ctype = tail.decode().partition(" ")
        if status == "200":
            return int(status), ctype, body
        time.sleep(2 ** attempt)    # the archive's file servers answer 500 now and then
    raise SystemExit(f"{url}: HTTP {status}")


def main():
    for folder, ids in ITEMS.items():
        dest = ROOT / "sources" / folder
        dest.mkdir(parents=True, exist_ok=True)
        rec_path = dest / "fetched.json"
        rec = json.loads(rec_path.read_text()) if rec_path.exists() else {}
        for ident in ids:
            for kind, url in (("text", f"https://archive.org/download/{ident}/{ident}_djvu.txt"),
                              ("metadata", f"https://archive.org/metadata/{ident}/metadata")):
                status, ctype, body = fetch(url)
                name = f"{ident}_djvu.txt" if kind == "text" else f"{ident}_metadata.json"
                (dest / name).write_bytes(body)
                rec[name] = {"url": url, "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
                             "http_status": status, "content_type": ctype, "bytes": len(body),
                             "sha256": hashlib.sha256(body).hexdigest()}
                print(f"{name}: {len(body):,} bytes")
                time.sleep(2)
        rec_path.write_text(json.dumps(rec, indent=2) + "\n")


if __name__ == "__main__":
    main()
