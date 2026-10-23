# Bodyweight Ladder identity

## The idea: steady climb

Three rounded rungs rise to the right. The peach top rung adds a little optimism without turning the identity into a character or a fitness badge. Keep the product name **Bodyweight Ladder**; **Ladder** is the compact wordmark and installed app name.

Primary line: **Small steps. Real strength.**
Supporting line: **Your pace. Your ladder.**

## Mark and lockups

`assets/brand/ladder-mark-v3.svg` is the primary square mark. The monochrome and reversed SVGs are for single-color and dark artwork. App icons and the social card use versioned filenames so existing image caches cannot keep showing the previous mark.

- Minimum mark size: 16px for favicons, 24px in app UI. Prefer 32–36px beside a screen title.
- Clear space: at least one quarter of the mark width.
- Horizontal lockup: mark beside the stacked Bodyweight / Ladder wordmark. Use the existing `brand-name` component rather than stretching type.
- Compact: mark beside the screen title. Keep the full brand name on welcome and desktop navigation.
- Maskable icon: the core mark sits inside the central safe area, on a full cobalt background. It is a separate export from the regular transparent-corner icon.
- Do not add shadows, gradients, facial features, extra rungs, or an outline to the mark. Do not use it as an exercise instruction.

## Palette and typography

| Role | Value | Use |
| --- | --- | --- |
| Cobalt | `#2555D5` | Actions, links, active navigation, mark tile |
| Peach | `#FFC8B4` | Top rung, small editorial accents, record edge |
| Mint | `#BCEBD7` | Completed work, supportive surfaces |
| Ivory | `#F7F6F2` | Light canvas |
| Ink | `#172B30` | Light-mode text |
| Deep teal | `#101F22` | Dark canvas |

Use semantic tokens from `ui/app-foundation.css` for controls. App-specific identity styles live in `ui/app-brand.css`, embedded by `scripts/sync-controls.cjs`. The portable control library retains its independent skin. Dark mode uses the existing light cobalt and warm text accents; peach is never used for critical warnings or primary button text.

Native system type keeps the app fast and familiar, with rounded system display faces where available. Headings are bold and closely spaced; body copy stays at readable native UI sizes. Numbers use tabular figures. Do not compress copy or shrink controls to fit a decorative element.

## Voice

Talk to a person making room for movement. Be clear first, warm second. Encourage effort only after the user actually records it.

| Moment | Use | Avoid |
| --- | --- | --- |
| Welcome | “Make a little room for movement.” | Transformation promises |
| Rest | “Take a breather.” | “No pain, no gain” |
| Completed workout | “You made time for you.” | Invented calories, badges or streaks |
| Empty Progress | “Start with one exercise.” | Sample achievements presented as real |
| Returning after a break | Explain the actual adjusted targets | Guilt, urgency or missed-day warnings |

Use brief encouragement sparingly. Keep exercise instructions, errors, measurements and destructive actions literal. No emoji confetti, cartoon exercise figures, leaderboards or fake community claims.

## Photography and motion

Continue using accurate selected-step photos and existing provenance/disclosure metadata. Unknown custom exercises keep a neutral label. A photo must never imply a technique or movement that it does not show.

The small peach caption on welcome has one brief arrival. Check marks respond to selection; existing workout celebrations happen after saving. No ambient looping decoration. All added motion is inside `prefers-reduced-motion: no-preference`, and no action waits for an animation.

## Asset set

Primary, monochrome and reversed SVGs; regular 192px/512px icons; separate 512px maskable icon; 180px Apple touch icon; 32px favicon; 1200×630 social card. Original vector artwork is maintained in this repository. The existing exercise photography credits remain unchanged.
