# Focused workout flow verification — 2026-10-25

Run `node tests/session-lifecycle-focused.cjs` from the repository root.

15 focused checks passed using synthetic records, a controlled clock, the production session adapter/session summary engine/extra-work adapter, and isolated production timer functions. No full app bootstrap or application suite is run. Storage and DOM are test doubles; the checks are not a browser, native storage or physical-device test.

Covered:

- Rep edits and performed values through Pause, JSON serialization and Resume.
- Rest remaining time through a long pause and serialized reload.
- Hold elapsed time, readiness countdown, second side and first-side duration through a pause and serialized reload.
- Skip saves only performed sets; paused Skip/Swap do nothing.
- Swap archives performed work and limits the remaining sets. Applying/restoring an alternative retains the original partial record.
- Finish early produces a partial outcome and leaves untouched targets unrecorded.
- Completing all planned sets produces an accurate completed outcome.
- Optional extra sets retain old entries, use later timestamps and preserve an earlier partial outcome.
- Actual timer expiry and subtracting the last rest seconds return to ready without starting a hold.
- Malformed saved hold state falls back to ready without recording a set.

No production runtime changes were needed. This is a repository-only verification update; the deployed app remains the previously verified workout-controls release.

## Still unverified

The in-app browser previously displayed updated pages but click/keyboard navigation returned without changing screens. That capability has not been shown to recover. Identical retries were stopped. These focused checks do not close the interactive verification gap for Pause, More, plan-dialog actions or Exercises/Progress navigation.

A physical-phone check is still needed for backgrounding/locking the browser, genuine close/reopen storage behavior, large text, touch controls, sound/vibration and iOS/Android differences. No connected physical-phone control was established in this task. A desktop viewport screenshot is not evidence for those behaviors.
