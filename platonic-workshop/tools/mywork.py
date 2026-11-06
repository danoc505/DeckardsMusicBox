"""Your own work: translations and notes in data/user.sqlite (milestone 4).

Everything that writes to user.sqlite is in this file. The rules it keeps:

* Nothing you wrote is overwritten or erased. Every version of every text is a
  row in `revision`, the first included. An edit is refused with Conflict if
  the text changed since you opened it, so a second tab cannot silently replace
  the first. Delete only sets deleted_at; restore brings back any version as a
  new one.
* A schema upgrade copies the file to data/backups/ first and only adds columns.
* The library (workshop.sqlite) is only read, to check anchors and to give the
  Greek words of a span.

Anchors are by work URN, Stephanus section and word number within the section
(token.seq), plus the Greek words themselves. A span is either a run of words
(word_start..word_end, which may cross sections) or whole sections (both
NULL). The reader lets you select any run of words; SPAN_UNITS below is the one
switch if you would rather every translation covered whole sections.
"""
import contextlib
import datetime as dt
import hashlib
import json
import shutil
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
USER_SCHEMA = ROOT / "db" / "user_schema.sql"
SCHEMA_VERSION = 6

# What a translation is anchored to: "words" (any span you select) or
# "sections" (selections are widened to whole Stephanus sections).
SPAN_UNITS = "words"
# How a new text is written and displayed: "markdown" or "plain".
DEFAULT_FORMAT = "markdown"

TABLES = {"translation": "translation", "note": "user_note"}
# Word studies (milestone 5) are kept like the texts above, but are not anchored to a passage.
ALL_TABLES = {**TABLES, "study": "word_study", "reconciliation": "reconciliation", "method": "user_method"}
# A reconciliation worksheet (milestone 12): the fields you fill in, in the
# order of the worksheet. Text fields are Markdown; passages and methods are lists.
SHEET_TEXT = ("contradiction", "dictionary", "commentary", "interpretation", "rendering", "references")
SHEET_STATUSES = ("working", "proposal")
SEARCH_MODES = ("lemma", "form", "plain")
NOTE_KINDS = ("footnote", "note", "alternative")
PROOF_STATUSES = ("checked", "needs correction")
# A mark on a sentence of a modern English version (milestone 24).
MODERN_KINDS = ("reads badly", "seems wrong", "withdrawn")
MODERN = ROOT / "sources" / "translations" / "modern"
FORMATS = ("markdown", "plain")
MAX_BODY = 200_000


class Invalid(ValueError):
    pass


class NotFound(LookupError):
    pass


class Conflict(Exception):
    """The row changed since the client read it. Carries the current row."""

    def __init__(self, current):
        super().__init__("changed since you opened it")
        self.current = current


def now():
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


# ------------------------------------------------------------------ schema

V2_COLUMNS = {
    "translation": [("word_start", "INTEGER"), ("word_end", "INTEGER"), ("words", "TEXT"), ("label", "TEXT"),
                    ("format", "TEXT NOT NULL DEFAULT 'markdown'"), ("rev", "INTEGER NOT NULL DEFAULT 1"), ("deleted_at", "TEXT")],
    "user_note": [("label", "TEXT"), ("format", "TEXT NOT NULL DEFAULT 'markdown'"),
                  ("rev", "INTEGER NOT NULL DEFAULT 1"), ("deleted_at", "TEXT")],
    "revision": [("rev", "INTEGER"), ("event", "TEXT"), ("label", "TEXT"), ("kind", "TEXT")],
}


