---
title: App icon: Rung must actually grip the ladder
labels: images,brand
---

## Problem
In the current app icon (`img/icon.webp`, `assets/brand/icon-512.png`) and logo banner (`assets/brand/banner.png`), Rung floats beside the ladder. His hands and feet don't touch the rungs, so it doesn't read as "climbing".

## Fix
Regenerate the icon and banner so that:
- Both hands clearly wrap around a rung (one high, one lower).
- At least one foot stands on a rung; the other steps up.
- The ladder sits behind/under his body, not next to it.
- Full body visible, athletic proportions (same style as the `img/w/` pictures).
- It still reads at 48px (check on a phone home screen).

## Done when
- [ ] New `icon-512.png`, `icon-512-solid.png`, `icon-192.png`, `apple-touch-icon.png`, `img/icon.webp`
- [ ] New `banner.png` / `img/brand.webp` using the same icon
- [ ] Checked at 48px, 180px and 512px, light and dark home screens
