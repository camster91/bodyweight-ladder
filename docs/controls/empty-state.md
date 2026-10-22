# Empty states

Explain missing content and offer one useful next step.

## Anatomy and usage

State what will appear and how to create it. Use one recovery action. Do not invent achievements or add unnecessary illustration.

```html
<div class="lui-empty"><h3>Your training story starts here.</h3><p>Complete your first exercise to see your history.</p><button type="button" class="lui-button" data-variant="primary" data-demo="empty">Try a workout</button></div>
```

## Interaction and states

This is content, not a control. Only its recovery button has hover, focus, disabled or loading.

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

- Do: State what will appear and how to create it. Use one recovery action. Do not invent achievements or add unnecessary illustration.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
