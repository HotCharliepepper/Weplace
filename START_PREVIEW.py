#!/usr/bin/env python3
"""Serve the bundled review build on localhost; no deployment or app API."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse


def main():
    parser = argparse.ArgumentParser(description="Open the Weplace static review build locally.")
    parser.add_argument("--port", type=int, default=4173)
    parser.add_argument("--concept", action="store_true", help="Open the ZIP-only, unapproved diagnosis concept instead of the public build.")
    args = parser.parse_args()
    public = Path(__file__).resolve().parent / ("local-concept" if args.concept else "dist")
    if not (public / "index.html").is_file():
        parser.error("The local concept is included only in the private handoff ZIP." if args.concept else "dist/index.html is missing. Run npm ci, then npm run build.")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(SimpleHTTPRequestHandler, directory=str(public)))
    label = "LOCAL CONCEPT - unapproved offer" if args.concept else "Weplace review"
    print(f"{label}: http://127.0.0.1:{args.port}/", flush=True)
    print("Press Ctrl+C to stop. This serves local static files only.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
