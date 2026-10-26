# Paused workout actions

Release: 2026-10-26-paused-actions

Paused workouts expose Finish for today beside the existing Resume action. Finish uses the existing confirmation and saving handler. A How to link opens the current exercise guide without resuming the workout. Older unfinished workouts retain Save & start today's plan.

The finish confirmation highlights saved sets and lists additional performed sets only when present. Untouched exercises, unfinished holds, and unmarked targets retain their existing exclusions. No session, progression, or timer algorithms changed.

Tests and browser interaction checks were skipped at the user's request. Source synchronization is not a runtime check. The guide close/focus flow and paused-state interactions remain unverified on devices.
