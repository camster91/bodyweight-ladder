# Simpler menus and reversible exercise visibility

- Workout options retain frequent actions and the current exercise queue. More workout options contains Edit all sets, extra exercises and recently saved rows, with explicit Back and restored entry focus.
- Hiding or restoring an exercise offers persistent Undo and Dismiss through the reusable notification control. Undo changes only that exercise visibility, verifies the track still exists and has the expected current visibility, and leaves workout history intact. The notification lasts until dismissed, used, replaced or the page is closed.
- App settings combines appearance, backup/restore and private problem reporting. Existing backup/support dialogs return focus to the originating settings row. Backup and restore content and behavior are unchanged.
- Routine editing adds a live selected count, exercise-step labels, explicit hidden-member choices, inline validation and Save & use routine. Switching tabs retains the in-memory draft; Cancel asks before discarding changes. Reloading still discards unsaved drafts. A deleted remote routine can be saved under a new ID after an explicit second action.

Validation: all inline JavaScript parsed, reusable styles synchronized, whitespace checked. Manual phone (390 x 844) and tablet (1024 x 768) walkthroughs confirmed settings, backup return focus, advanced menu, hide/Undo, routine count, draft retention across tab changes and discard confirmation. No completed workout sets were recorded. No backup files were read, downloaded or restored. Automated application suites remain skipped at the user request.

Screenshots are in the task workspace outputs/menus-and-undo directory.
