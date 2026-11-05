#!/usr/bin/env python3
"""Download the ancient introductions to reading Plato as a whole (milestone 9),
and record where each file came from.

- sources/burges-1854/: The Works of Plato, vol. VI, translated by George
  Burges (London: Bohn, 1854): the Life of Plato by Diogenes Laertius (book
  III, with the section numbers [57.] printed), and the Introduction of
  Albinus to the Dialogues of Plato (chapters [1.] to [9.]). The University
  of California copy on the Internet Archive (worksofplatonewl06platiala).
- sources/yonge-1853/: Diogenes Laertius, The Lives and Opinions of Eminent
  Philosophers, translated by C. D. Yonge (London: Bohn, 1853), Project
  Gutenberg ebook 57342: book III, the life of Plato, in a second English.
- sources/hermann-appendix/: Platonis Dialogi secundum Thrasylli tetralogias
  dispositi, ed. C. F. Hermann, vol. VI (Leipzig: Teubner, 1887 printing of
  the 1853 Appendix Platonica): the Greek of Albinus' Prologue and of the
  Anonymous Prolegomena to Platonic Philosophy, with Hermann's page numbers.
  Internet Archive (platonisdialogi06plat). No public-domain English of the
  Prolegomena exists (Westerink's, 1962, is in copyright), so it is read in
  Greek, as the OCR has it.

Each file is kept exactly as received, with its URL, time and sha256 in the
folder's fetched.json.

    python3 tools/fetch_ancient.py
"""
import hashlib
import json
import time
from pathlib import Path

from fetch_commentaries import fetch

ROOT = Path(__file__).resolve().parent.parent
ITEMS = {
    "burges-1854": [("worksofplatonewl06platiala_djvu.txt", "https://archive.org/download/worksofplatonewl06platiala/worksofplatonewl06platiala_djvu.txt"),
                    ("worksofplatonewl06platiala_metadata.json", "https://archive.org/metadata/worksofplatonewl06platiala/metadata")],
    "yonge-1853": [("pg57342.txt", "https://www.gutenberg.org/cache/epub/57342/pg57342.txt")],
    "hermann-appendix": [("platonisdialogi06plat_djvu.txt", "https://archive.org/download/platonisdialogi06plat/platonisdialogi06plat_djvu.txt"),
                         ("platonisdialogi06plat_metadata.json", "https://archive.org/metadata/platonisdialogi06plat/metadata")],
}


def main():
    for folder, files in ITEMS.items():
        dest = ROOT / "sources" / folder
        dest.mkdir(parents=True, exist_ok=True)
        rec_path = dest / "fetched.json"
        rec = json.loads(rec_path.read_text()) if rec_path.exists() else {}
        for name, url in files:
            status, ctype, body = fetch(url)
            (dest / name).write_bytes(body)
            rec[name] = {"url": url, "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S+00:00", time.gmtime()),
                         "http_status": status, "content_type": ctype, "bytes": len(body),
                         "sha256": hashlib.sha256(body).hexdigest()}
            print(f"{folder}/{name}: {len(body):,} bytes")
            time.sleep(2)
        rec_path.write_text(json.dumps(rec, indent=2) + "\n")


if __name__ == "__main__":
    main()
