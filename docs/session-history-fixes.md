# Follow-up review fixes

## Progress safety

Unavailable/invalid workout items are reconciled individually. Deleting a custom exercise warns about its unfinished set count and removes that item; other valid items keep their targets and recorded sets.

Options includes End workout. Keep unfinished workout and closing the dialog retain the current session. Explicit confirmation discards unfinished sets and starts the next plan with current preferences; completed log entries remain untouched. Running holds must finish or cancel first.

The1800-record local retention cap is removed from save, normalize/dedupe and merge paths. Local history and deletion markers remain intact. Cloud payload limits apply only to an outbound copy, with a notice that full history must be transferred by backup. Snapshot comparisons use the same bounded copy to avoid a sync loop. Device quota/save failures retain the existing in-memory copy and show the existing warning/backup path. They cannot guarantee persistence after page close.

Compact full-history backups remain limited to5MB and are validated for restorability before download. Oversized/inconsistent export and oversized merged restore fail explicitly without partial export or history eviction. Old records already removed by earlier app versions are not recreated.

Today and Progress share the trained-day definition: at least one positive rep/hold. Zero results remain labeled in the log.

## Controls and layout

Initial hidden routine choices remain selectable throughout draft editing; delete accessible names include visible wording; Start here focuses/announces the selected step. Short-phone composition keeps the primary recording action clear of fixed navigation, with44px-or-larger controls retained. New dialogs use native focus and explicit keep/discard wording.

## Verification

All inline JavaScript parses, embedded sources match and whitespace checks pass. Full application suites remained skipped. Focused isolated sample checks verified1801 records through dedupe, normalization and backup parsing; unrelated set preservation after custom deletion; keep/discard end-session paths; and consistent zero-day behavior. The first fixture run reached passing assertions but closed its DOM before an asynchronous initialization finished; corrected harness cleanup and reran successfully. No production user data or backup files were used.

Manual browser review inspected the end-workout dialog and320x640/320x568 layouts. At320x568 the action bottom477.1px clears navigation top489.4px. Physical devices, production cloud accounts and exhaustive timer/swap combinations were not exercised. Availability automation remains paused.

Artifacts: task workspace outputs/session-history-fixes.
