---
title: Pictures look like bright blocks in dark mode
labels: images,ui
---

## Problem
The `img/w/` start → finish pictures have an opaque light grey-blue background (#EEF2F8). In dark mode they show as bright rectangles on the dark card.

## Options
1. Regenerate with transparent backgrounds (labels/arrows must still read on dark), or
2. Ship a dark variant per picture (`img/w-dark/…`) and pick with `prefers-color-scheme`, or
3. Quick fix: soften with `filter: brightness(.85)` + rounded frame in dark mode only.

## Done when
- [ ] No glaring light blocks on Today, Exercises and History in dark mode
- [ ] START/FINISH labels and arrows still readable in both themes
