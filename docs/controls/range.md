# Sliders

Adjust an approximate continuous preference.

## Anatomy and usage

Use native range with a visible label and output. Use a number field or stepper when an exact value matters.

```html
<div class="lui-field"><label for="example-range">Rest duration · <output id="range-value" for="example-range">60 seconds</output></label><input id="example-range" data-lui-output="range-value" data-lui-unit="seconds" type="range" min="30" max="180" step="15" value="60"></div>
```

## Interaction and states

Native keyboard and touch handling. Default, focus and disabled apply. Keep the numeric value visible and update it on input.

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

- Do: Use native range with a visible label and output. Use a number field or stepper when an exact value matters.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
