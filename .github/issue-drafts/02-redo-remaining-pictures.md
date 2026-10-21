---
title: Redo the remaining ~43 single-pose pictures so every exercise matches
labels: images
---

## Problem
35 moves now have clear **start → finish** pictures in `img/w/` (athletic proportions, two panels, motion arrow). The other ~43 still use the older single-pose, big-head cartoon style (`img/<track>-<n>.webp`), so the app looks mixed and many of those don't show the movement.

Still old style: wall/incline/knee push-ups, pseudo-planche, support hold, flexed-arm hang, feet-elevated & archer rows, tuck front levers, all squats & pistols, dead bug, plank, side plank, hollow hold, L-sit, single-leg/elevated bridges, knee & groin tendon holds, towel curl, dead hang, horse stance, Cossack squat, single-leg RDL, carries, mobility holds, most stretches.

## Approach
- Same prompt template as `img/w/` (reference: `assets/mascot/rung-reference.png`), 3:2, start → finish with arrow.
- **Holds** (plank, wall sit, dead hang, L-sit, side plank…): one centred pose in the same 3:2 frame with a small "hold" stopwatch, no start/finish.
- Per-side moves: show one side and a small "each side" tag.
- Generate at medium quality, review every picture, redo misses at high.

## Done when
- [ ] Every step key has a picture in the new style (add to `WIDE` map in `index.html`)
- [ ] Contact sheet reviewed; no wrong positions (heels, knee angles, grip)
- [ ] Old `img/<track>-<n>.webp` only kept if still referenced
