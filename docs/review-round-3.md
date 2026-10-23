# Third review and fixes

Baseline50c1c1704320f039267783b392de4a232cf29f2a, execution hostCam-DESKTOP.

## Review findings fixed

1. Advanced set edits, completion marks and timed results bypassed unfinished-session protection. A sparse per-item advancedDraft now stores explicit values and done indices in the device session. Untouched target placeholders are distinct from entered data. Rehydration, preference-change protection, readiness/swap guards, Progress resume/counts, End workout and custom-deletion warnings use that state. All-marked sets wait for explicit Save exercise; mixed advanced/focused completion does not duplicate values. These drafts remain outside completed-history backups.
2. Two individually valid backups could merge above supported settings limits and then become impossible to export. The entire proposed merged backup is now parsed/validated before writing. Invalid combined states leave current data unchanged and tell the user to keep both files.
3. Receiving devices could not detect a truncated cloud copy. Optional historyPartial metadata now survives normalization, cloud snapshots, local storage, merges and backups. Partial coverage is explicitly disclosed on receiving devices. Merge conservatively retains uncertainty rather than claiming that a backup proves all history is present.

## Second review after fixes

The independent reviewer found no blockers in the patched persistence/backup and advanced-set paths. Reviewed compatibility with older backups, full proposed-merge validation, cloud marker propagation, sparse mark/unmark, explicit zero values, zero-confirmation rollback, stale counter values, focused-prefix progression, no-placeholder logging, Progress/end/deletion counts and restore protection.

The bounded routine/custom-editor source review found no new substantive defect. This is not a claim of exhaustive application or device certification.

## Focused verification

- Root full-HTML local fixtures: untouched placeholders not saved; sparse marks count correctly; edited/marked state survives changed plans and reload; mixed completion saves once; fully marked sets stay unlogged until explicit Save.
- Root backup fixtures:300+300 stamped custom exercise collections reject the combined600 without changing state; valid300+1 merges to301; cloud truncation tags its copy without changing the source; receiving partial coverage and backup roundtrip retain the warning. An initial fixture omitted realistic setting timestamps and therefore did not model the merge boundary; corrected sample data and reran successfully.
- Agent targeted fixtures also covered invalid snapshot rejection, extra-exercise append uniqueness, entered-only save and zero-confirmation rollback.
- Inline scripts parse; embedded sources and whitespace checks pass. Full application suites remain skipped at the user request.
- Browser phone preview shows Sets ready to save after marking3 sample sets, preserved through reload. No production workout records or backups were used.

## Remaining practical limits

Backups remain5MB; browser storage quota can fail and then persistence cannot be guaranteed after closing the page. Partial-history metadata is deliberately conservative and cannot be automatically cleared by a merge. Optional account-sync behavior was checked using synthetic copies, not a production account. Physical iOS/Android and exhaustive timer/swap combinations were not exercised. Availability automation remains paused.
