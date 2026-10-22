# Number steppers

Adjust a bounded count directly.

## Anatomy and usage

Use an editable number input, min/max/step and named decrease/increase buttons. bind(root) clamps through native stepUp/stepDown and disables bounds.

```html
<div class="lui-stack"><label for="example-sets">Sets</label><div class="lui-stepper" data-lui-stepper><button type="button" class="lui-button" data-lui-step="down" aria-label="Fewer sets">−</button><input id="example-sets" type="number" min="1" max="6" step="1" value="3" inputmode="numeric"><button type="button" class="lui-button" data-lui-step="up" aria-label="More sets">+</button></div></div>
```

## Interaction and states

Bounds disable the relevant button. Manual edits remain native and require form validation. input and change events bubble after a step. Disabling the input disables both buttons after an input/change event or refresh binding.

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

- Do: Use an editable number input, min/max/step and named decrease/increase buttons. bind(root) clamps through native stepUp/stepDown and disables bounds.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
