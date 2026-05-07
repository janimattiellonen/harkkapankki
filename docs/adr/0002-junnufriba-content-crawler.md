# 0002. Junnufriba content acquisition via offline crawler

- **Status:** Accepted
- **Date:** 2025-10-07 (decision made), retroactively documented 2026-05-07
- **Deciders:** janimattiellonen
- **Related:** PR #16 (initial), PR #20 (multi-source + tests), spec at `docs/14 - Junnufriba crawler.txt`

## Context

Harkkapankki's exercise catalogue needs to be populated with high-quality
content. The natural source is `junnufriba.fi` — the existing public site
that hosts the youth coaching material this project is eventually intended
to extend / hand over to (see `memory/project_purpose_and_vision.md`).

That site publishes exercises as static HTML pages with a consistent shape:

- Title in `<header class="entry-header">` → `<h1 class="entry-title">`
- Body in `<div class="entry-content">` consisting of `<h3>`, `<p>`, ad-hoc
  bullet lists made from `<p>` + `•`, embedded YouTube `<iframe>`s, and
  images.

There were ~30 exercises to import initially, with more arriving over time.
Manual entry was on the table. So was building an in-app importer. The
deciding question was: where does this code live, and how do we keep
imported content reproducible?

Constraints:

- The project stores exercise body as **markdown**, not HTML, with a custom
  YouTube tag (`@[youtube](url)`) the renderer already supports.
- Images need to be persisted locally (`public/uploads/`) so we are not
  hot-linking to junnufriba.fi.
- Re-runs must be auditable — if we re-import a page we want to see what
  changed, not silently overwrite.
- The web app must not gain a public scraping surface (no reason to expose
  HTTP fetch from a user-facing route).

## Decision

We built a **standalone Node/TypeScript crawler** under `scripts/crawler/`,
separate from the React Router app, that:

1. Accepts three input shapes — HTML file path, URL, or `.txt` list — and
   delegates dispatch to `input-source.ts`.
2. Parses HTML via `cheerio` in `parse-html.ts`, converting to markdown:
   `<h3>` → `##`, ad-hoc `•` bullets → real markdown lists, YouTube iframes
   → `@[youtube](url)` tags.
3. Downloads images to a timestamped output directory and rewrites
   references to `/public/uploads/...`.
4. Writes a `content.json` (array of `{ header, body, exerciseTypeId }`)
   plus a human-readable `content.md` to
   `docs/junnufriba-crawler/parsed-data/<timestamp>/`.
5. A **separate** script, `scripts/insert-content.ts`, reads that
   `content.json` and inserts into the database. Parsing and insertion are
   intentionally split so we can review the parse output before touching
   the DB.

## Alternatives considered

- **Manual entry through the web app's exercise form.** Rejected: ~30
  exercises with markdown bodies and embedded videos is hours of
  copy/paste, with high risk of drift from the source. Also doesn't scale
  to future re-imports.
- **In-app admin importer (web UI that fetches a URL).** Rejected: adds
  scraping capability to a public-facing app — attack surface, SSRF risk,
  and UI for a workflow that runs maybe once a quarter.
- **Hardcoded seed scripts with content inlined.** Rejected: divorces
  imported content from its source URL; updating an exercise upstream means
  hand-editing the seed, defeating the point.
- **Headless browser (Puppeteer / Playwright).** Rejected: junnufriba.fi
  serves static HTML — no JS execution required. Pulling in a headless
  browser was disproportionate.
- **Single combined parse-and-insert script.** Rejected: review-before-insert
  is the whole reason the timestamped output directory exists. Splitting
  into two scripts also makes it possible to re-run insertion against an
  older parse without re-fetching.

## Consequences

### Positive

- Imports are **reproducible and auditable** — every run leaves a
  timestamped directory you can diff against the previous one. The folder
  listing under `docs/junnufriba-crawler/parsed-data/` is now a de-facto
  log of when content was pulled.
- The web app stays free of crawling/HTTP-fetch code and the security
  concerns that come with it.
- Splitting parse from insert lets us hand-review the markdown output
  before any DB writes.
- The three input shapes (file / URL / list) cover one-off debugging,
  single-page imports, and bulk runs without branching the script's public
  surface.

### Negative / costs

- Two separate scripts means two `npx tsx` invocations to import a page —
  small but real friction.
- The parser is **coupled to junnufriba.fi's HTML structure**. If they
  redesign, the crawler breaks; we own that maintenance. Selectors are
  centralised in `parse-html.ts`, so a redesign is a one-file fix in
  practice.
- Images are downloaded to `public/uploads/` at insert time — the script
  has filesystem write access to a public directory, which means a
  malformed source URL could in principle write outside the intended path.
  This is mitigated in `unique-filename.ts` but is worth knowing.
- The crawler ships in the repo even though it's not part of the deployed
  app. Acceptable cost given it's the only way to onboard content; the
  alternative (separate repo) is heavier than the problem warrants.

### Neutral / follow-ups

- A later fix (PR #32, commit `2c1f415`) added a `featured-media` fallback
  for image imports and a `public/uploads` sync step — see commit message
  rather than amending this ADR.
- If we ever take ingestion in a different direction (RSS feed, content
  API, or upstream data export), this ADR should be superseded rather
  than edited.

## References

- Spec: `docs/14 - Junnufriba crawler.txt`
- Phase 1 PR: [#16 junnufriba-crawler](https://github.com/janimattiellonen/Harkkapankki/pull/16)
- Phase 3+4 PR: [#20 multi-link-crawling](https://github.com/janimattiellonen/Harkkapankki/pull/20)
- Image-import follow-up: PR #32 (commit `2c1f415`)
- Code: `scripts/crawler/`, `scripts/insert-content.ts`
- Sample run output: `docs/junnufriba-crawler/parsed-data/<timestamp>/`
