#!/usr/bin/env python3
"""Rebuild assets/search-index.js from the HTML pages.

Run from the repo root after editing any page:  python3 tools/build-search-index.py
Each page is split into sections at <h2> headings; section ids match the ones assets/site.js
generates, so search results can link straight to a heading.
"""
import glob, html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def text(s):
    s = re.sub(r'<script(?![^>]*type="text/plain")[^>]*>.*?</script>', ' ', s, flags=re.S)
    s = re.sub(r'<style\b.*?</style>', ' ', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def slug(s):
    s = s.lower().replace('&', 'and')
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', s))


pages = []
for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    src = open(path, encoding='utf-8').read()
    m = re.search(r'<main class="content">(.*)</main>', src, re.S)
    if not m:
        continue
    main = m.group(1)
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', main, re.S)
    title = text(h1.group(1)) if h1 else os.path.basename(path)
    parts = re.split(r'(<h2[^>]*>.*?</h2>)', main, flags=re.S)
    sections = []
    for i in range(1, len(parts), 2):
        h = text(parts[i])
        idm = re.search(r'id="([^"]+)"', parts[i])
        sections.append({'id': idm.group(1) if idm else slug(h), 'h': h, 't': text(parts[i + 1]).lower()[:6000]})
    pages.append({'url': os.path.basename(path), 'title': title,
                  'intro': text(parts[0]).lower()[:2000], 'sections': sections})

out = os.path.join(ROOT, 'assets', 'search-index.js')
with open(out, 'w', encoding='utf-8') as f:
    f.write('window.SEARCH_INDEX=' + json.dumps(pages, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f'{len(pages)} pages, {sum(len(p["sections"]) for p in pages)} sections -> {os.path.relpath(out, ROOT)}')
