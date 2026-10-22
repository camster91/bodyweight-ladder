# Ladder Controls 1.0

A reusable, framework-free control library for Bodyweight Ladder. Twenty-five native HTML controls and patterns, scoped styles, light/dark themes, interaction helpers, copyable examples, token references and one documentation page per component.

## Try it

Open `catalogue.html` directly in a browser. Every specimen runs independently of workout storage. Search controls, change themes, validate fields, operate steppers and tabs with the keyboard, open dialogs and try a reversible notification. The catalogue embeds the same source files; it does not require a server or package install.

## Use in a static page

```html
<link rel="stylesheet" href="ui/controls.css">
<main class="lui">
  <button type="button" class="lui-button" data-variant="primary">Save</button>
</main>
<script src="ui/controls.js"></script>
<script>const dispose = LadderControls.bind(document);</script>
```

`controls.css` is opt-in through `.lui` and `.lui-*` classes. Include `.lui` on dialogs and toast containers too. Tokens are prefixed `--lui-`. No reset changes unscoped product controls. Set `document.documentElement.dataset.theme` to `light` or `dark`; omit it for the system theme. JavaScript does not persist preferences, log workouts, access a network, or modify history.

Use one binding root per subtree. `bind(root)` is idempotent for the same root and returns a disposer; do not bind overlapping roots. Delegated handlers support later inserted elements. For new steppers call `LadderControls.refresh(root)` to initialize bounds. HTML IDs and radio names must be unique in the consuming page. `data-demo` attributes in catalogue snippets are demonstration hooks; remove them in product markup and attach your real action handlers.

## API

| API | Contract |
|---|---|
| `bind(root = document)` | Enhance choices, steppers, tabs and dialog triggers. Returns a function that removes that root's listeners. |
| `refresh(root = document)` | Refresh stepper bounds and linked range outputs after insertion or programmatic state changes. |
| `openDialog(dialog, opener = document.activeElement)` | Native modal, scroll lock, Escape and return focus. A connected opener must be passed again after DOM replacement. Native dialog support is required. |
| `setBusy(button, boolean, label?)` | Preserve content and original disabled state. Temporarily disable and set `aria-busy`; restore after the real operation settles. |
| `fieldError(input, message)` | Add error copy and `aria-invalid`, preserving existing descriptions. Empty message clears the error. Parent must have `.lui-field`. |
| `toast(message, {action?, actionLabel?} = {})` | Plain text notification and optional synchronous action. Returns a dismiss function. Persist until dismissed/replaced; no hidden Undo timeout. |
| `applyAppControls(root = document)` | Compatibility adapter for the existing Ladder application's button roles. Separate from the portable `.lui` contract. |

Choice changes bubble a `lui:change` CustomEvent containing `{value, selected}`. Tab changes emit `{value: tab.id}`. Steppers emit native bubbling input/change events. Checkboxes, switches, radio inputs and selects emit their normal native events. Linked range outputs use `data-lui-output="output-id"` and optional `data-lui-unit="seconds"`.

```js
const dispose = LadderControls.bind(document);
document.addEventListener('lui:change', event => {
  // Save event.detail only in your application's explicit state handler.
});
async function save(button) {
  LadderControls.setBusy(button, true, 'Saving…');
  try { await saveYourData(); LadderControls.toast('Saved.'); }
  finally { LadderControls.setBusy(button, false); }
}
// On removal of an enhanced root:
dispose();
```

## Included controls

Buttons, icon buttons, text fields, search fields, select fields, text areas, checkboxes, radio groups, switches, direct choices, selection cards, number steppers, sliders, tabs, media rows, disclosures, dialogs, bottom sheets, notifications, inline messages, status labels, progress indicators, empty states, app navigation and loading placeholders.

The source manifest `components.cjs` contains each component's usage rules and copyable native markup. Generated documentation is in `../docs/controls/`. Each page describes anatomy, applicable states, keyboard semantics, responsive behavior, examples and adoption boundaries.

## Design contract

- Primitive tokens hold values; semantic tokens hold intent; component aliases consume semantic tokens. `tokens.json` is a generated flat CSS variable map. The CSS source is authoritative.
- Controls have 44px minimum touch targets, fields 48px, primary actions 52px. Compact spacing never reduces touch targets. Label text wraps.
- Choices and rows adapt below 360px; bottom sheets dock below 600px. Dialogs scroll within 85dvh (mobile sheets 90dvh), with safe-area padding and an explicit Close action.
- Loading, error and selected states only exist where meaningful. Native controls expose disabled/checked/selected; color alone never carries the state.
- Motion supports reduced-motion settings. No shimmer is required to communicate loading. Hover never reveals the only route to an action.
- Deliberate geometry exceptions: 1px borders; 3px focus outlines; 52×32px switch track with 24px thumb and 20px travel; 64×48px media; dialog widths and responsive breakpoints. Those are anatomy and viewport constraints, not ad hoc spacing variants.

## Adoption and maintenance

The app now embeds `controls.css`, `controls.js` and `app-foundation.css` from these sources. Existing buttons call `applyAppControls` through `applyComponentSystem`, so their shared role assignment has a single maintained source. Existing workout handlers and storage/progression logic remain app-owned. Portable `.lui` markup is ready for incremental adoption; the app has not been rewritten to use every portable pattern. Legacy app CSS outside the extracted foundation remains and is not counted as migrated.

The production server serves only the committed app HTML, manifest and permitted images. It does not expose this development library or documentation. Inline synchronization preserves the original no-build deployment: cloned `index.html` is ready to serve.

After editing library sources:

```sh
node scripts/sync-controls.cjs
node scripts/build-controls-docs.cjs
node scripts/sync-controls.cjs --check
node tests/run.js
```

Optional review export: `node scripts/build-controls-docs.cjs --out /absolute/review/folder`. Exported files include a self-contained catalogue plus the portable CSS/JS and component docs. Documentation generation never modifies workout logic.

Change tokens additively: introduce a new token, deprecate the old name, then remove after one release cycle. Document behavioral changes and update examples/tests in the same change. Version major for incompatible markup/API changes, minor for new controls, patch for compatible fixes. Owner: Bodyweight Ladder repository maintainers. Production adoption requires real flow, keyboard, light/dark and multi-viewport verification, not only a passing catalogue.
