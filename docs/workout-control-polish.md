# Workout controls and visual consistency

Approved follow-up to the 2026-10-25 layout review:

- Pause is a labeled 44px action beside More during active work/rest. It uses the existing session pause handler, including timer snapshots and draft preservation. Resume remains the primary action on the paused screen.
- More groups Skip exercise, Swap exercise and Finish for today. Remove the duplicate Pause from this menu; keep paused Skip/Swap disabled.
- Why & adjust is the single plan entry on an active workout. Move the detailed duration, equipment and next-eligibility explanation into its dialog; preserve browsing, equipment and selection controls. Close that dialog before its navigation actions.
- Align workout and plan card edges at tablet/desktop sizes. Keep compact stepper targets at least 44px without crowding the dial.
- All exercise thumbnails use centered contain framing and one warm neutral backdrop. Preserve the entire pose, including hands, feet and supports. Source photographs and technique references are unchanged; this is framing consistency, not professional technique approval.

## Verification

Focused isolated rendering checks cover active Pause, paused/finished visibility, completed items, menu action availability, and merged planning details including equipment and budget explanations. Embedded module sync, inline script syntax and diff checks pass. Full application suites remain skipped at the user's request.

Local synthetic Today screenshots and DOM measurements at 320/390/768/1440 widths show no document horizontal overflow. Pause/More targets are 44px tall. Tablet and desktop plan/workout edges match.

The selected browser continues to display pages but navigation clicks return without changing screens. Identical retries stopped. Live interactive Pause/resume, plan-dialog actions, and post-change Exercises/Progress checks remain unconfirmed. Screenshots are visual evidence only and do not establish those interactions work.
