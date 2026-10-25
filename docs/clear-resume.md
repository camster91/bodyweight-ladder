# Clear return to a paused workout

The paused screen now shows the selected exercise photo/name, current set and target, plus the frozen timer state. Rest shows its remaining time. A hold shows elapsed time and side; its preparation countdown shows remaining preparation seconds. Resume remains the primary action, and an older workout retains Save & start today's plan.

Use the saved hold goal when it differs from the original prescription. Invalid saved pause state falls back to a ready message rather than displaying invalid timing. No timer, planning or recording logic changed.

The plan summary displays days trained this week separately from the weekly target, avoiding confusing statements such as "4 of 3 days".

Verification: 17 focused lifecycle/rendering checks passed, including rest preview, set index, hold side and preparation status. Embedded source sync and inline script parsing passed. Full app suites remain skipped. The in-app browser's preview creation timed out and reset its control session; inventory remained available afterward, but the preview did not open. Fresh visual and interactive checks are unconfirmed. No alternate browser or host was used to bypass this limitation.