def ensure(path):
    """Create the tables if missing, and upgrade an older file in place
    (after copying it to data/backups/). Never changes or removes a row."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    existed = path.exists() and path.stat().st_size > 0
    db = sqlite3.connect(path)
    try:
        version = None
        if existed:
            has_meta = db.execute("SELECT 1 FROM sqlite_master WHERE name = 'meta'").fetchone()
            if has_meta:
                r = db.execute("SELECT value FROM meta WHERE key = 'schema_version'").fetchone()
                version = int(r[0]) if r else None
        if version is not None and version < SCHEMA_VERSION:
            db.close()
            backup(path, f"before-schema-{SCHEMA_VERSION}")
            db = sqlite3.connect(path)
            migrate(db, version)
        db.executescript(USER_SCHEMA.read_text(encoding="utf-8"))
        db.execute("CREATE INDEX IF NOT EXISTS translation_anchor ON translation(work_urn, start_ref)")
        db.execute("CREATE INDEX IF NOT EXISTS revision_row ON revision(table_name, row_id)")
        db.commit()
    finally:
        db.close()


def migrate(db, version=1):
    """Version 1 to 2: add columns, number the existing revisions. Version 2 to
    3 and on to 6: nothing to change; the word_study, proofreading,
    reconciliation and modern_mark tables are created by the schema. Adds only."""
    with db:
        if version >= 2:
            db.execute("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', ?)", (str(SCHEMA_VERSION),))
            return
        for table, cols in V2_COLUMNS.items():
            have = {r[1] for r in db.execute(f"PRAGMA table_info({table})")}
            for name, decl in cols:
                if name not in have:
                    db.execute(f"ALTER TABLE {table} ADD COLUMN {name} {decl}")
        # Version 1 kept only earlier versions in `revision`. Number them, then
        # add each row's current text as its latest revision.
        for table in ("translation", "user_note"):
            for (row_id,) in db.execute(f"SELECT id FROM {table}").fetchall():
                olds = db.execute("SELECT id FROM revision WHERE table_name = ? AND row_id = ? ORDER BY id", (table, row_id)).fetchall()
                for i, (rid,) in enumerate(olds, 1):
                    db.execute("UPDATE revision SET rev = ?, event = COALESCE(event, ?) WHERE id = ? AND rev IS NULL", (i, "edit" if i > 1 else "create", rid))
                cur = db.execute(f"SELECT body, updated_at, {'kind' if table == 'user_note' else 'NULL'} FROM {table} WHERE id = ?", (row_id,)).fetchone()
                n = len(olds) + 1
                db.execute("INSERT INTO revision (table_name, row_id, rev, event, kind, body, saved_at) VALUES (?,?,?,?,?,?,?)",
                           (table, row_id, n, "create" if n == 1 else "edit", cur[2], cur[0], cur[1]))
                db.execute(f"UPDATE {table} SET rev = ? WHERE id = ?", (n, row_id))
        db.execute("INSERT OR REPLACE INTO meta(key, value) VALUES ('schema_version', ?)", (str(SCHEMA_VERSION),))


def backup(path, why):
    """Copy user.sqlite to data/backups/user-<time>-<why>.sqlite, consistently
    (sqlite's own backup, so a half-written page is never copied)."""
    path = Path(path)
    dest_dir = path.parent / "backups"
    dest_dir.mkdir(exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    dest = dest_dir / f"{path.stem}-{stamp}-{why}.sqlite"
    src = sqlite3.connect(path)
    out = sqlite3.connect(dest)
    try:
        src.backup(out)
    finally:
        out.close()
        src.close()
    return dest


# ------------------------------------------------------------------ the work

class MyWork:
    """Reads and writes user.sqlite. `lib` is a read-only connection to the
    library, used for section order and the Greek words of a span."""

    def __init__(self, user_path, lib):
        self.path = Path(user_path)
        self.lib = lib
        ensure(self.path)

    def connect(self):
        if not self.path.exists():  # moved away while the server runs: start a fresh one, never write into a stray file
            ensure(self.path)
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        return db

    @contextlib.contextmanager
    def session(self):
        """A connection that commits on success, rolls back on error, and closes."""
        db = self.connect()
        try:
            with db:
                yield db
        finally:
            db.close()

    # -------------------------------------------------- library helpers

    def work(self, work_id_or_urn):
        r = self.lib.execute("SELECT id, urn, title FROM work WHERE id = ? OR urn = ?", (work_id_or_urn, work_id_or_urn)).fetchone()
        if not r:
            raise Invalid(f"unknown work {work_id_or_urn!r}")
        return {"id": r[0], "urn": r[1], "title": r[2]}

    def section_order(self, work_id):
        return {r[0]: r[1] for r in self.lib.execute("SELECT ref, seq FROM section WHERE work_id = ?", (work_id,))}

    def _greek_edition(self, work_id):
        r = self.lib.execute("SELECT id FROM edition WHERE work_id = ? AND lang = 'grc' ORDER BY id LIMIT 1", (work_id,)).fetchone()
        return r[0] if r else None

    def span_words(self, work_id, start_ref, word_start, end_ref, word_end):
        """The Greek words from (start_ref, word_start) to (end_ref, word_end)
        in the library as it is now, or None if the span is not there."""
        order = self.section_order(work_id)
        if start_ref not in order or end_ref not in order:
            return None
        lo, hi = order[start_ref], order[end_ref]
        refs = [r for r, s in sorted(order.items(), key=lambda x: x[1]) if lo <= s <= hi]
        ed = self._greek_edition(work_id)
        words = []
        for ref in refs:
            rows = self.lib.execute("SELECT seq, form FROM token WHERE edition_id = ? AND section_ref = ? ORDER BY seq", (ed, ref)).fetchall()
            a = word_start if ref == start_ref and word_start is not None else None
            b = word_end if ref == end_ref and word_end is not None else None
            if (a is not None and not any(s == a for s, _ in rows)) or (b is not None and not any(s == b for s, _ in rows)):
                return None
            words += [f for s, f in rows if (a is None or s >= a) and (b is None or s <= b)]
        return " ".join(words)

    def check_anchor(self, work_id, start_ref, word_start, end_ref, word_end):
        order = self.section_order(work_id)
        if start_ref not in order or end_ref not in order:
            raise Invalid("no such Stephanus section in this work")
        if (word_start is None) != (word_end is None):
            raise Invalid("give both word_start and word_end, or neither")
        if order[start_ref] > order[end_ref] or (start_ref == end_ref and word_start is not None and word_start > word_end):
            raise Invalid("the span ends before it starts")
        if SPAN_UNITS == "sections":
            word_start = word_end = None
        words = self.span_words(work_id, start_ref, word_start, end_ref, word_end)
        if words is None:
            raise Invalid("no such word in that section")
        return word_start, word_end, words

    # -------------------------------------------------- reading

    def rows_for_sections(self, work_id, refs):
        """Your live rows whose span overlaps any of `refs`, each with
        anchor_ok (the Greek words at the anchor are still the ones you saw)."""
        w = self.work(work_id)
        order = self.section_order(work_id)
        want = [order[r] for r in refs if r in order]
        if not want:
            return []
        lo, hi = min(want), max(want)
        out = []
        with self.session() as db:
            for public, table in TABLES.items():
                kind = "kind" if table == "user_note" else "'translation' AS kind"
                for r in db.execute(f"SELECT id, start_ref, end_ref, word_start, word_end, words, {kind}, label, format, body, rev, "
                                    f"created_at, updated_at FROM {table} WHERE work_urn = ? AND deleted_at IS NULL ORDER BY id", (w["urn"],)):
                    r = dict(r)
                    a, b = order.get(r["start_ref"]), order.get(r["end_ref"])
                    if a is None or b is None or b < lo or a > hi:
                        if a is None or b is None:
                            r["anchor_ok"] = False  # section no longer in the library; still listed in export
                        continue
                    r["table"] = public
                    now_words = self.span_words(work_id, r["start_ref"], r["word_start"], r["end_ref"], r["word_end"])
                    r["anchor_ok"] = now_words is not None and (r["words"] is None or now_words == r["words"])
                    r["start_seq"], r["end_seq"] = a, b
                    out.append(r)
        out.sort(key=lambda r: (r["start_seq"], r["word_start"] or 0, r["end_seq"], r["word_end"] or 1e9, r["table"] != "translation", r["id"]))
        return out

    def get(self, public, row_id, db=None):
        table = self._table(public)
        own = db is None
        db = db or self.connect()
        try:
            r = db.execute(f"SELECT * FROM {table} WHERE id = ?", (row_id,)).fetchone()
            if not r:
                raise NotFound(f"{public} {row_id}")
            if table == "word_study":
                return self._study_row(r)
            if table == "reconciliation":
                return self._sheet_row(r)
            if table == "user_method":
                return self._method_row(r)
            r = dict(r)
            r["table"] = public
            if table == "translation":
                r["kind"] = "translation"
            return r
        finally:
            if own:
                db.close()

    def history(self, public, row_id):
        table = self._table(public)
        with self.session() as db:
            self.get(public, row_id, db)
            return [dict(r) for r in db.execute(
                "SELECT rev, event, label, kind, body, saved_at FROM revision WHERE table_name = ? AND row_id = ? ORDER BY rev, id",
                (table, row_id))]

    # -------------------------------------------------- writing

    def _table(self, public):
        if public not in ALL_TABLES:
            raise Invalid(f"unknown kind of work {public!r}")
        return ALL_TABLES[public]

    @staticmethod
    def _body(data):
        body = data.get("body")
        if not isinstance(body, str) or not body.strip():
            raise Invalid("the text is empty")
        if len(body) > MAX_BODY:
            raise Invalid("the text is too long")
        return body

    @staticmethod
    def _label(data):
        label = data.get("label")
        if label is None:
            return None
        if not isinstance(label, str):
            raise Invalid("label must be text")
        return label.strip()[:200] or None

    @staticmethod
    def _int(v, name):
        if v is None:
            return None
        if isinstance(v, bool) or not isinstance(v, int):
            raise Invalid(f"{name} must be a whole number")
        return v

    def create(self, data):
        public = data.get("table")
        table = self._table(public)
        w = self.work(data.get("work") or "")
        start_ref, end_ref = data.get("start_ref"), data.get("end_ref") or data.get("start_ref")
        ws, we, words = self.check_anchor(w["id"], start_ref, self._int(data.get("word_start"), "word_start"),
                                          end_ref, self._int(data.get("word_end"), "word_end"))
        body, label = self._body(data), self._label(data)
        fmt = data.get("format") or DEFAULT_FORMAT
        if fmt not in FORMATS:
            raise Invalid(f"format must be one of {FORMATS}")
        kind = None
        if table == "user_note":
            kind = data.get("kind") or "note"
            if kind not in NOTE_KINDS:
                raise Invalid(f"kind must be one of {NOTE_KINDS}")
        t = now()
        with self.session() as db:
            if table == "translation":
                cur = db.execute("INSERT INTO translation (work_urn, start_ref, end_ref, word_start, word_end, words, label, format, body, rev, created_at, updated_at) "
                                 "VALUES (?,?,?,?,?,?,?,?,?,1,?,?)", (w["urn"], start_ref, end_ref, ws, we, words, label, fmt, body, t, t))
            else:
                cur = db.execute("INSERT INTO user_note (work_urn, start_ref, end_ref, word_start, word_end, words, kind, label, format, body, rev, created_at, updated_at) "
                                 "VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?)", (w["urn"], start_ref, end_ref, ws, we, words, kind, label, fmt, body, t, t))
            row_id = cur.lastrowid
            db.execute("INSERT INTO revision (table_name, row_id, rev, event, label, kind, body, saved_at) VALUES (?,?,1,'create',?,?,?,?)",
                       (table, row_id, label, kind, body, t))
            return self.get(public, row_id, db)

    def _change(self, public, row_id, base_rev, event, apply):
        """Run one change against a row inside a transaction: refuse it if the
        row moved past base_rev, record the new state as a revision."""
        table = self._table(public)
        base_rev = self._int(base_rev, "base_rev")
        if base_rev is None:
            raise Invalid("base_rev is required: the revision you were editing")
        db = self.connect()
        try:
            db.execute("BEGIN IMMEDIATE")
            cur = self.get(public, row_id, db)
            if cur["rev"] != base_rev:
                db.rollback()
                raise Conflict(cur)
            changes = apply(cur, db)
            if changes is None:  # nothing to change
                db.rollback()
                return cur
            t = now()
            changes = {**changes, "rev": cur["rev"] + 1, "updated_at": t}
            sets = ", ".join(f"{k} = ?" for k in changes)
            db.execute(f"UPDATE {table} SET {sets} WHERE id = ?", (*changes.values(), row_id))
            new = self.get(public, row_id, db)
            db.execute("INSERT INTO revision (table_name, row_id, rev, event, label, kind, body, saved_at) VALUES (?,?,?,?,?,?,?,?)",
                       (table, row_id, new["rev"], event, new.get("label"), new["kind"] if table == "user_note" else None, new["body"], t))
            db.commit()
            return new
        except BaseException:
            if db.in_transaction:
                db.rollback()
            raise
        finally:
            db.close()

    def update(self, public, row_id, data):
        if public == "study":
            return self.update_study(row_id, data)
        if public == "reconciliation":
            return self.update_sheet(row_id, data)
        if public == "method":
            return self.update_method(row_id, data)
        body, label = self._body(data), self._label(data)
        kind = data.get("kind")

        def apply(cur, db):
            if cur["deleted_at"]:
                raise Invalid("restore it before editing")
            ch = {}
            if body != cur["body"]:
                ch["body"] = body
            if label != cur.get("label"):
                ch["label"] = label
            if public == "note" and kind and kind != cur["kind"]:
                if kind not in NOTE_KINDS:
                    raise Invalid(f"kind must be one of {NOTE_KINDS}")
                ch["kind"] = kind
            return ch or None
        return self._change(public, row_id, data.get("base_rev"), "edit", apply)

    def delete(self, public, row_id, data):
        def apply(cur, db):
            return None if cur["deleted_at"] else {"deleted_at": now()}
        return self._change(public, row_id, data.get("base_rev"), "delete", apply)

    def restore(self, public, row_id, data):
        """Undelete, and/or bring back the text of an earlier revision as a new one."""
        rev = self._int(data.get("rev"), "rev")
        table = self._table(public)

        def apply(cur, db):
            ch = {"deleted_at": None} if cur["deleted_at"] else {}
            if rev is not None:
                old = db.execute("SELECT body, label, kind FROM revision WHERE table_name = ? AND row_id = ? AND rev = ? ORDER BY id DESC LIMIT 1",
                                 (table, row_id, rev)).fetchone()
                if not old:
                    raise NotFound(f"revision {rev}")
                if old["body"] != cur["body"]:
                    ch["body"] = old["body"]
                if old["label"] != cur.get("label"):
                    ch["title" if public in ("study", "reconciliation", "method") else "label"] = old["label"]
                if public == "note" and old["kind"] and old["kind"] != cur["kind"]:
                    ch["kind"] = old["kind"]
            return ch or None
        return self._change(public, row_id, data.get("base_rev"), "restore", apply)

    # -------------------------------------------------- word studies

    @staticmethod
    def _study_fields(data):
        title = data.get("title")
        if not isinstance(title, str) or not title.strip():
            raise Invalid("give the study a title")
        body = data.get("body") or ""
        if not isinstance(body, str) or len(body) > MAX_BODY:
            raise Invalid("the note is too long" if isinstance(body, str) else "the note must be text")
        return title.strip()[:200], body

    @staticmethod
    def _id_list(v, name):
        if v in (None, []):
            return None
        if not isinstance(v, list) or not all(isinstance(x, str) and 0 < len(x) <= 100 for x in v) or len(v) > 300:
            raise Invalid(f"{name} must be a list of names")
        return json.dumps(v, ensure_ascii=False)

    def studies(self, include_deleted=False):
        with self.session() as db:
            q = "SELECT * FROM word_study" + ("" if include_deleted else " WHERE deleted_at IS NULL") + " ORDER BY updated_at DESC, id DESC"
            return [self._study_row(r) for r in db.execute(q)]

    @staticmethod
    def _study_row(r):
        r = dict(r)
        r["table"] = "study"
        r["kind"] = "study"
        r["label"] = r["title"]
        r["terms"] = json.loads(r["terms"]) if r["terms"] else None
        r["works"] = json.loads(r["works"]) if r["works"] else None
        return r

    def create_study(self, data):
        title, body = self._study_fields(data)
        query = data.get("query")
        if not isinstance(query, str) or not query.strip() or len(query) > 100:
            raise Invalid("the study needs the word searched for")
        by = data.get("by") or "lemma"
        if by not in SEARCH_MODES:
            raise Invalid(f"by must be one of {SEARCH_MODES}")
        works = self._id_list(data.get("works"), "works")
        if works:
            known = {r[0] for r in self.lib.execute("SELECT id FROM work")}
            if not set(json.loads(works)) <= known:
                raise Invalid("unknown work in works")
        terms = self._id_list(data.get("terms"), "terms")
        t = now()
        with self.session() as db:
            cur = db.execute("INSERT INTO word_study (title, query, by, terms, works, format, body, rev, created_at, updated_at) VALUES (?,?,?,?,?,?,?,1,?,?)",
                             (title, query.strip(), by, terms, works, DEFAULT_FORMAT, body, t, t))
            db.execute("INSERT INTO revision (table_name, row_id, rev, event, label, kind, body, saved_at) VALUES ('word_study',?,1,'create',?,NULL,?,?)",
                       (cur.lastrowid, title, body, t))
            return self.get("study", cur.lastrowid, db)

    def update_study(self, row_id, data):
        title, body = self._study_fields(data)

        def apply(cur, db):
            if cur["deleted_at"]:
                raise Invalid("restore it before editing")
            ch = {}
            if body != cur["body"]:
                ch["body"] = body
            if title != cur["title"]:
                ch["title"] = title
            return ch or None
        return self._change("study", row_id, data.get("base_rev"), "edit", apply)

    # -------------------------------------------------- reconciliation worksheets (milestone 12)

    def _sheet_fields(self, data):
        """Check a worksheet sent by the reader; return (title, tension_id, body JSON)."""
        title = data.get("title")
        if not isinstance(title, str) or not title.strip():
            raise Invalid("give the reconciliation a title")
        tension = data.get("tension_id")
        if tension is not None:
            if not isinstance(tension, str) or not self.lib.execute("SELECT 1 FROM reconcile_tension WHERE id = ?", (tension,)).fetchone():
                raise Invalid("unknown tension")
        sheet = {}
        passages = data.get("passages") or []
        if not isinstance(passages, list) or len(passages) > 20:
            raise Invalid("passages must be a list")
        sheet["passages"] = []
        for p in passages:
            if not isinstance(p, dict):
                raise Invalid("each passage is {work, start_ref, end_ref}")
            w = self.work(p.get("work") or "")
            a, b = p.get("start_ref"), p.get("end_ref") or p.get("start_ref")
            order = self.section_order(w["id"])
            if not a:
                raise Invalid(f"give the first Stephanus section of the passage in the {w['title']}")
            if a not in order or b not in order or order[a] > order[b]:
                raise Invalid(f"the {w['title']} has no passage {a}–{b}")
            sheet["passages"].append({"work": w["id"], "start_ref": a, "end_ref": b})
        methods = data.get("methods") or []
        if not isinstance(methods, list) or not all(isinstance(m, str) for m in methods):
            raise Invalid("methods must be a list of method ids")
        known = {r[0] for r in self.lib.execute("SELECT id FROM reconcile_method")}
        with self.session() as db:
            known |= {f"mine:{r[0]}" for r in db.execute("SELECT id FROM user_method")}
        own = [m for m in methods if m not in known]
        if own:
            raise Invalid(f"unknown method {own[0]!r}")
        sheet["methods"] = list(dict.fromkeys(methods))
        for k in SHEET_TEXT:
            v = data.get(k) or ""
            if not isinstance(v, str) or len(v) > MAX_BODY:
                raise Invalid(f"{k} must be text")
            sheet[k] = v
        status = data.get("status") or "working"
        if status not in SHEET_STATUSES:
            raise Invalid(f"status must be one of {SHEET_STATUSES}")
        sheet["status"] = status
        return title.strip()[:200], tension, json.dumps(sheet, ensure_ascii=False, sort_keys=True)

    @staticmethod
    def _sheet_row(r):
        r = dict(r)
        r["table"] = "reconciliation"
        r["kind"] = "reconciliation"
        r["label"] = r["title"]
        r["sheet"] = json.loads(r["body"])
        return r

    def sheets(self, tension_id=None, include_deleted=False):
        q = "SELECT * FROM reconciliation WHERE 1"
        args = []
        if not include_deleted:
            q += " AND deleted_at IS NULL"
        if tension_id:
            q += " AND tension_id = ?"
            args.append(tension_id)
        with self.session() as db:
            return [self._sheet_row(r) for r in db.execute(q + " ORDER BY updated_at DESC, id DESC", args)]

    def create_sheet(self, data):
        title, tension, body = self._sheet_fields(data)
        t = now()
        with self.session() as db:
            cur = db.execute("INSERT INTO reconciliation (tension_id, title, body, rev, created_at, updated_at) VALUES (?,?,?,1,?,?)",
                             (tension, title, body, t, t))
            db.execute("INSERT INTO revision (table_name, row_id, rev, event, label, kind, body, saved_at) VALUES ('reconciliation',?,1,'create',?,NULL,?,?)",
                       (cur.lastrowid, title, body, t))
            return self.get("reconciliation", cur.lastrowid, db)

    def update_sheet(self, row_id, data):
        title, tension, body = self._sheet_fields(data)

        def apply(cur, db):
            if cur["deleted_at"]:
                raise Invalid("restore it before editing")
            ch = {}
            if body != cur["body"]:
                ch["body"] = body
            if title != cur["title"]:
                ch["title"] = title
            if tension != cur["tension_id"]:
                ch["tension_id"] = tension
            return ch or None
        return self._change("reconciliation", row_id, data.get("base_rev"), "edit", apply)

    # -------------------------------------------------- your own interpretive methods (milestone 12)

    def _method_fields(self, data):
        title = data.get("title") or data.get("name")
        if not isinstance(title, str) or not title.strip():
            raise Invalid("give the method a name")
        plain = data.get("plain") or ""
        citation = data.get("citation") or ""
        if not isinstance(plain, str) or not isinstance(citation, str) or len(plain) + len(citation) > MAX_BODY:
            raise Invalid("the description and the citation must be text")
        if not citation.strip():
            raise Invalid("a method needs a citation: who uses or describes it, and where")
        concepts = data.get("concepts") or []
        if not isinstance(concepts, list):
            raise Invalid("concepts must be a list")
        known = {r[0] for r in self.lib.execute("SELECT id FROM concept")}
        bad = [c for c in concepts if c not in known]
        if bad:
            raise Invalid(f"unknown concept {bad[0]!r}")
        return title.strip()[:200], json.dumps({"plain": plain, "citation": citation, "concepts": list(dict.fromkeys(concepts))},
                                               ensure_ascii=False, sort_keys=True)

    @staticmethod
    def _method_row(r):
        r = dict(r)
        r["table"] = "method"
        r["kind"] = "method"
        r["label"] = r["title"]
        r["id_ref"] = f"mine:{r['id']}"
        r.update(json.loads(r["body"]))
        return r

    def user_methods(self, include_deleted=False):
        with self.session() as db:
            q = "SELECT * FROM user_method" + ("" if include_deleted else " WHERE deleted_at IS NULL") + " ORDER BY title, id"
            return [self._method_row(r) for r in db.execute(q)]

    def create_method(self, data):
        title, body = self._method_fields(data)
        t = now()
        with self.session() as db:
            cur = db.execute("INSERT INTO user_method (title, body, rev, created_at, updated_at) VALUES (?,?,1,?,?)", (title, body, t, t))
            db.execute("INSERT INTO revision (table_name, row_id, rev, event, label, kind, body, saved_at) VALUES ('user_method',?,1,'create',?,NULL,?,?)",
                       (cur.lastrowid, title, body, t))
            return self.get("method", cur.lastrowid, db)

    def update_method(self, row_id, data):
        title, body = self._method_fields(data)

        def apply(cur, db):
            if cur["deleted_at"]:
                raise Invalid("restore it before editing")
            ch = {}
            if body != cur["body"]:
                ch["body"] = body
            if title != cur["title"]:
                ch["title"] = title
            return ch or None
        return self._change("method", row_id, data.get("base_rev"), "edit", apply)

    def deleted(self):
        """Deleted rows, newest first, so they can be restored."""
        titles = {r[0]: r[1] for r in self.lib.execute("SELECT urn, title FROM work")}
        out = []
        with self.session() as db:
            for public, table in TABLES.items():
                kind = "kind" if table == "user_note" else "'translation' AS kind"
                for r in db.execute(f"SELECT *, {kind} FROM {table} WHERE deleted_at IS NOT NULL"):
                    r = dict(r)
                    r["table"] = public
                    r["title"] = titles.get(r["work_urn"], r["work_urn"])
                    out.append(r)
        return sorted(out, key=lambda r: r["deleted_at"], reverse=True)

    # -------------------------------------------------- export

    def all_rows(self, include_deleted=False):
        out = []
        with self.session() as db:
            for public, table in TABLES.items():
                kind = "kind" if table == "user_note" else "'translation' AS kind"
                q = f"SELECT *, {kind} FROM {table}" + ("" if include_deleted else " WHERE deleted_at IS NULL")
                for r in db.execute(q):
                    r = dict(r)
                    r["table"] = public
                    if include_deleted:
                        r["revisions"] = [dict(x) for x in db.execute(
                            "SELECT rev, event, label, kind, body, saved_at FROM revision WHERE table_name = ? AND row_id = ? ORDER BY rev, id", (table, r["id"]))]
                    out.append(r)
        return out

    def _sorted_by_work(self, rows):
        works = {r[1]: {"id": r[0], "urn": r[1], "title": r[2]} for r in self.lib.execute("SELECT id, urn, title FROM work")}
        orders = {}
        groups = {}
        for r in rows:
            w = works.get(r["work_urn"], {"id": None, "urn": r["work_urn"], "title": r["work_urn"]})
            if w["id"] not in orders:
                orders[w["id"]] = self.section_order(w["id"]) if w["id"] else {}
            o = orders[w["id"]]
            r["_key"] = (o.get(r["start_ref"], 1e9), r["word_start"] or 0, o.get(r["end_ref"], 1e9), r["word_end"] or 1e9,
                         r["table"] != "translation", r["id"])
            groups.setdefault(w["urn"], (w, []))[1].append(r)
        out = []
        for urn, (w, rs) in sorted(groups.items(), key=lambda g: g[1][0]["id"] or "~"):
            rs.sort(key=lambda r: r["_key"])
            for r in rs:
                r.pop("_key")
            out.append((w, rs))
        return out

    # -------------------------------------------------- proofreading (milestone 7)

    def _imported(self, note_key):
        r = self.lib.execute("SELECT body FROM note WHERE note_key = ?", (note_key,)).fetchone()
        if not r:
            raise NotFound(note_key)
        return r[0]

    def proof_marks(self, keys):
        """{note key: your newest mark, with 'changed' if the imported text is not what you marked}."""
        keys = [k for k in keys if k]
        if not keys:
            return {}
        out = {}
        with self.session() as db:
            for i in range(0, len(keys), 500):
                part = keys[i:i + 500]
                rows = db.execute(
                    f"SELECT p.* FROM proofreading p JOIN (SELECT note_key, max(id) AS id FROM proofreading "
                    f"WHERE note_key IN ({','.join('?' * len(part))}) GROUP BY note_key) m ON m.id = p.id", part).fetchall()
                out.update({r["note_key"]: dict(r) for r in rows})
        for k, r in out.items():
            try:
                r["changed"] = r["imported_sha"] != hashlib.sha256(self._imported(k).encode("utf-8")).hexdigest()
            except NotFound:
                r["changed"] = True
        return out

    def proof_history(self, note_key):
        with self.session() as db:
            return [dict(r) for r in db.execute("SELECT * FROM proofreading WHERE note_key = ? ORDER BY id", (note_key,))]

    def add_proof(self, data):
        key = data.get("note_key")
        if not isinstance(key, str) or not key:
            raise Invalid("note_key is required")
        body = self._imported(key)
        status = data.get("status")
        if status not in PROOF_STATUSES:
            raise Invalid(f"status must be one of {', '.join(PROOF_STATUSES)}")
        corrected = data.get("corrected")
        if corrected is not None:
            if not isinstance(corrected, str) or len(corrected) > MAX_BODY:
                raise Invalid("corrected must be text")
            corrected = corrected.replace("\r\n", "\n")
            if corrected.strip() == body.strip() or not corrected.strip():
                corrected = None
        comment = data.get("comment")
        if comment is not None and not isinstance(comment, str):
            raise Invalid("comment must be text")
        with self.session() as db:
            db.execute("INSERT INTO proofreading (note_key, status, corrected, comment, imported_sha, saved_at) VALUES (?,?,?,?,?,?)",
                       (key, status, corrected, (comment or "").strip() or None,
                        hashlib.sha256(body.encode("utf-8")).hexdigest(), now()))
        return self.proof_marks([key])[key]

    # -------------------------------------------------- marks on the modern versions (milestone 24)

    @staticmethod
    def _modern(text_id):
        if not isinstance(text_id, str) or not text_id.replace("-", "").isalnum():
            raise Invalid("text is required")
        p = MODERN / f"{text_id}.json"
        if not p.exists():
            raise NotFound(text_id)
        return json.loads(p.read_text(encoding="utf-8"))

    def modern_marks(self, text_id):
        """Your newest mark on each sentence of one modern version, withdrawn ones left out,
        with 'changed' where the sentence no longer reads as you marked it."""
        d = self._modern(text_id)
        now_text = {p["seg"]: p["modern"] for p in d["paragraphs"]}
        with self.session() as db:
            rows = db.execute("SELECT m.* FROM modern_mark m JOIN (SELECT para, sentence, max(id) AS id FROM modern_mark "
                              "WHERE text_id = ? GROUP BY para, sentence) n ON n.id = m.id ORDER BY m.id", (text_id,)).fetchall()
        out = []
        for r in rows:
            if r["kind"] == "withdrawn":
                continue
            out.append({**dict(r), "changed": r["sentence"] not in now_text.get(r["para"], "")})
        return out

    def add_modern_mark(self, data):
        d = self._modern(data.get("text"))
        para, sentence = data.get("para"), data.get("sentence")
        paras = {p["seg"]: p["modern"] for p in d["paragraphs"]}
        if para not in paras:
            raise Invalid("para must be a paragraph of the modern version")
        if not isinstance(sentence, str) or not sentence.strip() or sentence not in paras[para]:
            raise Invalid("sentence must be a sentence of that paragraph, as it reads now")
        kind = data.get("kind")
        if kind not in MODERN_KINDS:
            raise Invalid(f"kind must be one of {', '.join(MODERN_KINDS)}")
        comment = data.get("comment")
        if comment is not None and (not isinstance(comment, str) or len(comment) > 10_000):
            raise Invalid("comment must be text")
        with self.session() as db:
            db.execute("INSERT INTO modern_mark (text_id, para, sentence, kind, comment, saved_at) VALUES (?,?,?,?,?,?)",
                       (d["text"], para, sentence, kind, (comment or "").strip() or None, now()))
        return {"text": d["text"], "marks": self.modern_marks(d["text"])}

    def all_modern_marks(self):
        with self.session() as db:
            return [dict(r) for r in db.execute("SELECT * FROM modern_mark ORDER BY id")]

    def all_proofreading(self):
        with self.session() as db:
            return [dict(r) for r in db.execute("SELECT * FROM proofreading ORDER BY id")]

    def export_json(self):
        rows = self.all_rows(include_deleted=True)
        return {
            "exported_at": now(),
            "schema_version": SCHEMA_VERSION,
            "about": "Your translations and notes from the Platonic Workshop, with every revision. "
                     "Anchors: work URN, Stephanus sections, word numbers within the section (null = whole section), and the Greek words.",
            "works": [{"urn": w["urn"], "title": w["title"], "items": rs} for w, rs in self._sorted_by_work(rows)],
            "word_studies": [{**r, "revisions": self.history("study", r["id"])} for r in self.studies(include_deleted=True)],
            "proofreading": self.all_proofreading(),
            "modern_marks": self.all_modern_marks(),
            "reconciliations": [{**r, "revisions": [{**v, "sheet": json.loads(v["body"])} for v in self.history("reconciliation", r["id"])]}
                                for r in self.sheets(include_deleted=True)],
            "methods": [{**r, "revisions": self.history("method", r["id"])} for r in self.user_methods(include_deleted=True)],
        }

    def export_markdown(self):
        rows = self.all_rows()
        lines = [f"# Your work on Plato", "",
                 f"Exported {now()} from the Platonic Workshop. "
                 f"Translations: {sum(r['table'] == 'translation' for r in rows)}. "
                 f"Notes: {sum(r['table'] == 'note' for r in rows)}. Deleted items and earlier versions are in the JSON export.", ""]
        for w, rs in self._sorted_by_work(rows):
            lines += [f"## {w['title']}", "", f"`{w['urn']}`", ""]
            last_anchor = None
            for r in rs:
                anchor = (r["start_ref"], r["word_start"], r["end_ref"], r["word_end"])
                if anchor != last_anchor:
                    lines += [f"### {span_label(r)}", ""]
                    if r["words"]:
                        lines += ["> " + r["words"], ""]
                    last_anchor = anchor
                head = {"translation": "Translation", "footnote": "Footnote", "note": "Note", "alternative": "Alternative rendering"}[r["kind"]]
                lines += [f"**{head}**{' · ' + r['label'] if r.get('label') else ''} · revision {r['rev']}, {r['updated_at'][:10]}", ""]
                body = r["body"].rstrip()
                if r["format"] == "markdown":
                    body = prefix_footnotes(body, f"{r['table'][0]}{r['id']}-")
                else:
                    body = "\n".join(line + "  " for line in body.splitlines())
                lines += [body, ""]
        studies = self.studies()
        if studies:
            lines += ["## Word studies", ""]
            for r in studies:
                where = ", ".join(r["works"]) if r["works"] else "all of Plato"
                lines += [f"### {r['title']}", "",
                          f"Search: `{r['query']}` by {r['by']}{' (' + ', '.join(r['terms']) + ')' if r['terms'] else ''}, in {where} · "
                          f"revision {r['rev']}, {r['updated_at'][:10]}", ""]
                if r["body"].strip():
                    lines += [prefix_footnotes(r["body"].rstrip(), f"s{r['id']}-"), ""]
        own_methods = self.user_methods()
        if own_methods:
            lines += ["## Your interpretive methods", ""]
            for r in own_methods:
                lines += [f"### {r['title']}", "", r["plain"].rstrip(), "", f"Citation: {r['citation'].strip()}", ""]
        sheets = self.sheets()
        if sheets:
            lines += ["## Reconciliations", ""]
            for r in sheets:
                lines += sheet_markdown({**r, "_own_methods": {m["id_ref"]: m["title"] for m in own_methods}}, self.lib, prefix=f"r{r['id']}-")
        corrections = [r for r in self.proof_marks(sorted({p["note_key"] for p in self.all_proofreading()})).values()
                       if r["corrected"] or r["comment"]]
        if corrections:
            lines += ["## Your corrections to the commentaries", ""]
            for r in sorted(corrections, key=lambda r: r["note_key"]):
                lines += [f"### {r['note_key']} · {r['status']}, {r['saved_at'][:10]}", ""]
                if r["comment"]:
                    lines += [r["comment"], ""]
                if r["corrected"]:
                    lines += [r["corrected"].rstrip(), ""]
        marks = []
        for text_id in sorted({r["text_id"] for r in self.all_modern_marks()}):
            try:
                marks += [(text_id, r) for r in self.modern_marks(text_id)]
            except NotFound:
                continue
        if marks:
            lines += ["## Sentences you marked in the modern English versions", ""]
            for text_id, r in marks:
                lines += [f"- **{r['kind']}** · {text_id} {r['para'].rsplit('.', 1)[-1]} · {r['saved_at'][:10]}"
                          f"{' · revised since' if r['changed'] else ''}: {r['sentence']}"
                          + (f"  \n  {r['comment']}" if r["comment"] else "")]
            lines += [""]
        return "\n".join(lines).rstrip() + "\n"

    def export_sqlite(self, dest):
        src = sqlite3.connect(self.path)
        out = sqlite3.connect(dest)
        try:
            src.backup(out)
        finally:
            out.close()
            src.close()


SHEET_HEADS = {"contradiction": "The contradiction", "dictionary": "Dictionary evidence", "commentary": "Commentary",
               "interpretation": "Your interpretation", "rendering": "Your reconciled translation", "references": "References"}


def sheet_markdown(r, lib, prefix="", level=3):
    """One reconciliation worksheet as Markdown (the export and the reader's 'copy as Markdown')."""
    sh = r["sheet"]
    titles = {a: b for a, b in lib.execute("SELECT id, title FROM work")}
    methods = {a: b for a, b in lib.execute("SELECT id, name FROM reconcile_method")}
    methods.update(r.get("_own_methods") or {})
    h = "#" * level
    lines = [f"{h} {r['title']}", "",
             f"{'Your proposal' if sh.get('status') == 'proposal' else 'Work in progress'} · revision {r['rev']}, {r['updated_at'][:10]}"
             + (f" · on the tension “{r['tension_id']}”" if r.get("tension_id") else ""), ""]
    if sh.get("passages"):
        lines += ["Passages: " + "; ".join(f"{titles.get(p['work'], p['work'])} {p['start_ref']}" + (f"–{p['end_ref']}" if p["end_ref"] != p["start_ref"] else "")
                                           for p in sh["passages"]), ""]
    if sh.get("methods"):
        lines += ["Methods: " + ", ".join(methods.get(m, m) for m in sh["methods"]), ""]
    for k in SHEET_TEXT:
        if (sh.get(k) or "").strip():
            lines += [f"**{SHEET_HEADS[k]}**", "", prefix_footnotes(sh[k].rstrip(), prefix + k[0]) if prefix else sh[k].rstrip(), ""]
    return lines


def span_label(r):
    """'29e', '29e–30a', '29e 3–12', '29e 3 – 30a 4' (section and word numbers)."""
    a, b, ws, we = r["start_ref"], r["end_ref"], r["word_start"], r["word_end"]
    if ws is None:
        return a if a == b else f"{a}–{b}"
    if a == b:
        return f"{a} {ws}" if ws == we else f"{a} {ws}–{we}"
    return f"{a} {ws} – {b} {we}"


def prefix_footnotes(body, prefix):
    """Make Markdown footnote labels unique in an export of many texts:
    [^1] and [^1]: become [^t12-1] and [^t12-1]:."""
    import re
    return re.sub(r"\[\^([^\]\s]+)\]", lambda m: f"[^{prefix}{m.group(1)}]", body)


if __name__ == "__main__":
    import argparse
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import build_db
    ap = argparse.ArgumentParser(description="Export your translations and notes.")
    ap.add_argument("format", choices=["md", "json", "sqlite"])
    ap.add_argument("out", help="file to write")
    args = ap.parse_args()
    lib = sqlite3.connect(f"file:{build_db.DB_PATH}?mode=ro", uri=True)
    mw = MyWork(build_db.USER_DB_PATH, lib)
    if args.format == "md":
        Path(args.out).write_text(mw.export_markdown(), encoding="utf-8")
    elif args.format == "json":
        Path(args.out).write_text(json.dumps(mw.export_json(), ensure_ascii=False, indent=1), encoding="utf-8")
    else:
        mw.export_sqlite(args.out)
    print(f"wrote {args.out}")
