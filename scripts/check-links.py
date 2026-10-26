#!/usr/bin/env python3
"""Check deployed static paths, fragments, CSS assets, sitemap and Netlify routes.

No HTTP calls are made. External links and external redirect destinations are
reported as unverified, never claimed to be live. Exit 1 means a local defect.
"""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.inline_css = set(), [], []
        self.style = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'a' and attrs.get('name'):
            self.ids.add(attrs['name'])
        for attr in ('href', 'src', 'poster'):
            if attrs.get(attr):
                self.refs.append((attrs[attr], 'anchor' if tag == 'a' else 'asset'))
        if attrs.get('srcset') and not attrs['srcset'].startswith('data:'):
            self.refs.extend((part.strip().split()[0], 'asset') for part in attrs['srcset'].split(',') if part.strip())
        if attrs.get('style'):
            self.inline_css.append(attrs['style'])
        if tag == 'style':
            self.style = True

    def handle_endtag(self, tag):
        if tag == 'style':
            self.style = False

    def handle_data(self, data):
        if self.style:
            self.inline_css.append(data)


def css_refs(text):
    return [m.group(1).strip(' \t\r\n\"\'') for m in re.finditer(r'url\(([^)]+)\)', text) if not m.group(1).strip(' \t\r\n\"\'').startswith('#')]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('root', nargs='?', default='.')
    ap.add_argument('--json', action='store_true')
    args = ap.parse_args()
    root = Path(args.root).resolve()
    # The source tree and an explicitly supplied dist root are separate targets.
    # Never count a nested generated copy as another set of source pages.
    excluded_dirs = {'.git', 'node_modules', 'dist', '.netlify', '.next'}
    files = sorted(p for p in root.rglob('*') if p.is_file() and not excluded_dirs.intersection(p.relative_to(root).parts[:-1]))
    documents = {p: Document(p.read_text()) for p in files if p.suffix == '.html'}
    rules = []
    redirects = root / '_redirects'
    if redirects.exists():
        for line in redirects.read_text().splitlines():
            fields = line.split()
            if len(fields) >= 2 and not line.lstrip().startswith('#'):
                rules.append((fields[0], fields[1], fields[2] if len(fields) > 2 else '301'))
    problems, external, routed = [], set(), set()
    count = 0

    def route(path):
        for source, target, status in rules:
            regex = '^' + re.escape(source).replace(r'\*', '(.*)') + '$'
            match = re.match(regex, path)
            if match:
                return target.replace(':splat', match.group(1) if match.groups() else ''), status
        return None

    def resolve(path):
        local = root / path.lstrip('/')
        if local.is_file():
            return local
        if (local / 'index.html').is_file():
            return local / 'index.html'
        if not local.suffix and local.with_suffix('.html').is_file():
            return local.with_suffix('.html')
        return None

    def check(source, ref, kind):
        nonlocal count
        parts = urlsplit(ref)
        if not ref or parts.scheme in ('data', 'mailto', 'tel', 'javascript', 'blob'):
            return
        count += 1
        if parts.netloc and parts.netloc not in ('withweplace.kr', 'www.withweplace.kr', 'weplace.netlify.app'):
            external.add(ref)
            return
        source_url = '/' + source.relative_to(root).as_posix()
        if source_url.endswith('/index.html'):
            source_url = source_url[:-10]
        joined = urlsplit(urljoin('https://withweplace.kr' + source_url, ref))
        path = unquote(joined.path or '/')
        fragment = unquote(joined.fragment)
        dest = resolve(path)
        match = route(path)
        if match and (not dest or match[1].endswith('!')):
            target, status = match
            routed.add((path, target, status))
            if urlsplit(target).netloc:
                external.add(target)
                return
            dest = resolve(urlsplit(target).path)
        if not dest:
            problems.append({'source': source.relative_to(root).as_posix(), 'ref': ref, 'kind': kind, 'problem': 'missing_path'})
        elif fragment and kind == 'anchor' and dest.suffix == '.html' and fragment not in documents[dest].ids:
            problems.append({'source': source.relative_to(root).as_posix(), 'ref': ref, 'kind': kind, 'problem': 'missing_fragment'})

    for path, doc in documents.items():
        for ref, kind in doc.refs:
            check(path, ref, kind)
        for ref in css_refs('\n'.join(doc.inline_css)):
            check(path, ref, 'css_asset')
    for path in files:
        if path.suffix == '.css':
            for ref in css_refs(path.read_text()):
                check(path, ref, 'css_asset')
    sitemap = root / 'sitemap.xml'
    if sitemap.exists():
        for loc in ET.parse(sitemap).findall('.//{*}loc'):
            if loc.text:
                check(sitemap, loc.text, 'sitemap')
    report = {
        'scope': 'All tracked-tree HTML, CSS url(), sitemap URLs; no network probes or JavaScript execution.',
        'html_documents': len(documents), 'references_checked': count,
        'defects': problems, 'defect_count': len(problems),
        'external_urls_not_probed': len(external),
        'recognized_redirects': [dict(zip(('path', 'target', 'status'), row)) for row in sorted(routed)],
    }
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(f"HTML: {len(documents)} | references: {count} | local defects: {len(problems)} | external URLs not probed: {len(external)}")
        for p in problems:
            print(f"{p['problem']}: {p['source']} → {p['ref']}")
        for source, target, status in sorted(routed):
            print(f"redirect {status}: {source} → {target}")
    return bool(problems)


if __name__ == '__main__':
    raise SystemExit(main())
