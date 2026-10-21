---
title: Works offline at the gym (service worker)
labels: enhancement
---

## Problem
On the self-hosted / home-screen version, opening the app with no signal shows nothing.

## Fix
- Add a small service worker that caches `index.html`, the manifest, fonts and all images on first visit.
- Network-first for `index.html` (so updates arrive), cache-first for images.
- Bump a cache version on each deploy.
- Note: service workers don't run inside the claude.ai artifact viewer; this is for the VPS/home-screen copy only.

## Done when
- [ ] Airplane mode → app opens and logging works
- [ ] New deploy shows up after one reload
