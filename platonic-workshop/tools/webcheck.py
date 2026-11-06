#!/usr/bin/env python3
"""Check the open resources the dossiers link to: fetch each page, and look
for the words the dossier quotes from it.

    python3 tools/webcheck.py              # check every link in the dossiers (sources/dossiers/)
    python3 tools/webcheck.py --only cave  # one dossier
    python3 tools/webcheck.py --show URL   # print a page's text (to choose a quotation)
    python3 tools/webcheck.py --words      # the web pages the Workshop's own words rest on (milestone 16)

Every link a dossier makes to a web page (the Stanford and Internet
Encyclopedias of Philosophy, Wikipedia, Perseus, Wiktionary...) carries a
quotation of that page. This fetches the page, turns its HTML into text and
looks for the quotation (whitespace, quotation marks and dashes normalised),
and writes what it found to sources/dossiers/web-checks.json: the date, the
HTTP status, a SHA-256 of the text, and found or not for each quotation. The
build (tools/dossiers.py) reads that file, so the library can be rebuilt
without the network, and the reader shows when each link was last checked.
Nothing is written by AI: a link whose words are not on the page is reported
and shown as not found.
"""
import argparse
import hashlib
import html
import json
import re
import sys
import time
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHECKS = ROOT / "sources" / "dossiers" / "web-checks.json"
CACHE = ROOT / "data" / "web-cache"
UA = "PlatonicWorkshop/1.0 (personal study tool; link checker)"
QUOTES = str.maketrans({"‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-",
                        " ": " ", " ": " ", " ": " ", "ʼ": "'", "᾽": "'", "′": "'"})


def page_text(raw):
    """Readable text of an HTML page: scripts, styles and tags removed, entities decoded."""
    s = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", " ", raw)
    s = re.sub(r"(?is)<!--.*?-->", " ", s)
    s = re.sub(r"(?i)<(br|/p|/div|/li|/h\d|/tr|/blockquote)\b[^>]*>", "\n", s)
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s)


def norm(s):
    s = unicodedata.normalize("NFC", s).translate(QUOTES)
    s = re.sub(r"\[\d+\]", "", s)          # Wikipedia's footnote marks
    return re.sub(r"\s+", " ", s).strip().lower()


def fetch(url, refresh=False):
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / (hashlib.sha256(url.encode()).hexdigest()[:24] + ".html")
    if f.exists() and not refresh:
        return 200, f.read_text(encoding="utf-8")
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                body = r.read().decode(r.headers.get_content_charset() or "utf-8", "replace")
                f.write_text(body, encoding="utf-8")
                return r.status, body
        except urllib.error.HTTPError as e:
            return e.code, ""
        except Exception:  # network: try again
            time.sleep(2 ** attempt)
    return 0, ""


def links(d):
    """Every (dossier id, link) in the dossiers file."""
    sys.path.insert(0, str(ROOT / "tools"))
    import dossiers
    for x in d["dossiers"]:
        for w in dossiers.perseus_links(x) + x.get("web", []):
            yield x["id"], w


def check(only=None, refresh=False):
    sys.path.insert(0, str(ROOT / "tools"))
    import dossiers
    d = dossiers.load()
    old = json.loads(CHECKS.read_text(encoding="utf-8")) if CHECKS.exists() else {"pages": {}}
    pages = old["pages"]
    bad = []
    todo = {}
    for did, w in links(d):
        if only and did != only:
            continue
        todo.setdefault(w["url"], set()).add(w["quote"])
    for url, quotes in sorted(todo.items()):
        status, body = fetch(url, refresh)
        text = norm(page_text(body)) if body else ""
        rec = {"checked": time.strftime("%Y-%m-%d"), "status": status,
               "sha256": hashlib.sha256(text.encode()).hexdigest() if text else None,
               "quotes": {q: (norm(q) in text) for q in sorted(quotes)}}
        prev = pages.get(url, {}).get("quotes", {})
        rec["quotes"] = {**{q: v for q, v in prev.items() if q in quotes}, **rec["quotes"]}
        pages[url] = rec
        for q, ok in rec["quotes"].items():
            if not ok:
                bad.append(f"{url} [{status}]: «{q}»")
        print(f"{status} {url}: {sum(rec['quotes'].values())}/{len(rec['quotes'])}", flush=True)
    out = {"about": "Written by tools/webcheck.py: for each web page a dossier links to, when it was fetched, the HTTP status, "
                    "a SHA-256 of its text, and whether each quotation the dossiers make of it was found there.",
           "pages": dict(sorted(pages.items()))}
    CHECKS.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if bad:
        print("\nNot found:\n" + "\n".join(bad))
    return bad


WORDS = ROOT / "sources" / "structure" / "workshop-words.json"
WORDS_CHECKS = ROOT / "sources" / "structure" / "workshop-words-checks.json"


def check_words(refresh=False):
    """Milestone 16: the web pages quoted in sources/structure/workshop-words.json."""
    d = json.loads(WORDS.read_text(encoding="utf-8"))
    todo = {}
    for w in d["words"]:
        for s in w["sources"]:
            if s.get("url"):
                todo.setdefault(s["url"], set()).add(s["quote"])
    pages, bad = {}, []
    for url, quotes in sorted(todo.items()):
        status, body = fetch(url, refresh)
        text = norm(page_text(body)) if body else ""
        pages[url] = {"checked": time.strftime("%Y-%m-%d"), "status": status,
                      "sha256": hashlib.sha256(text.encode()).hexdigest() if text else None,
                      "quotes": {q: (norm(q) in text) for q in sorted(quotes)}}
        bad += [f"{url} [{status}]: «{q}»" for q, ok in pages[url]["quotes"].items() if not ok]
        print(f"{status} {url}: {sum(pages[url]['quotes'].values())}/{len(quotes)}", flush=True)
    out = {"about": "Written by tools/webcheck.py --words: for each web page the Workshop's own words quote "
                    "(sources/structure/workshop-words.json), when it was fetched, the HTTP status, a SHA-256 of its text, "
                    "and whether each quotation was found there.", "pages": pages}
    WORDS_CHECKS.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if bad:
        print("\nNot found:\n" + "\n".join(bad))
    return bad


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only")
    ap.add_argument("--refresh", action="store_true", help="fetch again even if cached")
    ap.add_argument("--show", help="print the text of a page")
    ap.add_argument("--grep", help="with --show: only lines matching this (case-insensitive)")
    ap.add_argument("--words", action="store_true", help="check the pages the Workshop's own words quote")
    a = ap.parse_args()
    if a.words:
        sys.exit(1 if check_words(a.refresh) else 0)
    if a.show:
        status, body = fetch(a.show, a.refresh)
        t = page_text(body)
        lines = [re.sub(r"\s+", " ", x).strip() for x in t.split("\n")]
        for x in lines:
            if x and (not a.grep or re.search(a.grep, x, re.I)):
                print(x)
        print(f"[{status}]", file=sys.stderr)
        return
    bad = check(a.only, a.refresh)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
