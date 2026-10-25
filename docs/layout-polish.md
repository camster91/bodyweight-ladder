# Layout polish, 2026-10-25

Preserves coaching, session recording, backup and recovery behavior. Canonical styles are in `ui/layout-polish.css`; synchronize with `node scripts/sync-layout-polish.cjs`.

## Screenshot-first findings

Evidence is under the workspace `outputs/clean-polish/` directory (synthetic local workout/history).

| Priority | Finding | Evidence | Change |
| --- | --- | --- | --- |
| P1 | Desktop workout photo, copy and primary action touch the panel edges. | before-1440.png | Consistent 24px desktop and 16px mobile insets; bounded desktop photo. |
| P1 | Phone categories require horizontal scrolling and hide available filters. | exercises-before-390.png | Wrap the existing 44px category controls; preserve selected and keyboard states. |
| P2 | Desktop Progress leaves a large empty column under the weekly card. | progress-before-1440.png | Full-width weekly overview above the two detail columns; stack naturally on phones. |
| P2 | Category cards touch vertically; repeated colored borders compete with content. | exercises-before-1440.png | Explicit grid row gaps, consistent corners and quieter non-interactive borders. |
| P2 | Rep dial and planning disclosure compete with the primary workout surface. | before-390.png | Neutral dial, quieter secondary disclosure, retain labeled semantic section colors. |

## Verification and limits

Today screenshots compared at 320, 390, 768 and 1440 widths, including dark-mode emulation. At 320px the primary action remains inside its panel and the document has no horizontal overflow. Embedded stylesheet sync, section contrast and inline JavaScript syntax checked. No application test suite run, per the user's standing instruction.

Exercises and Progress were navigable and captured before editing. After reload, both Playwright and accessibility navigation returned without changing the displayed view, including in a fresh tab. No JavaScript errors or blocking dialog were reported. This matches the previously observed review-browser limitation. Stop retries; post-change interactive verification of those routes remains unconfirmed. Do not label the Today screenshot as Progress evidence.
