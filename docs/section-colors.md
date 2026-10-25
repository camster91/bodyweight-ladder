# Section color system

`ui/section-colors.css` adds shared semantic surface tokens, embedded at the end of the main stylesheet by `scripts/sync-section-colors.cjs`. The public app still needs no build or extra network request.

| Surface | Role | Main uses |
| --- | --- | --- |
| Mint | Planning | Plan summary, routines, weekly activity, check-in |
| Blue | Training | Current exercise, upcoming exercise, Strength category, recent activity |
| Lavender | Progress | Personal bests, four-week history, Mobility category |
| Sand | Guidance | Rest/paused state, explanations, technique, history log, Stretch category |

Onboarding, settings, workout menus and backup/equipment forms reuse the same surfaces. Exercise categories retain text labels; selection, completion, destructive actions and primary buttons keep their existing semantics. The colors do not replace labels or indicate a new workout outcome.

Light surfaces use OKLCH L=.945, C=.028; dark surfaces use L=.27, C=.032, with shared hues 165/250/300/65. Hex fallbacks support browsers without OKLCH. Dark mode follows either the existing manual setting or system preference.

Run `node scripts/check-section-contrast.cjs` and `node scripts/sync-section-colors.cjs --check`. The palette check covers primary text, secondary text, existing link/action color and section edges. Lowest measured normal-text ratio: 5.10:1 in light mode and 7.91:1 in dark mode. Section edges exceed 3:1. Existing input, focus, selected and disabled states remain owned by the control system.

Rendered Today was inspected in light and dark mode. Interactive navigation did not respond through the available browser controls, including with the new stylesheet removed, so complete interactive cross-screen verification could not be finished in this session. Source mapping covers the named sections on all screens; no workout, planning or navigation logic changed. Full app suites remain skipped.
