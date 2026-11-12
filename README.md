# Salesforce Field Guide

A single-page study reference for the Salesforce platform, for admins and developers.

**Live site:** https://choicespecs.github.io/salesforce-field-guide/

## What's inside

1. **Start here**: a six-week learning path with admin and developer tracks
2. **Mental model**: multi-tenancy, metadata, orgs, sandboxes, scratch orgs
3. **Data model**: core CRM objects, relationship types, field types, `__c` / `__r` / `__mdt` suffixes
4. **Security & sharing**: profiles, permission sets, OWD, role hierarchy, sharing rules, debugging access
5. **Automation & Flow**: flow types, validation rules, best practices
6. **Order of execution**
7. **Apex**: basics, trigger handler pattern, async Apex, tests
8. **SOQL & SOSL**: tabbed examples, differences from SQL
9. **Governor limits**: table plus bulkification before/after
10. **Lightning Web Components**: a full component with Apex and metadata
11. **Integration**: APIs, events, Named Credentials, OAuth flows
12. **DevOps & the sf CLI**: project layout, deployment options, command cheat sheet
13. **Product catalog**: ~40 clouds and features, searchable and filterable
14. **Which one do I pick?**: decision tables
15. **Gotchas & common errors**
16. **Self-check quiz**
17. **Certifications & resources**
18. **Glossary** (searchable)

Chapter progress, quiz answers, and theme are saved in your browser's localStorage.

## Editing

Everything lives in `index.html` (no build step). Data arrays are in the script at the bottom: `SNIP` (code samples), `SOQL`, `LIMITS`, `PLAN`, `CAT` (catalog), `DEC` (decision tables), `GOTCHAS`, `QUIZ`, `GL` (glossary). Push to `main` and GitHub Pages republishes.

Content reflects the platform as of late 2026. This is an independent study aid, not affiliated with Salesforce. When it disagrees with the official docs, trust the docs.
