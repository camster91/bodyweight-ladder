# State-aware workout menu

Release: 2026-10-26-state-aware-menu

Paused menus show Finish for today and an instruction to resume from the workout screen before skipping or swapping. They no longer show disabled Skip/Swap buttons. Active workout actions and their handlers remain unchanged.

A presentation helper labels time and selection controls as Next workout when the existing session is paused, resting, has a running hold, or has recorded/edited work or skipped items. Finished workouts also label these controls for the next workout. The helper follows the existing preservation conditions; it does not change session rebuilding or saving. The heading, time-group accessible name and selection-button prefix use the same helper.

Functional tests remain skipped at the user's request. Visual inspection does not establish timer, planning or physical-device correctness.
