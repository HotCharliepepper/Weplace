#!/usr/bin/env python3
"""Serve the bundled review build on localhost; no deployment or app API."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse


def main():
    parser = argparse.ArgumentParser(description="Open the Weplace R4 static review build locally.")
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    public = Path(__file__).resolve().parent / "dist"
    if not (public / "index.html").is_file():
        parser.error("dist/index.html is missing. Run npm ci, then npm run build.")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(SimpleHTTPRequestHandler, directory=str(public)))
    print(f"Weplace R4 review: http://127.0.0.1:{args.port}/", flush=True)
    print("Press Ctrl+C to stop. This serves local static files only.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
