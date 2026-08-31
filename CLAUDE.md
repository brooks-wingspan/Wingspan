# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The marketing website for **Wingspan Aviation Consulting** — a solo B2B consultancy bringing big-tech-grade marketing/sales systems to aviation businesses (MRO shops, Part 135 charter operators, FBOs). Plain static HTML/CSS/JS, no build step, no framework, no package manager. See [PRODUCT.md](PRODUCT.md) for positioning, audience, and brand facts (founder timeline, confirmed clients/testimonials, what not to fabricate) — read it before writing or editing site copy.

Also present in the repo root: `ufo_frame.py`/`.step`/`.stl`/`Flying saucer picture frame.pdf` — an unrelated personal CadQuery/OpenCascade 3D-printing project. Treat it as unconnected to the Wingspan site work unless the user says otherwise.

## Running the site

There's no dev server config beyond a static file server. `.claude/launch.json` expects something serving `http://localhost:8080` (any static file server, e.g. `python3 -m http.server 8080` or `npx serve`), used as the `wingspan-variants` preview target. Open `.html` files directly in a browser otherwise — there's nothing to build or compile.

## Site structure

**Live site pages** (linked to each other via nav, share the same design system):
- [wingspan-v4-altitude.html](wingspan-v4-altitude.html) — homepage ("Altitude Minimal" direction: ultra-spacious, huge type, single column)
- [ai-transformation.html](ai-transformation.html), [market-intelligence.html](market-intelligence.html), [paid-advertising.html](paid-advertising.html) — service pages
- [contact.html](contact.html) — contact page

These four pages all load `tweak-bar.css`/`tweak-bar.js` and should be treated as the current, real site content.

**Design exploration variants** (not part of the live site — alternate visual directions for the homepage, reachable only through the [index.html](index.html) gallery):
- `wingspan-v1-instrument.html`, `v2-editorial.html`, `v3-ledger.html`, `v5-dossier.html` — five distinct top-level visual directions
- `v4a-flow.html`, `v4b-offset.html`, `v4c-modular.html` — sub-variations of the v4 "Altitude Minimal" direction, adding Team/Client sections
- `wingspan_homepage_clean.html` — the original committed homepage (the only file in the initial git commit); superseded by the v4 line

When asked to "update the homepage" or similar without qualification, this means `wingspan-v4-altitude.html`, not the variant files or `wingspan_homepage_clean.html`.

## tweak-bar.js / tweak-bar.css

A self-contained live theming widget (IIFE, no dependencies) injected into each live-site page. It renders a floating panel for adjusting fonts, color swatches, spacing, and type scale via CSS custom properties (`--tb-*`), letting the site's look be tuned live in-browser without editing code. `DEFAULT_SUGGESTIONS`/`FONT_LIST` and `SWATCHES` in `tweak-bar.js` are the curated, on-brand options — keep additions "premium-consulting-appropriate" (no decorative/novelty fonts, no neon/pastel colors) if extending them.

## The `impeccable` skill

`.claude/skills/impeccable/` is a large installed skill for frontend design work (shape, critique, polish, live-editing, distill, etc. — see its `reference/` subcommands). It has previously been used to generate `PRODUCT.md` (note the `<!-- impeccable:product-schema 1 -->` marker) and is the intended tool for further design/UX work on this site — prefer invoking it over ad hoc styling changes for anything design-related.
