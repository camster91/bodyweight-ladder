# Core UX completion — 2026-10-23

## Changes

- Exercise ladders use neutral step numbers for every earlier variation. Choosing a starting level no longer creates apparent completion checks.
- Progress includes unfinished exercises with recorded sets and a Resume workout action, whether or not completed history exists. Those sets remain in the unfinished-session store and are still excluded from completed-progress exports.
- Today has a direct plan summary with goal, weekly target, weekly recorded days and access to recommendations. Its sheet puts native goal/day controls before the explanation and lists frozen workout decisions. Started targets retain the existing protection. Setup review includes these preferences; drafts remain cancellable and are committed only on Save/Start.
- Exercises has category filters combined with name/variation search, an explicit reset, a shorter photographic header, neutral progression labels and direct technique actions rather than nested technique disclosures. Priority labels explain relative selection; Hide is separated from set controls.
- Shared technique content appears in workout help, all-set editing, the library and setup preview. Each guide includes setup, execution, exit, rep/time/per-side clarification, a selected reference and optional photo inspection. Selected foundation links explicitly identify their limits; exact-variation search is separately labeled. Not every advanced variation has a curated exact video.
- Support creates a private email draft to hello@ashbi.ca, verified on [Ashbi's published contact page](https://www.ashbi.ca/contact/). No GitHub login is needed. Technical details are opt-in; copy-report fallback is immediately available. The person still needs to send the email; delivery was not exercised.
- Responsive changes tighten workout spacing, align Progress empty states and wide exercise lists, and reuse existing semantic colors, spacing and controls.

## Technique references

Verified source pages during this change:

- [NASM push-up instructions and linked demonstration](https://www.nasm.org/resource-center/exercise-library/push-up).
- Mayo Clinic videos: [modified push-up](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/modified-pushup/vid-20084674), [squat](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/squat/vid-20084663), [stationary lunge](https://www.mayoclinic.org/healthy-lifestyle/fitness/multimedia/lunge/vid-20084662).
- [Catalyst Athletics kettlebell swing demonstration](https://www.catalystathletics.com/exercise/524/Kettlebell-Swing/).
- [NHS foundation strength/flexibility videos](https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan-how-to-videos/) and [illustrated flexibility guide](https://www.nhs.uk/live-well/exercise/flexibility-exercises/).
- [Mayo Clinic illustrated core guide](https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/core-strength/art-20546851).
- [MIT OpenCourseWare demonstration collection](https://ocw.mit.edu/courses/pe-720-weight-training-spring-2006/pages/video/), with pull-up entries identified by name.

External sources are linked, not embedded or copied as instructional media, and do not endorse this app. Written guides combine existing step cues with original editorial instructions and variation-specific exceptions. The app does not import outside sources' set/repetition prescriptions.

All 78 existing technique-photo mappings were visually inspected in four contact sheets during this change. This checks subject matching and presentation, not anatomical certification or professional exercise approval. No new image was generated or licensed; existing provenance remains in Photo credits. Generated references remain identified and are supplementary to instructions and demonstrations.

## Implementation and verification scope

Reusable source: `ui/technique-guides.js`, embedded by `scripts/sync-technique.cjs`. Support remains in `ui/support.js`; styling uses the existing UI sources and synchronization command. Coaching rules and data schema were not changed.

Additional automated tests remain skipped by owner instruction. Release checks comprise source synchronization, JavaScript parsing without execution, diff inspection, visual walkthroughs and deployment delivery checks. They are not a new regression or accessibility certification. Physical-device behavior, email delivery, clipboard fallback and every external video player were not comprehensively exercised.
