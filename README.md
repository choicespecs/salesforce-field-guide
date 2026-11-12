# Salesforce Field Guide

A reference for the Salesforce platform, for admins and developers. Each chapter is its own page with worked examples.

**Live site:** https://choicespecs.github.io/salesforce-field-guide/

## Chapters

| Group | Pages |
|---|---|
| Foundations | Platform fundamentals · Data model · Formulas & validation rules · Security & sharing |
| Administration | Admin essentials · Reports & dashboards · Sales & Service processes |
| Automation | Flow · Order of execution |
| Apex | Apex language · Triggers · Asynchronous Apex · Testing Apex |
| Data access | SOQL & SOSL · Governor limits & performance |
| User interface | Lightning Web Components |
| Integration | APIs & callouts · Platform Events & CDC |
| Delivery | DevOps & the sf CLI |
| Products | Product catalog · Agentforce & Data 360 |
| Reference | Which one do I pick? · Errors & gotchas · Glossary · Docs & certifications |

Every page has the chapter list, an "On this page" list of its sections, previous/next links, and a search box (press `/`) that searches all pages.

## How it's built

Static HTML with no build step. GitHub Pages serves the `main` branch root.

- `*.html`: one file per chapter. Each contains only `<main class="content">…</main>`.
- `assets/site.js`: adds the top bar, chapter nav (the `CHAPTERS` list), "On this page", previous/next links, code-block formatting, Mermaid diagrams, and search.
- `assets/style.css`: all styles, with light and dark themes.
- `assets/search-index.js`: generated search data.

### Editing

- **Code samples** go in `<script type="text/plain" data-lang="apex" data-title="Optional caption">…</script>`, so you don't need to escape `<` or `&`. Languages: `apex`, `soql`, `sosl`, `js`, `html`, `xml`, `json`, `bash`, `yaml`, `formula`, `text`.
- **Diagrams** go in `<div class="diagram"><pre class="mermaid">…</pre></div>`.
- **New chapter**: copy an existing page, change its `<title>`, description and `data-page`, then add it to `CHAPTERS` in `assets/site.js`.
- **After any content change**, rebuild search: `python3 tools/build-search-index.py`.
- Preview locally with `python3 -m http.server` and open http://localhost:8000.

Content reflects the platform as of late 2026. This is an independent study aid, not affiliated with Salesforce. When it disagrees with the official docs, trust the docs.
