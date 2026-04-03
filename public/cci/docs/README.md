# CCI Temporary Splash Content System

This repo currently serves a single highlighted experience (`index.html`). The textual content for the hero, services, panels, quote, and contact sections is authored in `content.md`, which acts like a lightweight content management file that the site loads at runtime.

## How `content.md` is structured

Each block in `content.md` begins with a heading that follows the pattern `#SectionKey.SubKey`. The most common prefixes are:

- `Hero`: controls the hero title, description, and each stat card (e.g., `Hero.Title`, `Hero.Stats.01`).
- `Panel`: handles the major panels (About, Mission, Process, Services, Quote, Donate, Contact). Nested keys such as `Panel.Services.Article1` map to individual service cards.

Each section uses `Heading:` and/or `Text:` fields. For example:

```
#Panel.Services.Article1
Heading: Strategic Planning
Text: Equity-aligned roadmaps for municipal agencies.
```

The parser ignores blank lines and expects each block to continue until another `#` heading appears.

## How the site loads the content

`load-content.js` runs on DOMContentLoaded and attempts to `fetch("content.md")`.
- If the fetch succeeds, it caches the raw markdown in `localStorage` under `cci-content-cache` and parses it.
- If the fetch fails, it falls back to the cached markdown so the page still renders.

The parsed content is stored as a dictionary keyed by the block heading (e.g., `Panel.Services.Article1`). Each element in the DOM with a `data-content-key` attribute is populated by looking up the corresponding entry and copying the requested field (e.g., `heading` or `text`).

## Adding new content

1. Add a new block to `content.md` with a new key and the necessary `Heading:`/`Text:` lines.
2. In `index.html`, add `data-content-key="SectionKey.Field"` to the element you want to populate.
3. The loader automatically applies the text when the page loads.

## Caching notes

Results are cached in `localStorage` so if the markdown fetch fails (or you work offline), the latest successful payload still loads. Delete the `cci-content-cache` entry in developer tools if you need to force a refresh.
