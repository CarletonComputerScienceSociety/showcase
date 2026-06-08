# Carleton Computer Science Showcase

A student-built **project showcase + webring** for the Carleton Computer Science Society. Students submit a project (a tile linking to a detail page) or add their personal site to the webring — all via pull request, no backend.

> ⚠️ **Under active development.** The site is being built by CCSS volunteers and isn't open for project/webring submissions yet.

## Overview

Two things live here:

- **Project Directory** (`/projects`) — a gallery of projects built by Carleton CS
  students.
- **Webring** (`/webring`) — a directory of students' personal sites, linked into a ring. Members embed a small widget that connects their site to the
  others.

It's a static site (no server, no database): contributions are files added via a PR, and the build validates them.

**Stack:** [Astro 6](https://astro.build) · TypeScript · [Tailwind CSS
v4](https://tailwindcss.com) · pnpm.

## Adding a project

🚧 **Coming soon.**

## Joining the webring

🚧 **Coming soon.**

## Development

### Prerequisites

- **Node.js** `>=22.12.0`
- **pnpm** `11.x` — this repo pins the version via the `packageManager` field; the easiest way to match it is Corepack:

  ```sh
  corepack enable
  ```

### Setup

```sh
git clone https://github.com/CarletonComputerScienceSociety/showcase.git
cd showcase
pnpm install
```

### Commands

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | Start the dev server at `localhost:4321`        |
| `pnpm build`        | Production build to `./dist/`                   |
| `pnpm preview`      | Preview the production build locally            |
| `pnpm check`        | Type- and content-validate (`astro check`)      |
| `pnpm format`       | Format all files with Prettier                  |
| `pnpm format:check` | Check formatting without writing (what CI runs) |

### What to run when

- While working: `pnpm dev`.
- **Before opening a PR:** run `pnpm format`, then `pnpm check`, then `pnpm build`. CI runs `format:check`, `check`, and `build` on every PR and fails if any don't pass — so a quick local pass keeps CI green.

### Heads up: package cooldown

This repo uses pnpm's `minimumReleaseAge` (a 7-day supply-chain cooldown, set in `pnpm-workspace.yaml`). If `pnpm install` ever rejects a brand-new package
version, **that's the cooldown working as intended, not a broken lockfile.**
Wait for the version to age out, or pin a slightly older one. If you need an install that's blocked, flag it to Jacc first.

## Project structure

```text
src/
├── content/
│   ├── projects/         # one folder per project (index.md + cover image)
│   └── webring/          # one JSON file per webring member
├── components/           # Header, Footer, Card, CardCover, RingGraph, …
├── layouts/Base.astro    # document shell (head, header, slot, footer)
├── pages/                # routes: /projects, /projects/[slug], /webring
├── styles/global.css     # Tailwind v4 + Carleton design tokens
└── content.config.ts     # content collection schemas (the PR validation contract)
tickets/                  # volunteer task write-ups
```
