---
title: Edit a logged entry in History (not just delete)
labels: ui,enhancement
---

## Problem
If you log 10·9·8 but actually did 10·9·9, the only fix is delete + re-log (and the new entry gets the wrong time).

## Fix
- Tapping an entry in History shows **Edit** and **Delete**.
- Edit opens the set numbers with −/+ (same controls as the Today card) and saves in place, keeping the original time.
- Sync: an edit must replace the entry on every device. Store an `edited` timestamp on the entry and let the newer version win in `merge()`. Add a two-device test.

## Done when
- [ ] Edit works and keeps the time
- [ ] Edits sync and win over the old version on other devices (test)
