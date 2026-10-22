# Inline messages

Explain a state where it can be resolved.

## Anatomy and usage

Keep messages near the relevant task. Use role=status for routine updates and role=alert only for newly introduced urgent failures.

```html
<div class="lui-alert" role="status">Your changes are saved in this browser.</div><div class="lui-alert" data-tone="error"><b>Could not save.</b> Check your connection and try again.</div>
```

## Interaction and states

Informational and error variants. Static examples do not use role=alert to avoid announcing artificial failures. Include a recovery action when the product has one.

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

- Do: Keep messages near the relevant task. Use role=status for routine updates and role=alert only for newly introduced urgent failures.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
