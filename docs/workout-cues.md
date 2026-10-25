# Workout previews and device cues

Rest previews show the upcoming variation's photo, set number, saved target and required supports. The photo opens that variation's technique guide. Timed movements explicitly wait for Start and the existing preparation countdown.

Device-only settings at `bwl-cues` retain separate sound/vibration preferences and a master mute. Sound uses quiet, short Web Audio tones; vibration is attempted only when supported. Rest ending, a new exercise, hold starting and target reached have distinct patterns. Master mute stops scheduled notes and current vibration. Settings changes never change a workout, deadline or recorded set.

There is no guarantee of cues while a browser is backgrounded, the device sleeps, or playback is blocked. The app explains that the workout should stay visible. Desktop checks validate dispatch and controls; they cannot confirm a physical phone's speaker or vibration motor.

Hold pause snapshots retain whether the start/target cues already occurred, so resuming does not replay them. Older snapshots remain accepted.

After 28 days of saved history, the weekly check-in becomes a first-month check-in, then a monthly check-in after 56 days. It reports the actual last-28-day work and offers time, goal and energy adjustments. Several early finishes suggest reviewing the time budget; a quiet recent log suggests a short/lighter return. It does not infer fitness or require a streak.

Focused validation: `node tests/workout-cues-focused.cjs`. This checks cue dispatch, independent preferences, master mute, malformed stored preferences, blocked audio fallback, preview content and monthly copy. `node scripts/sync-workout-cues.cjs --check` validates embedded CSS/JS. Full app suites remain skipped.

Local browser walkthroughs covered Push-up → Squat → Plank previews, exact upcoming technique links, manual hold readiness, pause/reload/resume after a target cue, master mute across reloads, independent Sound/Vibration controls, and a synthetic 30-visit history restored through the normal backup UI. Phone/tablet captures covered 320×568, 390×844 and 768×1024. These are functional/synthetic checks, not real participant outcomes or physical phone audio/haptic verification.
