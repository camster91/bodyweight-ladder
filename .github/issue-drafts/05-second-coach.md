---
title: Second coach + "Choose your coach" setting
labels: images,enhancement
---

## Idea
Add a female coach alongside Rung, and let people pick who demonstrates the moves.

Two designs are in `assets/coaches/` (ponytail + tank, curls + t-shirt). Pick one and name her.

## Work
- [ ] Pick the design and a name
- [ ] Generate her version of every exercise picture (~78, same prompts as Rung's, using her design as the reference). Do this **after** "Redo the remaining pictures" so both sets match.
- [ ] Setting: Exercises → "Your coach: Rung / <name>" (also offered in first-time setup). Saved as a synced setting (`prefs.coach`, stamped like other settings).
- [ ] `imgOf()` picks the folder by coach (`img/w/` vs `img/w-<name>/`), falls back to Rung if a picture is missing
- [ ] Cheer/empty-state image per coach

Budget: about 40–60 Higgsfield credits at medium quality plus redos.
