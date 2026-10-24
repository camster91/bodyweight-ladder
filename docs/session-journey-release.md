# Session and journey release

The static app now keeps a stable session ID and a durable outcome ledger alongside saved exercise history. The active workout and paused timer snapshot remain local to the device; session outcomes and equipment preferences participate in backups and existing cloud merge. Older backups remain accepted. Legacy exercise records without session IDs retain their work totals without inventing completed sessions.

Workout offers Pause/Resume, Skip exercise, Swap exercise and Finish for today. Explicitly performed sets survive Skip, Swap and early Finish. Unmarked targets never become saved work. A finished-early item is closed separately from an explicit skip. Extra work reuses the session identity and retains archived entries; it does not reopen omitted exercises or record targets in advance. Undo/edit clears terminal timestamps before reactivation.

New automatic plans require confirmed variation-specific supports. Existing started or paused prescriptions remain frozen. Floor space, walls, furniture and specialist supports are checked individually; availability does not certify their safety. Onboarding confirms only the equipment it actually asks about.

Planning explains budget versus estimate, short or empty choices, the 24-hour exclusion and next eligibility. Weekly days are explicitly a participation goal, not a fixed schedule. Progress compares the last 28 days with the preceding 28 days, distinguishes completed and early-finished sessions, and compares matching step, mode and set-count results. These are descriptions of saved history, not measurements of recovery or physical fitness.

## Focused verification

Full suites were deliberately skipped. Independent specification and quality reviews covered session persistence, equipment requirements, planning copy and root integration. Pure focused checks covered dense performed values, merge laws/retention, all 78 equipment steps, archived extras, omitted/skip classification and matching progress units.

Local browser walkthroughs covered pause/reload/resume during work, hold preparation and rest; save-before-skip/finish; partial outcomes; explicit extras without reopening omitted work; unique exercise totals; and JSON export/re-merge with zero duplicates. Responsive viewport captures cover 320px phone controls and 768px Progress. The previous 180 simulated daily visits inform planning explanations; they do not represent real participant outcomes.

A full-HTML JSDOM dated-return verification command was rejected by automatic approval review without a detailed reason and was not retried. The date-return helper received independent source review and pure checks; the overnight return path was not time-travelled in a browser.

Availability monitoring remains paused. Deployment uses the existing dedicated static-site update command and does not modify other sites.

## Source synchronization

The public server serves `index.html`, not `ui/`. After editing a module run its matching `scripts/sync-*.cjs`, then `--check`. New pairs: `sessions`, `workout-session`, `workout-extras`, `equipment`, `equipment-preferences`, `journey`, and `journey-css`. Existing coaching, controls, support and technique sync contracts remain in place.
