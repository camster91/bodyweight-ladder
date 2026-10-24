# Session ledger contract

`ui/session-engine.js` exposes the browser lexical global `LadderSessions` and a CommonJS export. It does not read storage, change a session, write exercise logs, or run timers. `scripts/sync-sessions.cjs` embeds it inside `/* LADDER_SESSIONS_START */` and `/* LADDER_SESSIONS_END */`; `--check` only compares. The host page must place those markers inside a script before the app uses the module.

The optional v2 state field `sessions` is an array of these records:

```js
{
  id: 'stable-session-id', started: 1000, updated: 2000,
  ended: null, // timestamp for completed/partial; null for active/paused
  status: 'active', // active | paused | completed | partial
  planned: 4, completed: 1, skipped: 0, performedSets: 3,
  logRefs: ['1500|push'] // existing entryId format, timestamp + | + track id
}
```

- `normalize(records)` validates untrusted records and produces a sorted, deduplicated array. Missing legacy data becomes `[]`; invalid records are ignored. No history retention limit or implicit deletion is applied.
- `merge(a,b)` and `upsert(records,record)` preserve IDs and union referenced log IDs. The newer `updated` record supplies status/counts; equal clocks resolve deterministically, preferring later status in the enum above and then canonical scalar fields. `started` preserves the earliest timestamp. This merge is commutative, associative, and idempotent for canonical inputs. Count corrections on a newer record remain possible. Callers must filter missing/deleted log references when displaying history; a union reference is not proof that the log exists.
- `performed(item)` returns a new array of recorded numbers. With an advanced draft, only unique explicitly completed indices with explicit numeric strings count, ordered by set index. Other entered but unchecked values and target placeholders never count. Without an advanced draft, only the validated completed `values` prefix counts. Invalid/ambiguous drafts yield `[]`, not invented values. Explicit zero values are retained; training-day logic must separately distinguish positive work.
- `summarize(run,{now,status,log})` builds a record from the current session and actual valid exercise log entries. `run.sessionId` is preferred; legacy fallback is `session-${run.started}`. `items[].skipped === true` counts a skipped item. `completed` counts fully completed, non-skipped exercise items with existing log entries containing at least the planned number of sets. A saved partial exercise is **not** a full completion. `performedSets` counts sets in distinct existing referenced logs, never planned targets or unsaved drafts. `run.logRefs` can preserve logs from swapped/extra exercises that are no longer represented by current items. The caller chooses `partial` when finishing early, saves actual pending performed values first, supplies the resulting logs, and persists the returned record. Active and paused summaries have no end timestamp.

Create a stable `run.sessionId` when starting a session and persist it with the durable session. Invoke `summarize` with the full current log after actual log writes, not with a clipped cloud snapshot. Normalize the ledger during restore/boot and merge it alongside existing state fields. Session summaries do not replace existing exercise logs or incomplete session drafts.

## Finishing early and extending

An explicitly finished session marks incomplete, non-skipped items with `omitted: true`. This means the item was closed for that session, rather than deliberately skipped. Omitted items are neither pending nor fully completed, and do not increase the skipped count. Performed sets are logged before the omission marker is applied. Selecting one extra set/exercise later replaces or adds only that explicitly selected item with fresh pending state; other omitted items stay closed.

`run.closedEarly` remains true once a session is explicitly finished early. Extensions can add performed work but do not turn an unfinished original prescription into a fully completed workout, even if an extra replaces the only omitted item. Fresh sessions start without this marker. Active or paused phases clear stale `ended` and `endStatus` fields; final status is recalculated, while the deliberate early-finish marker remains.
