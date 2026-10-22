# Direct choices

Expose a short set of frequent choices.

## Anatomy and usage

Use data-lui-choices="single" or "multiple" and buttons with data-lui-choice, data-value and aria-pressed. These are pressed buttons, not radio-role imitations.

```html
<div class="lui-choice" data-lui-choices="single" role="group" aria-label="Workout readiness"><button type="button" class="lui-button" data-lui-choice data-value="ready" aria-pressed="true">Ready</button><button type="button" class="lui-button" data-lui-choice data-value="light" aria-pressed="false">Lighter day</button><button type="button" class="lui-button" data-lui-choice data-value="short" aria-pressed="false">Short on time</button></div>
```

## Interaction and states

Selected fill, border and aria-pressed work together. bind(root) updates state and emits lui:change with {value, selected}. Disabled choices are skipped. Under 360px choices stack vertically.

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

- Do: Use data-lui-choices="single" or "multiple" and buttons with data-lui-choice, data-value and aria-pressed. These are pressed buttons, not radio-role imitations.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
