---
title: Cross-device sync for the self-hosted version
labels: enhancement,backend
---

## Problem
Outside claude.ai the app saves to localStorage only, so phone and laptop don't share progress.

## Approach
The merge logic already exists (`normalize`, `merge`, per-setting `stamps`, log tombstones). It only needs a place to store the document.
- Tiny API on the VPS: `GET/PUT /api/state` per user, storing the same JSON doc (SQLite or a JSON file per user).
- Simple sign-in: magic link by email, or a private sync code/QR to pair devices.
- Client: if `window.claude` isn't there and the user is signed in, use this API with the same `connect()` / `pushCloud()` flow, polling every 30s and on focus instead of `onSnapshot`.
- Keep the 256 KB doc limit logic.

## Done when
- [ ] Log on phone → appears on laptop within 30s
- [ ] Existing two-device tests pass against the new backend adapter
