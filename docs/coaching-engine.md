# Unified coaching engine v1

The static app uses a pure, deterministic engine in `ui/coaching-engine.js`. Planning, progression, readiness adjustments and time estimates use this shared module. `scripts/sync-coaching.cjs` embeds it into the served HTML; no backend, API key or runtime dependency is required. Run `node scripts/sync-coaching.cjs --check` to verify the committed copy.

## Decisions and explanations

The adapter supplies an explicit timestamp, the local Monday week boundary, validated exercise definitions, history and preferences. The engine returns selected exercises, targets, optional step suggestions, estimated duration, recovery-related observations and human-readable reasons. The same snapshot produces the same result and does not mutate its inputs.

Open **Today → Options → Why this workout**. The explanation records the plan at its creation time. Goal options are Balanced, Strength and Move better. Training days per week is a flexible target from 1–7, defaulting to 3. Missing the target never adds catch-up sets. These preferences rebuild an unstarted, unadapted workout; otherwise they apply to the next workout. Optional settings are normalized, merged by timestamp and included in backups. Older saves/backups receive Balanced/3 defaults.

## Product rules

- Completed exercise records with positive work count toward local weekly training days and pattern volume. Malformed or future-dated records are ignored for decisions, not removed from stored history. Multiple exercises on one day count as one training day.
- Exercises recorded within 24 hours stay out of the automatic plan, following the existing app policy. Users retain access through Recently saved.
- Priority combines elapsed time divided by the existing group interval (48h Strength/Weights, 24h Tendon/Mobility/Stretch, 36h Custom), the user's frequency setting, logged weekly sets per movement pattern and patterns already selected. Weekly pattern load divides priority by `1 + sets/24`; another selected exercise in the same pattern divides it by `1 + count*0.8`.
- Strength or Movement goal emphasis multiplies relevant candidate priority by 1.3. It does not hide exercises or increase prescribed sets. Explicit routine/type selections retain their chosen exercise pool; the goal bias applies to automatic selection.
- A related movement marked Hard within the current group's interval reduces selection priority by a factor of 3 and blocks a target increase or upward step suggestion. This is an observation about the log, not a measurement of muscle recovery. Related movement mappings are explicitly listed in the module; custom movements are not assigned guessed anatomical relationships.
- Progression compares the same variation and set count, excluding lighter-session entries from the normal baseline. A hard session, partial/changed set count, below-range set or plateau holds targets. A small increase changes only one lower set: one rep or up to five seconds, bounded by the exercise range.
- Two successful, non-hard sessions on distinct local days can suggest a higher variation. The suggestion never changes levels automatically. Repeated hard misses can suggest an easier variation. Missing effort feedback is not interpreted as a measured easy session.
- More than seven days away repeats the previous targets. At least 21 days away trims one increment from each set, bounded by the step's lower range. This is a conservative product heuristic, not a validated detraining formula.
- Time estimates use the recommended targets, per-side work, prescribed rest and one minute of setup. A fitting exercise is selected before an oversized overdue block. If no eligible block fits, a single block is offered with an honest estimate; the budget is not a guarantee of actual duration.
- Low energy retains the selected exercises and reduces frozen targets to 80%, rounded down with a minimum of one (zero stays zero). These records are marked lighter and do not qualify the normal progression baseline. Short on time retains a priority prefix within an estimated 5- or 10-minute budget. Reset restores the exact original snapshot; reductions never compound.

## Stable workouts and data

New workouts store the engine version, planning context and recommendation snapshot in browser-local unfinished-session state. New history or preference edits do not silently change started sets. Existing unfinished workouts without engine metadata retain their goals and display a saved-workout explanation. Shorter workouts list their actual retained exercises; swaps show the chosen alternative and its actual duration estimate.

The completed-history schema remains v2. Optional coaching preferences participate in existing save warnings, backup/restore, merge and deletion protections. No hidden fitness assessment, biometrics, calorie estimate or recovery percentage is inferred.

## Evidence and remaining review

[ACSM's March 2026 guidance](https://acsm.org/resistance-training-guidelines-update-2026/) supports individualizing training around goals, enjoyment and sustainability and describes bodyweight training as a useful option for healthy adults. It does **not** validate this app's priority coefficients, movement relationships, spacing thresholds or target reductions. Those are transparent, testable product rules requiring qualified exercise-professional review and real-user validation. The engine does not evaluate injury, pregnancy, rehabilitation or medical fitness for exercise.

Pure-engine tests cover progression, related hard sessions, weekly balance, budgets, returns after breaks, invalid/future data and 200 reproducible generated histories. Integration tests cover preference persistence, backup compatibility, field-level merge, frozen targets and explanations after adaptation/swaps. Browser checks cover Chrome, Playwright WebKit and Firefox at 320×568, 390×844 and 844×390, with automated accessibility checks on the coaching controls. Physical-device and assistive-technology testing remain separate work.
