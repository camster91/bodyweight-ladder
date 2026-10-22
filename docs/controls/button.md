# Buttons

Commit an action with one clear priority.

## Anatomy and usage

Use one primary action per task. Use danger for removal; keep its label specific. Compact changes padding, never the 44px touch target.

```html
<div class="lui-inline"><button type="button" class="lui-button" data-variant="primary" data-demo="save">Save workout</button><button type="button" class="lui-button">Edit plan</button><button type="button" class="lui-button" data-variant="quiet">Skip today</button><button type="button" class="lui-button" data-variant="danger">Remove exercise</button><button type="button" class="lui-button" disabled>Unavailable</button></div>
```

## Interaction and states

Use native disabled. setBusy(button, true, "Saving…") preserves the original label and disabled state; setBusy(button, false) restores them. Loading is for real async work; the catalogue only simulates it.

| State | Contract |
|---|---|
| Default | Native semantic element, visible label, semantic color tokens. |
| Hover / pressed | Interactive actions only; fine pointer hover never carries essential information. |
| Focus | Visible outline; native keyboard operation. |
| Disabled | Native disabled for supported controls. Noninteractive content: not applicable. |
| Selected / current | Only choices, tabs, selection inputs and navigation; use the relevant ARIA or native attribute. |
| Loading | Async actions use setBusy; regions use aria-busy. Synchronous controls: not applicable. |
| Error | Fields use fieldError and explanatory copy; noneditable controls have no validation state. |

Unsupported states are described above; do not add ARIA states just to imitate a visual style.

## Responsive and accessible behavior

All interactive targets remain at least 44 CSS pixels. Text and labels wrap. Choices stack below 360px; rows may wrap; sheets dock below 600px. Test with real labels and 200% text zoom. Honor native labels, fieldsets, roles and IDs in the example. Respect reduced motion and keep recovery text visible.

## Do and avoid

- Do: Use one primary action per task. Use danger for removal; keep its label specific. Compact changes padding, never the 44px touch target.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
