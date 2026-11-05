#!/usr/bin/env python3
"""Run the Workshop reader on this computer.

    python3 tools/build_db.py      # once, and after any change to the sources
    python3 tools/serve.py         # then open http://localhost:8800/

Standard library only. Serves reader/ and a small JSON API over
data/workshop.sqlite (the library, read only) and data/user.sqlite (your own
work, written only through tools/mywork.py, which keeps every version).
It listens on 127.0.0.1 only, so nothing is reachable from other machines,
and refuses writes from any page not served by itself.
"""
import argparse
import json
import os
import tempfile
import mimetypes
import re
import sqlite3
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_db  # noqa: E402
import greek  # noqa: E402
import lexicon  # noqa: E402
import mywork  # noqa: E402
import search  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
READER = ROOT / "reader"


class Library:
    """Read-only queries the reader needs. One instance per request thread is
    cheap: sqlite connections open in microseconds."""

    def __init__(self, db_path=build_db.DB_PATH, user_path=build_db.USER_DB_PATH):
        if not Path(db_path).exists():
            raise SystemExit(f"{db_path} not found; run python3 tools/build_db.py first")
        self.db = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        # Your work: its own connection per call, so writes from any request thread are safe.
        self.mine = mywork.MyWork(user_path, self.db)
        self.search = search.Search(self.db)

    def rows(self, sql, *args, db=None):
        return [dict(r) for r in (db or self.db).execute(sql, args)]

    def one(self, sql, *args):
        r = self.db.execute(sql, args).fetchone()
        return dict(r) if r else None

    # ------------------------------------------------------------ works

    def works(self):
        return self.rows("SELECT w.id, w.urn, w.title, w.imported, w.abbr, w.slug, w.tetralogy, w.n_tokens, "
                         "(SELECT min(ref) FROM section s WHERE s.work_id = w.id AND s.seq = 0) AS first_ref "
                         "FROM work w ORDER BY w.id")

    def work(self, work_id):
        w = self.one("SELECT * FROM work WHERE id = ?", work_id)
        if not w or not w["imported"]:
            return None
        w["editions"] = self.rows(
            "SELECT e.*, s.title AS source_title, s.licence FROM edition e JOIN source s ON s.id = e.source_id WHERE work_id = ?", work_id)
        w["sections"] = [r["ref"] for r in self.rows("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", work_id)]
        w["pages"] = self.rows("SELECT label, start_ref, end_ref FROM division WHERE work_id = ? AND kind = 'page' ORDER BY id", work_id)
        w["speeches"] = self.rows("SELECT label, start_ref, end_ref, basis FROM division WHERE work_id = ? AND kind = 'speech' ORDER BY id", work_id)
        w["parts"] = self.rows("SELECT label, start_ref, end_ref, basis, source_id FROM division WHERE work_id = ? AND kind IN ('part', 'skopos') ORDER BY id", work_id)
        w["books"] = self.rows("SELECT kind, label, start_ref, end_ref, basis FROM division WHERE work_id = ? AND kind IN ('book', 'letter') ORDER BY id", work_id)
        w["counts"] = {
            "notes": self.one("SELECT count(*) n FROM note WHERE work_id = ?", work_id)["n"],
            "links_out": self.one("SELECT count(*) n FROM link WHERE from_work = ?", work_id)["n"],
            "links_in": self.one("SELECT count(*) n FROM link WHERE to_work = ?", work_id)["n"],
            "tokens": w["n_tokens"] or 0,
            # Token ids of a work are one run, so this reads only the work's own rows of tag.
            "tagged": self.one("SELECT count(DISTINCT token_id) n FROM tag WHERE token_id BETWEEN ? AND ?",
                               w["first_token"] or 0, w["last_token"] or -1)["n"],
        }
        return w

    # ------------------------------------------------------------ one Stephanus page

    def page(self, work_id, page):
        secs = self.rows("SELECT ref, urn FROM section WHERE work_id = ? AND page = ? ORDER BY seq", work_id, page)
        if not secs:
            return None
        refs = [s["ref"] for s in secs]
        marks = ",".join("?" * len(refs))
        chunks = self.rows(
            f"SELECT c.id, c.edition_id, e.lang, c.section_ref, c.para, c.speaker, c.label, c.text FROM chunk c "
            f"JOIN edition e ON e.id = c.edition_id WHERE c.work_id = ? AND c.section_ref IN ({marks}) ORDER BY c.edition_id, c.seq",
            work_id, *refs)
        tokens = self.rows(
            f"SELECT t.id, t.chunk_id, t.section_ref, t.seq, t.start, t.end, t.form, "
            f"(SELECT count(*) FROM tag g WHERE g.token_id = t.id) AS tagged FROM token t "
            f"WHERE t.edition_id IN (SELECT id FROM edition WHERE work_id = ?) AND t.section_ref IN ({marks}) ORDER BY t.id",
            work_id, *refs)
        notes = self.rows(
            f"SELECT id, commentator, start_ref, end_ref, chunk_id, offset, body_html, printed_at, anchor_method, proof_status, source_id "
            f"FROM note WHERE work_id = ? AND start_ref IN ({marks}) ORDER BY id", work_id, *refs)
        links_out = self.rows(
            f"SELECT l.id, l.from_ref, l.to_work, l.to_ref, l.raw, l.method, l.note_id, w.title AS to_title, w.imported AS to_imported "
            f"FROM link l JOIN work w ON w.id = l.to_work WHERE from_work = ? AND from_ref IN ({marks}) ORDER BY l.id", work_id, *refs)
        # Links in: to a section here, or to the bare page number.
        links_in = self.rows(
            f"SELECT l.id, l.from_work, l.from_ref, l.to_ref, l.raw, l.method, l.note_id, w.title AS from_title "
            f"FROM link l JOIN work w ON w.id = l.from_work WHERE to_work = ? AND (to_ref IN ({marks}) OR to_ref = ?) ORDER BY l.from_ref",
            work_id, *refs, str(page))
        speeches = self.rows(
            "SELECT label, start_ref, end_ref FROM division WHERE work_id = ? AND kind = 'speech' ORDER BY id", work_id)
        seq = {r: i for i, r in enumerate(self.work_sections(work_id))}
        lo, hi = seq[refs[0]], seq[refs[-1]]
        speeches = [s for s in speeches if seq[s["start_ref"]] <= hi and seq[s["end_ref"]] >= lo]
        # Your translations and notes whose span overlaps this page (it may start on an earlier one).
        mine = self.mine.rows_for_sections(work_id, refs)
        all_pages = [r["page"] for r in self.rows("SELECT DISTINCT page FROM section WHERE work_id = ? ORDER BY page", work_id)]
        i = all_pages.index(page)
        return {
            "work_id": work_id, "page": page, "sections": secs, "chunks": chunks, "tokens": tokens,
            "notes": notes, "links_out": links_out, "links_in": links_in, "speeches": speeches, "mine": mine,
            "prev": all_pages[i - 1] if i > 0 else None, "next": all_pages[i + 1] if i + 1 < len(all_pages) else None,
        }

    def work_sections(self, work_id):
        return [r["ref"] for r in self.rows("SELECT ref FROM section WHERE work_id = ? ORDER BY seq", work_id)]

    # ------------------------------------------------------------ one word

    def token(self, token_id):
        t = self.one(
            "SELECT t.*, e.work_id, s.urn AS section_urn FROM token t JOIN edition e ON e.id = t.edition_id "
            "JOIN section s ON s.work_id = e.work_id AND s.ref = t.section_ref WHERE t.id = ?", token_id)
        if not t:
            return None
        # CTS subreference: the n-th occurrence of this form in the section.
        n = self.one("SELECT count(*) n FROM token WHERE edition_id = ? AND section_ref = ? AND form = ? AND seq <= ?",
                     t["edition_id"], t["section_ref"], t["form"], t["seq"])["n"]
        t["address"] = f"{t['section_urn']}@{t['form']}[{n}]"
        tags = self.rows("SELECT * FROM tag WHERE token_id = ? ORDER BY source_id, part", token_id)
        for g in tags:
            g["features"] = greek.decode_postag(g["postag"])
        t["tags"] = tags
        tag_lemmas = {greek.strip_accents(re.sub(r"\d", "", g["lemma"] or "")) for g in tags}
        morph = self.rows("SELECT n, lemma, lemma_beta, gloss, parse FROM morph WHERE beta_key = ? ORDER BY n", t["morph_key"]) if t["morph_key"] else []
        for m in morph:
            m["same_lemma_as_tag"] = greek.strip_accents(m["lemma"]) in tag_lemmas
            # The parse the tagger chose, if Morpheus lists it: same lemma, consistent features.
            m["matches_tag"] = m["same_lemma_as_tag"] and any(greek.morpheus_agrees(m["parse"], g["features"]) for g in tags)
        t["morph"] = morph
        # Milestone 3: dictionary entries for the tagged lemma(s), and which of
        # Morpheus's other lemmas have entries (looked up on demand by /api/lookup).
        t["lookup"] = [self.lookup(l) for l in dict.fromkeys(g["lemma"] for g in tags if g["lemma"])]
        have = {r["lemma"] for r in self.rows(
            f"SELECT DISTINCT lemma FROM lemma_entry WHERE lemma IN ({','.join('?' * len(morph)) or 'NULL'})", *[m["lemma"] for m in morph])}
        for m in morph:
            m["has_entry"] = m["lemma"] in have
        t["grammar"] = [self.grammar(g) for g in tags]
        t["sources"] = {s["id"]: s for s in self.rows(
            "SELECT id, title, licence, provenance, commit_sha FROM source WHERE id IN "
            "('glaux-plato', 'morpheus-analyses', 'perseus-greek-plato', 'lsj', 'middle-liddell', 'lsj-abbreviations', 'smyth-grammar', 'agdt-guidelines')")}
        # Milestone 5: this word elsewhere in Plato, per work, for each tagged lemma.
        t["elsewhere"] = [self.search.elsewhere(l) for l in dict.fromkeys(g["lemma"] for g in tags if g["lemma"])]
        here = [c["n"] for e in t["elsewhere"][:1] for c in e["counts"] if c["work_id"] == t["work_id"]]
        t["elsewhere_in_work"] = here[0] if here else 0
        t["form_in_plato"] = self.one("SELECT coalesce(sum(n), 0) n FROM form_count WHERE form = ?", t["form"])["n"]
        return t

    # ------------------------------------------------------------ dictionaries and grammar

    def lexica(self):
        return self.rows("SELECT * FROM lexicon ORDER BY rowid")

    def lookup(self, lemma):
        """Every entry filed under a lemma, per dictionary, with how it was matched.
        A word not in lemma_entry (typed, or a cross-reference) is matched the same way:
        same Beta Code key, then the same letters and breathing, then letters only.
        Matching is done per dictionary in the build; here, for words outside it, across both."""
        lemma = greek.nfc(re.sub(r"\d", "", lemma or "")).strip()
        rows = self.rows(
            "SELECT le.lexicon_id, le.method, e.id, e.key, e.headword, e.src_id, e.html, e.n_abbr FROM lemma_entry le "
            "JOIN lex_entry e ON e.id = le.entry_id WHERE le.lemma = ? ORDER BY le.lexicon_id, e.id", lemma)
        if not rows and lemma and greek.is_greek(lemma):
            keys = lexicon.lemma_keys(lemma)
            for k, method in zip(keys, ("same-spelling", "capital-lowered")):
                rows = self.rows("SELECT lexicon_id, ? AS method, id, key, headword, src_id, html, n_abbr FROM lex_entry WHERE match_key = ? ORDER BY id", method, k)
                if rows:
                    break
            if not rows and keys:
                rows = self.rows("SELECT lexicon_id, 'accent-differs' AS method, id, key, headword, src_id, html, n_abbr FROM lex_entry WHERE unaccented_key = ? ORDER BY id",
                                 lexicon.unaccented_key(keys[0]))
            if not rows and keys:
                rows = self.rows("SELECT lexicon_id, 'letters-only' AS method, id, key, headword, src_id, html, n_abbr FROM lex_entry WHERE plain_key = ? ORDER BY id",
                                 lexicon.accentless_key(keys[0]))
        by = {lx["id"]: [] for lx in self.lexica()}
        for r in rows:
            by.setdefault(r.pop("lexicon_id"), []).append(r)
        return {"lemma": lemma, "entries": by}

    def grammar(self, tag):
        """Smyth's notes for each category of one tag, and the sentence role's definition."""
        notes = []
        for cat, val in tag["features"]:
            secs = self.rows("SELECT section, heading, rule_html, full_html, url, reason FROM grammar_note "
                             "WHERE category = ? AND value = ? ORDER BY n", cat, val)
            notes.append({"category": cat, "value": val, "smyth": secs})
        role = None
        rel = tag.get("relation") or ""
        if rel:
            base, _, suffix = rel.partition("_")
            role = {"code": rel, "label": self.one("SELECT * FROM relation_label WHERE code = ?", base),
                    "suffix": self.one("SELECT * FROM relation_label WHERE code = ?", "_" + suffix) if suffix else None}
        return {"part": tag["part"], "lemma": tag["lemma"], "notes": notes, "role": role}

    def sources(self):
        return self.rows("SELECT * FROM source ORDER BY rowid")

    def build_info(self):
        return {r["key"]: r["value"] for r in self.rows("SELECT * FROM build")}


