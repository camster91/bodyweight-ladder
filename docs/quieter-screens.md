# Quieter screen hierarchy

Release: 2026-10-26-quieter-screens

Visual review of the live desktop and 390px phone layouts found competing emphasis in the library: a photo banner, a tinted routines card, outlined category controls and tinted cards for every exercise. The first exercise appeared far below the header. The paused screen also repeated its state in a heading, explanatory paragraph, and generic readiness message.

Changes:

- Smaller photo banner, keeping the rotating photography and setup action.
- Collapsed routines becomes a single line with a count.
- Neutral exercise rows retain photographs; section markers retain category colors. Expanded exercise details remain distinct.
- Shorter category labels retain full accessible labels for Tendons & joints and Carries & weights. All categories remain available and wrap when needed.
- Paused workouts retain specific rest/hold timing, but omit generic Ready when you are text and shorten the old-workout explanation to its start date. Resume, Finish, and the old-workout new-plan action remain available.
- Progress uses a neutral unfinished-workout panel with concise retained-work and untouched-target wording.
- Secondary Settings sections use separators instead of competing colored cards; progress protection retains its highlight.

This is a visual and copy pass. Automated tests and exercise/session interaction tests remain skipped at the user's request. Read-only layout inspection and navigation do not establish workout or physical-device correctness.
