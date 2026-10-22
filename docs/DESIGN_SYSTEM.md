# Bodyweight Ladder component system

This document describes the shared foundation in `index.html`, under the `Component foundation` CSS block and `applyComponentSystem()`. It preserves the existing ivory, cobalt, mint and dark teal identity. It is an incremental migration: older selectors, palette aliases and layout rules remain in the cascade.

## Token contract

| Layer | Actual names | Responsibility |
|---|---|---|
| Primitive | `--scale-space-1/2/3/4/6/8` | 4, 8, 12, 16, 24, 32px spacing |
| Primitive | `--scale-type-sm/md/body/title` | 12, 14, 16, 24px typography |
| Primitive | `--scale-radius-sm/md/lg`, `--scale-target` | 12, 16, 24px corners; 44px minimum target |
| Primitive | `--palette-paper/white/ink/muted/line/cobalt` | Documented brand palette; existing theme aliases still supply rendered colors |
| Semantic | `--color-canvas/surface/ink/ink-secondary/stroke/action/on-action/selected/critical` | Color purpose, mapped to the existing `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink`, `--chip`, `--bad` theme aliases |
| Semantic | `--space-control/inset/section`, `--type-meta/control/body`, `--target-min` | Shared control spacing, text hierarchy and interaction dimensions |
| Component | `--button-height/radius/inset/font/fill/stroke` | Button anatomy |
| Component | `--field-radius/height/font`, `--row-inset/gap/media-width/media-height` | Fields and media rows |
| Component | `--overlay-radius/inset/scrim/width`, `--focus-width/offset` | Overlay and keyboard-focus contract |

Prefer semantic and component aliases in new styling. Do not duplicate color values for dark mode: map theme aliases instead. The canvas, surface, ink, border and accent theme aliases now bridge to the primitive palette. Other legacy colors remain during migration. Some component values and responsive exceptions remain literal during migration.

## Native controls and role assignment

`applyComponentSystem(root = document)` assigns `data-control` to native buttons. It runs after rendering and when applicable dialogs are inserted. It changes presentation roles; it does not replace native button semantics or event handlers. Calling it again safely updates the role assignment.

Assignment order matters: navigation, storage status, primary, destructive, icon, stepper, onboarding selection, choice, row, quiet, then secondary fallback. New component selectors must be placed deliberately in this order. Use HTML attributes for state; never infer selected or disabled state from color alone.

| Contract | Current hooks | Usage and states |
|---|---|---|
| Button | `data-control="primary|secondary|quiet|destructive"` | One primary action per task; quiet links for supporting actions; destructive actions use critical styling. Primary controls are at least 52px tall, ordinary controls at least 44px. |
| IconButton | `data-control="icon|status"` | Square 44px target, accessible name, decorative SVG hidden from assistive technology. Storage status also uses local/ok/syncing/error classes and an explanatory status surface. |
| Choice | `data-control="choice"`, `aria-pressed` | Direct readiness, effort, time and display choices. Selection uses border, fill and weight alongside the state attribute. Onboarding selection remains a separate `selection` role because its cards have richer anatomy. |
| Field | Native `input` and `select` | Minimum 48px height, 16px input text, associated label and visible focus. Invalid input uses the critical stroke via `aria-invalid` or native `:user-invalid`; validation copy must explain recovery. Checkbox anatomy remains native and separate. |
| Row | `data-control="row"`, `.hid`, `.pick`, `.erow` | Keep text flexible and media bounded. History entries separate `.history-entry-title`, `-meta`, `-values` and `-action`. Reveal Delete intentionally and preserve Undo/focus behavior. |
| Overlay | `.workout-tools`, `.app-preferences`, `.photo-credits`; technique sheet integration | Shared surface, stroke, radius, scrim, title rhythm and close-control sizing. Width/content variants and technique layout remain specialized. Existing native dialog and focus restoration behavior is preserved. |
| Empty | `.progress-empty`, `.search-empty`, existing empty-state selectors | One plain explanation, one useful recovery action, no fabricated progress. Search reset and Go to Today remain direct actions. |
| Toast | `#toast[role="status"]`, `#toastUndo` | Announce the outcome without moving focus unnecessarily; expose Undo for reversible deletions. Preserve restoration of the affected entry and disclosures. |

