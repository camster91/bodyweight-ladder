# Review fixes

## Session preservation and accuracy

Once a workout starts, its exercise queue, original time setting, goals, set counts, lighter mode and alternatives remain attached to the saved session across time, filter, routine, visibility and other preference edits. These edits are labeled as next-workout settings. Started sessions remain reachable even if the current filter has no visible exercises. Unstarted and completed sessions can still refresh normally.

Deleted completed log references are removed from the current session, including their recorded values and completion marks. They reopen as work instead of claiming saved completion. A per-item restart timestamp prevents an older matching result from silently restoring a deleted claim.

## Interface fixes

- Shared weekly counts update live; preserved planning explanations are labeled as snapshots.
- Custom exercise drafts survive rendering and tab navigation in memory, with explicit discard and refresh/close guidance. Successfully adding clears the draft.
- Routine delete confirmation restores focus to the named confirmation button.
- Portrait tablets use a vertical workout composition with the exercise image and description together, followed by centered recording controls and action.
- Recent training states its eight-day display limit and points to the full Workout log.
- Optional support diagnostics identify release2026-10-23-review-fixes-1.

## Verification

Inline scripts parsed; embedded controls/support/coaching/technique matched source; whitespace checks passed. Automated application test suites were skipped at the user request.

Manual walkthroughs used local sample data, separate from the deployed app's progress. A recorded sample set and original four-exercise20-minute queue survived a change to5minutes, a Mobility filter and reload. Completing then deleting the sample exercise reopened Push-up at set1 without a saved claim. A custom exercise draft survived tab changes. Portrait tablet layout was inspected and captured. No production workout records, settings or backup files were changed. Physical-device compatibility and exhaustive timer/alternative combinations were not retested.

Task artifacts: outputs/review-fixes.
