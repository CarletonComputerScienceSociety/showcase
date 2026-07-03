---
title: 'Example Project'
description: 'A demonstration project showing the structure of a showcase entry.'
builtBy:
  - name: 'Example Student'
    url: 'https://example.com'
tech: ['TypeScript', 'Astro', 'pnpm']
year: 2025
domains: ['web']
github: 'https://github.com/example/example-project'
deploy: 'https://example-project.pages.dev'
cover: './cover.png'
---

## Overview

This is an example project entry that demonstrates the expected frontmatter shape for all projects in this showcase. Every field above is required (except `deploy`, which is optional), and the `cover` image co-located here will be optimized at build time via `astro:assets`.

## What it does

The project serves as a structural template. When a contributor adds their own project, they create a new folder under `src/content/projects/`, drop in their `index.md` and a cover image, and open a pull request. Using one folder per project means multiple contributors can add entries simultaneously without touching the same file, eliminating most merge conflicts.

## Technical notes

- The `domains` field drives filtering on the gallery page. It's an array of one or more categories from a fixed set: `web`, `mobile`, `ai-ml`, `cybersecurity`, `game-dev`, `hardware`, `systems`, `infrastructure` (e.g. a cybersecurity-focused web app could be `['web', 'cybersecurity']`). An unrecognized value fails the build.
- The `tech` array accepts any freeform strings — the gallery page aggregates them into a filter list at build time.
- `deploy` is omitted when a project has no public deployment (library, CLI tool, etc.).