## State matrix

| State | Shared behavior | Required implementation detail |
|---|---|---|
| Default | Semantic ink/surface/stroke and minimum target | Descriptive visible text or an accessible name |
| Hover | Existing fine-pointer hover treatment | Never required to discover the only action |
| Pressed | Existing subtle feedback, subject to reduced motion | Do not hide labels or move controls out of reach |
| Focus | `:focus-visible` action-color outline; fields use their focus rule | Preserve focus after render, dialog close and Undo |
| Selected | `aria-pressed="true"` choice styling; nav uses its current-state contract | Selection must be exposed programmatically |
| Disabled | Reduced opacity, default cursor, no transform/shadow | Use native `disabled`; disabled actions cannot be activated |
| Loading/status | Existing storage, timer and announcement semantics | Keep the status text truthful; do not invent a universal loading state for synchronous actions |
| Error | Critical color, input validity, explanatory copy | Describe what happened and how to recover; color alone is insufficient |

## Responsive behavior

- Phone layouts use bottom navigation, flexible content width and 44px minimum targets. Onboarding actions stay reachable with a sticky action area and safe-area padding.
- At 700px the existing two-column library/Progress layout applies. Display preferences center rather than docking near the bottom.
- At 1100px navigation becomes a left rail. Content keeps a readable maximum width instead of stretching every row.
- Landscape layouts with height up to 500px and widths 600–1099px use a compact rail and rearranged workout controls.
- Completion content can scroll internally while its actions remain reachable. At shorter heights, decorative completion/rest elements shrink before interaction targets.
- Media rows use a bounded thumbnail plus a `min-width:0` text column. Long exercise names, translated/large text and very small screens must be checked with real content, not only placeholder labels.

## Accessibility and interaction rules

Keep semantic headings, native buttons/fields, visible keyboard focus, label associations, meaningful image alternatives and generated-image disclosure. Dialogs need a name, a reachable Close action, contained focus and return focus to the opener. Timer/status announcements must not create repeated noise. Respect reduced motion; no interaction may depend on animation. Verify touch, keyboard, dark mode and large text. Avoid adding another disclosure where a short preview or direct choice removes a decision.

Progress must compare the same exercise step and set count. A concise recent-training preview is visible immediately; full history remains paginated. Never turn a polish change into a progression algorithm or stored-data migration without separate justification.

## Migration boundaries and validation

This foundation standardizes shared states and selected component anatomy. It does not remove all earlier palettes, generic button rules, raw spacing, radii or component-specific exceptions. Source-wide token inventories therefore include inactive/overridden styles and must not be presented as rendered-screen counts. Retire legacy rules in narrow groups with before/after evidence; avoid a wholesale stylesheet rewrite during feature delivery.

For each component change:

1. Run the relevant repository regressions and the full runner before release.
2. Capture phone, tablet, desktop, dark mode and short-landscape states.
3. Check overflow, target size, text wrapping, focus order, native disabled/selected states, dialog dismissal and return focus.
4. Exercise the real transition: workout completion/rest, search reset, history pagination, deletion/Undo and appearance selection where relevant.
5. Record local evidence separately from deployed verification. Isolated QA history must never be mistaken for user training data.

The companion component audit and before/after screenshots are review artifacts outside the served site. Do not expose tests, documentation or development files as application routes.

## Navigation inset contract

`syncAppInsets()` measures bottom navigation into `--app-nav-height`. A ResizeObserver and viewport resize update the value; desktop and landscape rails contribute zero bottom inset. Routine actions, timers and toasts consume the shared inset instead of assuming a fixed bar height. Dynamic CSS-variable injection is deliberate here because safe areas and text sizing affect the rendered height.
