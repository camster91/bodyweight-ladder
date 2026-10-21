---
title: Keep Rest and Save in reach while a card is open
labels: ui
---

## Problem
With large text, narrow screens, or 4–6 sets, the Rest/Save buttons drop below the fold. Users scroll mid-set with sweaty hands to find Save.

## Fix
- When an exercise card is open, show a sticky action bar above the tab bar: **Rest 1:30 | Save** (and the current set when timing a hold).
- Hide it when the card scrolls fully out of view.
- Respect safe-area insets and the rest/hold timer pill (don't overlap).

## Done when
- [ ] Save reachable without scrolling at 300px wide / 130% zoom
- [ ] No overlap with the timer pill or the Undo toast
