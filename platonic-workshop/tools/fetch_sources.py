#!/usr/bin/env python3
"""Download the 'git' and 'http' sources in sources/manifest.json into data/raw/<id>.

Each git source is fetched at its pinned commit with a sparse, blob-less clone,
so only the listed paths are downloaded (the full Perseus repository is
several gigabytes; the Plato folder is about 60 MB).

Each http source (Perseus texts that are not on GitHub) is downloaded from its
URL and must match the SHA-256 pinned in the manifest, so the file on disk is
byte for byte the one the Workshop was built and checked against. Perseus
sometimes cuts a long download short, so a mismatch is retried a few times.
A source with 'stop_after' is a prefix of a longer download (LSJ's front
matter is the start of the whole lexicon): reading stops after that marker.

    python3 tools/fetch_sources.py            # fetch everything not yet fetched
    python3 tools/fetch_sources.py lsj glaux-plato
    python3 tools/fetch_sources.py --all      # include 'planned' sources

After a fetch, data/raw/<id>/.fetched.json records the commit (or the
SHA-256) and the time.
"""
import argparse
import hashlib
import json
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "sources" / "manifest.json"
RAW = ROOT / "data" / "raw"


def load_manifest():
    return json.loads(MANIFEST.read_text(encoding="utf-8"))["sources"]


def git(*args, cwd):
    subprocess.run(["git", *args], cwd=cwd, check=True)


def fetch(src):
    dest = RAW / src["id"]
    stamp = dest / ".fetched.json"
    if stamp.exists() and json.loads(stamp.read_text())["commit"] == src["commit"]:
        print(f"[skip] {src['id']} already at {src['commit'][:10]}")
        return
    dest.mkdir(parents=True, exist_ok=True)
    if not (dest / ".git").exists():
        git("init", "-q", cwd=dest)
        git("remote", "add", "origin", src["repo"], cwd=dest)
    git("sparse-checkout", "set", "--no-cone", *src["paths"], cwd=dest)
    print(f"[fetch] {src['id']} from {src['repo']} @ {src['commit'][:10]}")
    git("fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", src["commit"], cwd=dest)
    git("checkout", "-q", "--force", src["commit"], cwd=dest)
    stamp.write_text(json.dumps({
        "id": src["id"],
        "repo": src["repo"],
        "commit": src["commit"],
        "paths": src["paths"],
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }, indent=2))


def fetch_http(src, attempts=6):
    dest = RAW / src["id"]
    stamp = dest / ".fetched.json"
    if stamp.exists() and json.loads(stamp.read_text())["commit"] == src["sha256"]:
        print(f"[skip] {src['id']} already at sha256 {src['sha256'][:10]}")
        return
    dest.mkdir(parents=True, exist_ok=True)
    marker = src.get("stop_after", "").encode()
    print(f"[fetch] {src['id']} from {src['url']}")
    for attempt in range(1, attempts + 1):
        data = b""
        try:
            with urllib.request.urlopen(urllib.request.Request(src["url"], headers={"User-Agent": "PlatonicWorkshop/3 (personal research; fetch_sources.py)"}), timeout=300) as r:
                while True:
                    chunk = r.read(1 << 16)
                    if not chunk:
                        break
                    data += chunk
                    if marker and marker in data:
                        data = data[: data.index(marker) + len(marker)]
                        break
        except OSError as e:  # cut-off transfers raise here; the checksum below decides
            print(f"  attempt {attempt}: {e}")
        digest = hashlib.sha256(data).hexdigest()
        if digest == src["sha256"]:
            break
        print(f"  attempt {attempt}: got {len(data)} bytes with sha256 {digest[:10]}, expected {src['sha256'][:10]}; retrying")
        time.sleep(2 * attempt)
    else:
        sys.exit(f"{src['id']}: could not download a copy matching the pinned sha256 after {attempts} attempts")
    (dest / src["file"]).write_bytes(data)
    stamp.write_text(json.dumps({
        "id": src["id"],
        "url": src["url"],
        "commit": src["sha256"],
        "bytes": len(data),
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }, indent=2))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("ids", nargs="*", help="source ids to fetch (default: all non-planned sources)")
    ap.add_argument("--all", action="store_true", help="also fetch sources marked 'planned'")
    args = ap.parse_args()
    sources = [s for s in load_manifest() if s["kind"] in ("git", "http")]
    if args.ids:
        unknown = set(args.ids) - {s["id"] for s in sources}
        if unknown:
            sys.exit(f"unknown source id(s): {', '.join(sorted(unknown))}")
        sources = [s for s in sources if s["id"] in args.ids]
    elif not args.all:
        sources = [s for s in sources if s["status"] != "planned"]
    # Sources sharing one repo and commit (Perseus Greek and English) share one checkout.
    done = {}
    for src in sources:
        if src["kind"] == "http":
            fetch_http(src)
            continue
        key = (src["repo"], src["commit"])
        if key in done:
            link = RAW / src["id"]
            if not link.exists():
                link.symlink_to(done[key], target_is_directory=True)
            print(f"[link] {src['id']} -> {done[key]}")
            continue
        fetch(src)
        done[key] = src["id"]


if __name__ == "__main__":
    main()
