# Glass Bridge - portable synthetic prototype

**Status: visual exploration only; synthetic data throughout.** This portable
static bundle is not the approved Phase One CRM demonstration, production
software, or acceptance of the proposal. It has no backend, package runtime,
CDN, external fonts, CRM calls, persistence, contact workflow, or transactions.

Generated-by: algo-enforcers technical executor (GPT-6 Luna)  
Coordinator: aliza-agent - packaging update, 2026-10-22.

## Run the static page

Extract the archive so it creates a `glass-bridge/` directory. From the
directory containing that folder, start a loopback-only static server:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765/glass-bridge/>. Stop the server with Ctrl-C when
finished. Do not bind it to a public interface. The page also opens directly
from `index.html`; a local HTTP server is useful for checking the nested URL
and the bundled documentation links.

The bundle is self-contained and includes only:

- `index.html` - prototype page;
- `styles.css` and `app.js` - local page assets;
- `README.md` - these notes, linked from the page footer;
- `public-data-notes.md` - separately labeled public-source context, linked
  from the page.

All runtime asset and in-bundle documentation links are relative. Markdown may
be rendered as text or downloaded depending on the static server/browser; it
does not need to be an application route.

## What the page does

- Switches between possible provider and recipient views. The fixed starting
  businesses are Riverbend Materials Demo and Meadow Loop Demo.
- Offers optional business/ZIP substring search and exact glass-type, city,
  and transport-annotation filters. Filters combine with AND; clearing or
  changing direction restores the clear-container default.
- Shows invented quantities and annotations, fixture-order results (not a
  ranking), local details, and an explicit staff-review caveat. It computes no
  score, distance, suitability, availability, or transport commitment.

The layout uses a responsive two-panel desktop view and a single-column mobile
view. Public recycling context is separate from the invented candidate
fixtures and does not establish supply, demand, facility eligibility, or
commercial acceptance.

## Data and approval boundaries

All eight business names, records, roles, quantities, specifications, and
transport annotations in `app.js` are invented. Familiar city and ZIP labels
are illustrative only, not measured coverage. There is no backend, database,
network request, CRM adapter, or outbound action. No credentials or customer
records belong in this bundle.

The public Maximizer field examples described here are not tenant-verified
schema: `AbEntry.CompanyName` and nested address properties are candidate
public-document mappings only. `demo-*` identifiers are local demo IDs, not
CRM keys. No API request is implemented. See
[`public-data-notes.md`](public-data-notes.md) for the separate public recycling
references and their limitations.

This archive is a portable handoff artifact, **not authorization to host or
deploy it**. Phase One documents remain drafts; any temporary demonstration
access must be limited to staff reviewers and the exact address confirmed.
Hosting and access details remain undecided. A person must independently
confirm whether any surfaced candidate is real, suitable, and workable.
