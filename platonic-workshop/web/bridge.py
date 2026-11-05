"""Answer the reader's requests inside the browser with tools/serve.py itself.

The browser hands each request here as bytes; serve.Handler reads it from a
pretend socket and writes its reply to another, exactly as on the laptop.
"""
import io
import json
import sys
from urllib.parse import quote

HOST = "127.0.0.1:8800"
serve = None


def setup(tools="/workshop/tools", db="/workshop/data/workshop.sqlite", user="/mine/user.sqlite"):
    """Open the library and your work, as tools/serve.py does on the laptop."""
    global serve
    sys.path.insert(0, tools)
    import build_db
    import serve as _serve
    build_db.ensure_user_db(user)
    _serve.Handler.library = _serve.Library(db, user)
    serve = _serve


class _Server:
    server_address = ("127.0.0.1", 8800)
    verbose = False


class _Socket:
    def __init__(self, request):
        self.inp = io.BytesIO(request)
        self.out = io.BytesIO()

    def makefile(self, mode, *args, **kwargs):
        return self.inp

    def sendall(self, b):
        self.out.write(b)


def handle(method, path, headers_json, body):
    body = body.encode("utf-8") if isinstance(body, str) else bytes(body)
    headers = {k: v for k, v in json.loads(headers_json).items() if k.lower() not in ("host", "origin", "content-length")}
    path = quote(path, safe="/?&=%:,;+@!$'()*~#")   # already escaped by the browser; this is for anything else
    lines = [f"{method} {path} HTTP/1.0", f"Host: {HOST}", f"Content-Length: {len(body)}"]
    lines += [f"{k}: {v}" for k, v in headers.items()]
    sock = _Socket(("\r\n".join(lines) + "\r\n\r\n").encode("latin-1") + body)
    serve.Handler(sock, ("127.0.0.1", 0), _Server())
    raw = sock.out.getvalue()
    head, _, payload = raw.partition(b"\r\n\r\n")
    head = head.decode("latin-1").split("\r\n")
    status = int(head[0].split()[1])
    out = {}
    for line in head[1:]:
        k, _, v = line.partition(":")
        out[k.strip()] = v.strip()
    return status, json.dumps(out), payload
