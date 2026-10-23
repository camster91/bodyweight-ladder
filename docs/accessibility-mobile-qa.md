# Accessibility and mobile compatibility — 23 October 2026

This is an engineering validation record, not a WCAG conformance claim or physical-device certification.

## Issues fixed

- Starting or cancelling a timed hold removed the active control and could leave keyboard focus on the document body. Focus now moves to Cancel during preparation and returns to the primary workout action after cancellation. Switching sides also retains focus.
- Hold preparation, start and reaching the target lacked screen-reader status messages. A stable polite status region announces these milestones; elapsed-time displays use timer semantics with live announcements off so each tick does not interrupt the user.
- Background refreshes could replace focused controls or an open dialog. They now preserve stable controls and defer while a dialog is open. Automatic rest completion updates the underlying session without closing the dialog. Explicit close handling flushes the deferred screen update in WebKit, where a removed dialog did not reliably emit the expected focus event.
- Enlarged text could overlap the workout value, controls, page header and personal-best metadata, or clip navigation labels. The value container grows with its contents; navigation and headers wrap; exercise descriptions and record metadata use proportional line heights. The weekly chart can scroll horizontally at large text sizes and has keyboard focus access.
- Added a keyboard-visible skip link to the main landmark and stable announcements for tab changes.
- Final reachability testing found fixed navigation could still cover the bottom of the primary action at enlarged text sizes. Main-page bottom spacing now follows the measured navigation height. Keyboard-focused controls scroll into the usable viewport above bottom navigation; side navigation does not trigger unnecessary vertical scrolling. This was checked at 100% and 200% text in all three engines, including tablet and landscape sizes.

## Verification

- Isolated Chrome 155, Playwright WebKit 26.5 and Firefox 153 browser contexts. Touch input and viewport testing at 320×568, 390×844 and 844×390; mobile emulation on Chrome/WebKit, touch viewport testing on Firefox.
- Real downloads, file selection, restore, reload, cancelled holds, target milestones, focus retention and automatic rest completion behind an open dialog.
- Computed text sizes doubled without compounding ancestor changes, on Workout, Exercises and populated Progress. This is a text-sizing stress test, not an operating-system Dynamic Type test.
- Axe-core 4.14.0 checks across onboarding, workout, rest, technique, exercise settings, custom-exercise form, empty Progress and backup dialog in light/dark phone layouts. Automated checks are supplemented by keyboard, focus and visual checks.
- Existing controls were checked at seven viewport sizes from 320 to 1440 pixels for touch targets, contrast, visible focus, search/reset and dialog focus return.
- Regression cases for keyboard focus, timer announcements, deferred modal updates and stable landmarks are in `tests/launch-accessibility.test.js`.

## Remaining hands-on validation

Actual iPhone Safari and Android browsers, VoiceOver/TalkBack, operating-system font scaling, mobile keyboard/viewport behavior, device lock/background suspension and wake/audio behavior still require physical-device testing. The desktop WebKit engine is useful compatibility evidence and is not the Safari application on iOS. Automated scanner passes do not prove assistive-technology usability.
