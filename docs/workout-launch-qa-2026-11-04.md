# Workout launch verification — November 4, 2026

The owner requested a full workout test and fixes, superseding the earlier request to skip additional testing. This record describes the local release candidate; exact production identity and delivery results belong in the release handoff.

## Fixed defects

1. Undoing the first unedited set created an unnecessary value override, blocking the energy check-in. Undo now restores the original target state while retaining actual user edits and measured hold values.
2. A null item in a malformed saved session crashed the deferred-settings check before session repair could run. The check now tolerates null entries so the existing repair can preserve valid work and recover the workout screen.
3. Replacing a skipped exercise with optional extra work could change a partial session into a completed outcome. Extra work now retains the original partial outcome, including in history and exported backups.

Production remains a static page. Only `index.html` changes at runtime; the extra-work source is synchronized into it. There are no migrations, new remote services or changes to users' storage keys.

## Verification

- `npm test`: **301 passed, 0 failed**, including session, backup, sheet and cue checks previously omitted from the default runner.
- `npm run test:browser`: **seven complete browser scenarios passed**. Chromium uses 390×844 and 1440×1000 viewports; WebKit uses 375×812. Both engines also run 320×740 edge cases and 390×844 recovery cases. Browser contexts contain only fabricated progress and never use the owner's profile.
- Every inline-source synchronization check passes; no served source mismatch remains.
- Rendered workout, paused, completion and progress screenshots were inspected. Browser scenarios fail on runtime exceptions; the main journeys also fail on HTTP errors for loaded resources.

The browser journeys exercise:

- Setup, draft recovery after refresh, technique dialog and dismissal.
- Rep adjustments, recording, Undo, rest extension, rest expiry, rest refresh and paused rest recovery.
- Timed-set preparation, the 10-second readiness countdown, measured holds and both sides of unilateral holds. A paused second side survives reload and records the shorter side.
- Full completion, completion refresh, saved-set counts, progress navigation, entry deletion and Undo.
- Reversible exercise substitutions, keeping usual ladder levels unchanged, skipping after partial work and cancellation of early finishing.
- Optional extra sets without deleting earlier records or changing partial outcomes.
- A downloaded backup, native file selection and restore without duplicates.
- An injected browser-storage write failure, visible warning, retry and refresh recovery.
- Confirmed early finishing that saves performed sets and leaves untouched exercises unrecorded.
- Recovery from a malformed saved session without startup errors.

Legacy tests were corrected for current native-dialog lifecycle, preparation confirmation, countdown length, equipment confirmation, explicit set entry, current selectors and truthful text. They no longer depend on automatically saving unmarked target numbers. The test runner now fails on subprocess signals/timeouts and uncaught jsdom errors instead of silently reporting success.

## Limits and launch decision

These checks establish technical workout-flow readiness for this release. WebKit on macOS is not physical iPhone Safari; Chromium with a mobile viewport is not Android hardware. Device locking, OS process eviction, assistive-technology use, vibration, audible cues and real-device installation still need physical-device testing. Cross-device sync tests use a fake cloud; the self-hosted app saves locally and has no automatic cross-device sync.

Independent exercise-professional review, photo/technique sign-off and a real-user pilot remain outstanding as described in `launch-review-packet.md`. Software verification does not establish exercise suitability or professional approval.

## Release and recovery

Publish through the existing `/usr/local/bin/deploy-ladder` command after preserving the currently deployed Git revision and a verified source archive outside the served tree. The deployed candidate must match the tested Git commit and public HTML checksum. Re-run the isolated browser journeys with `QA_URL=https://ladder.ashbi.ca`, then verify HTTPS, icon/manifest delivery and blocked development paths.

Cameron owns ongoing operation of the dedicated app. For recovery, revert this release in Git and deploy the resulting fast-forward commit. The verified pre-release archive and exact previous revision provide a second recovery source. This release requires no shared-proxy restart, configuration replacement or other-site changes.
