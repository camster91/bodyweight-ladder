![Bodyweight Ladder](assets/brand/banner.png)

# Bodyweight Ladder

A phone-first training app for bodyweight strength, tendon health, mobility and stretching. Every exercise is a **ladder** of steps from easy to hard. Hit the top of the rep range on every set and you move up a rung. Rung, the mascot, shows each step.

## What it does
- **Plans your session from the time you have.** Pick 5, 10, 20, 30, 60 min or All. Overdue moves come first, with at most one new move when you already train.
- **One set at a time.** Adjust the suggested number, then Complete set. Rest fills the screen with a countdown ring before the next set. The final set saves the exercise, briefly confirms the save, and advances the workout. Subtle transitions respect Reduce Motion. Undo is available during rest and on the completion screen.
- **Details when you need them.** Technique, the workout list, and an editor for all sets stay collapsed. Time and routine choices live under Edit workout. Unfinished sets and rest deadlines resume after refreshing this browser.
- **Responsive motion.** Reps roll in the direction you adjust them, completing a set sends a soft pulse, and a finished workout draws its checkmark before revealing the totals. Motion never delays saving or timers, and Reduce Motion keeps the interface still.
- **Progress from your actual results.** A quiet timeline shows training days, with weekly day/set counts and dated personal bests. Best totals and trends compare the same exercise step and set count; first results establish a baseline. The detailed workout log remains available for corrections and Undo.
- **Guided setup.** A short introduction, three focused questions, and a final review lead into the first set. Back and Edit preserve answers, unfinished setup resumes in this browser, and repeating setup keeps logged exercise levels intact. Setup changes are saved only when confirmed.
- **Editorial visual design.** Original generated hero artwork, illustrated setup choices, a responsive workout surface, and a weekly activity graphic give the app its visual identity. The set path and weekly cells reflect actual saved sets. The hero is decorative; exercise technique remains in the dedicated diagrams.
- **Hold timer** for timed moves (3-2-1, counts up, buzz and beep at the goal, both sides for per-side moves) and **rest timer** with each move's own rest.
- **26 exercises** in groups: Strength (Push, Dip, Pull, Row, Squat, Core, Hinge), Tendon, Mobility, Stretch and Weights, plus your own custom moves.
- **Routines** (presets plus your own), **first-time setup**, **welcome back** after a break, **progress per exercise** in Progress.
- **Syncs across devices** when hosted as a claude.ai artifact (per-user database, merged entry by entry and setting by setting). Anywhere else it saves in the browser.

## Run it
It's one static page. Open `index.html`, or serve the folder. To put it on a server, see **[DEPLOY.md](DEPLOY.md)** (includes a copy-paste prompt for an AI agent on your VPS).

Open `/?onboarding=1` to view the welcome with existing progress. Cancel returns to Today without changing saved settings. The parameter is consumed when the introduction opens, so refreshing does not keep forcing setup.

```bash
npm start          # serves on http://localhost:3000
```

## Tests
```bash
npm install
npm test
```
The tests run the real page in jsdom: data repair of old saves, Undo, two-device sync with a fake cloud (offline phones, clock skew, conflicting edits), the session planner, hold timer, setup, search and History.

## Files
- `index.html`: the whole app (HTML, CSS, JS)
- `img/`: Rung illustrations for every step (`<track>-<step>.webp`), app icon, logo banner and cheer image
- `img/w/`: start → finish two-pose pictures for moves where one pose doesn't show the movement
- `assets/brand/`: app icon (512px) and logo banner
- `assets/coaches/`: two designs for a second, female coach (not used in the app yet)
- `assets/mascot/rung-reference.png`: the reference image used to keep Rung consistent
- `tests/`: test files and runner

## Back up and restore

Open **Back up or restore progress** on Progress (also available during setup), or use the storage status button on any main screen. Download a JSON backup and keep it private. It contains completed exercise records, effort feedback, exercise levels, custom exercises, routines, preferences and deletion markers. Unfinished sets, workout-time selection and display settings remain on the device.

Restore validates a versioned Bodyweight Ladder backup (up to 5 MB), previews the merge, and only applies it after an explicit **Merge backup** action. History is combined without duplicates; deletions are respected; the most recently changed setting wins, with the existing device winning ties. A fresh device receives the backup settings. Restoring during an unfinished exercise or timer is blocked. History above the existing 1,800-record limit is rejected instead of silently trimmed. Future or malformed formats are rejected without applying them.

Browser writes for completed progress and unfinished sessions are read back. Failed writes show a persistent warning with retry and backup actions. Restore writes and verifies the combined copy before changing the current session or initiating existing cloud sync. Self-hosted use remains browser-only: downloading a backup does not create an account or automatic cross-device sync. Files are parsed on the device; an account-connected artifact version still syncs restored state through its existing integration.

## Data model (v2)
`{ v, updated, stamps, levels:{track:"track:step-slug"}, log:[{ts,t,k,sets}], deleted:[], prefs:{hidden,focus,sets,presetsSeen,setupDone}, custom:[], routines:[] }`

Steps are identified by permanent keys (`pull:jumping-pull-up`), never by position, so ladders can be reordered safely. `stamps` records when each setting last changed, so devices merge setting by setting.

The separate `bwl-focus` localStorage key stores the unfinished session on this browser. It is not synced. Completed exercises still use the v2 log and its existing sync rules. Cancelling a hold records nothing; per-side holds record the weaker side. Changing the workout rebuilds the plan and carries forward unfinished sets for exercises included in the new plan.

## Known to-dos
- App icon: Rung's hands and feet should clearly grip the ladder rungs.
- Redo the remaining single-pose pictures in the newer athletic style so every picture matches.
- Optional second coach (female) with a "Choose your coach" setting. Designs are in `assets/coaches/`.
- Self-hosted copies save in the browser only. Cross-device sync needs a small backend.