class Handler(BaseHTTPRequestHandler):
    library = None
    server_version = "PlatonicWorkshop/5"

    def log_message(self, fmt, *args):
        if self.server.verbose:
            super().log_message(fmt, *args)

    def send_json(self, obj, status=HTTPStatus.OK):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def not_found(self):
        self.send_json({"error": "not found"}, HTTPStatus.NOT_FOUND)

    def send_file(self, body, ctype, filename):
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    # ------------------------------------------------------------ writes

    def same_origin(self):
        """Accept a write only from the reader itself: the Host must be this
        server (no DNS rebinding), any Origin must match it, and the body must be
        JSON (which a page elsewhere cannot send here without a CORS preflight,
        which this server never answers)."""
        port = self.server.server_address[1]
        hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
        if self.headers.get("Host") not in hosts:
            return False
        origin = self.headers.get("Origin")
        if origin and origin not in {f"http://{h}" for h in hosts}:
            return False
        return (self.headers.get("Content-Type") or "").split(";")[0].strip() == "application/json"

    def read_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n > 1_000_000:
            raise mywork.Invalid("request too large")
        try:
            data = json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, UnicodeDecodeError):
            raise mywork.Invalid("the request is not JSON")
        if not isinstance(data, dict):
            raise mywork.Invalid("the request is not a JSON object")
        return data

    def write(self, method):
        path = unquote(urlparse(self.path).path)
        if not self.same_origin():
            return self.send_json({"error": "writes are accepted only from the reader at this address"}, HTTPStatus.FORBIDDEN)
        mine = self.library.mine
        try:
            data = self.read_json()
            if method == "POST" and path == "/api/mine":
                return self.send_json(mine.create(data), HTTPStatus.CREATED)
            if method == "POST" and path == "/api/studies":
                return self.send_json(mine.create_study(data), HTTPStatus.CREATED)
            m = re.fullmatch(r"/api/mine/(translation|note|study)/(\d+)(?:/(delete|restore))?", path)
            if m:
                table, row_id, action = m.group(1), int(m.group(2)), m.group(3)
                if method == "PUT" and not action:
                    return self.send_json(mine.update(table, row_id, data))
                if method == "POST" and action == "delete":
                    return self.send_json(mine.delete(table, row_id, data))
                if method == "POST" and action == "restore":
                    return self.send_json(mine.restore(table, row_id, data))
            return self.not_found()
        except mywork.Conflict as e:
            return self.send_json({"error": "This text was changed somewhere else (another tab?) since you opened it. "
                                            "Nothing was saved over it; your text is still in the editor.",
                                   "current": e.current}, HTTPStatus.CONFLICT)
        except mywork.NotFound as e:
            return self.send_json({"error": f"not found: {e}"}, HTTPStatus.NOT_FOUND)
        except mywork.Invalid as e:
            return self.send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
        except sqlite3.Error as e:
            return self.send_json({"error": str(e)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_POST(self):
        self.write("POST")

    def do_PUT(self):
        self.write("PUT")

    def do_GET(self):
        url = urlparse(self.path)
        path = unquote(url.path)
        query = {k: v[-1] for k, v in parse_qs(url.query).items()}
        lib = self.library
        m = re.fullmatch(r"/api/(.*)", path)
        if m:
            parts = m.group(1).strip("/").split("/")
            try:
                if parts == ["works"]:
                    return self.send_json(lib.works())
                if parts == ["sources"]:
                    return self.send_json({"sources": lib.sources(), "build": lib.build_info()})
                if len(parts) == 2 and parts[0] == "work":
                    w = lib.work(parts[1])
                    return self.send_json(w) if w else self.not_found()
                if len(parts) == 3 and parts[0] == "page" and parts[2].isdigit():
                    p = lib.page(parts[1], int(parts[2]))
                    return self.send_json(p) if p else self.not_found()
                if len(parts) == 2 and parts[0] == "lookup":
                    return self.send_json(lib.lookup(parts[1]))
                if parts == ["search"]:
                    lst = lambda k: [x for x in query.get(k, "").split(",") if x] or None
                    try:
                        return self.send_json(lib.search.search(query.get("q", ""), query.get("by", "lemma"), works=lst("works"),
                                                                after=int(query.get("after") or 0), limit=int(query.get("limit") or search.PAGE),
                                                                exact_only=query.get("exact") == "1", terms=lst("terms")))
                    except (search.Invalid, ValueError) as e:
                        return self.send_json({"error": str(e)}, HTTPStatus.BAD_REQUEST)
                if parts == ["suggest"]:
                    return self.send_json(lib.search.suggest(query.get("q", "")))
                if len(parts) == 2 and parts[0] == "elsewhere":
                    return self.send_json(lib.search.elsewhere(greek.nfc(parts[1])))
                if parts == ["studies"]:
                    rows = lib.mine.studies(include_deleted=query.get("deleted") == "1")
                    return self.send_json(rows)
                if parts == ["lexica"]:
                    return self.send_json(lib.lexica())
                if len(parts) == 2 and parts[0] == "token" and parts[1].isdigit():
                    t = lib.token(int(parts[1]))
                    return self.send_json(t) if t else self.not_found()
                if parts == ["mine", "config"]:
                    return self.send_json({"span_units": mywork.SPAN_UNITS, "default_format": mywork.DEFAULT_FORMAT,
                                           "note_kinds": mywork.NOTE_KINDS, "formats": mywork.FORMATS})
                if parts == ["mine", "deleted"]:
                    return self.send_json(lib.mine.deleted())
                if len(parts) == 4 and parts[0] == "mine" and parts[3] == "history" and parts[2].isdigit():
                    row = lib.mine.get(parts[1], int(parts[2]))
                    return self.send_json({"item": row, "revisions": lib.mine.history(parts[1], int(parts[2]))})
                if len(parts) == 3 and parts[0] == "mine" and parts[2].isdigit():
                    return self.send_json(lib.mine.get(parts[1], int(parts[2])))
                if parts == ["export", "my-plato.md"]:
                    return self.send_file(lib.mine.export_markdown().encode("utf-8"), "text/markdown; charset=utf-8", "my-plato.md")
                if parts == ["export", "my-plato.json"]:
                    body = json.dumps(lib.mine.export_json(), ensure_ascii=False, indent=1).encode("utf-8")
                    return self.send_file(body, "application/json; charset=utf-8", "my-plato.json")
                if parts == ["export", "user.sqlite"]:
                    fd, tmp = tempfile.mkstemp(suffix=".sqlite")
                    os.close(fd)
                    try:
                        lib.mine.export_sqlite(tmp)
                        body = Path(tmp).read_bytes()
                    finally:
                        os.unlink(tmp)
                    return self.send_file(body, "application/vnd.sqlite3", "user.sqlite")
            except (mywork.NotFound, mywork.Invalid):
                return self.not_found()
            except sqlite3.Error as e:
                return self.send_json({"error": str(e)}, HTTPStatus.INTERNAL_SERVER_ERROR)
            return self.not_found()
        # Static files from reader/.
        rel = "index.html" if path in ("", "/") else path.lstrip("/")
        f = (READER / rel).resolve()
        if READER.resolve() not in f.parents or not f.is_file():
            return self.not_found()
        body = f.read_bytes()
        self.send_response(HTTPStatus.OK)
        ctype = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype.endswith("javascript"):
            ctype += "; charset=utf-8"
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def make_server(port=8800, host="127.0.0.1", verbose=False, library=None):
    Handler.library = library or Library()
    srv = ThreadingHTTPServer((host, port), Handler)
    srv.verbose = verbose
    return srv


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=8800)
    ap.add_argument("--verbose", action="store_true", help="log every request")
    args = ap.parse_args()
    build_db.ensure_user_db()
    srv = make_server(args.port, verbose=args.verbose)
    print(f"Platonic Workshop reader: http://localhost:{args.port}/   (Ctrl+C to stop)")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
