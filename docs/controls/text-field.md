# Text fields

Collect a short, labeled value.

## Anatomy and usage

Keep the label visible. Add hint text with aria-describedby. Error copy explains recovery; placeholders never replace labels.

```html
<form id="example-form" class="lui-stack" novalidate><div class="lui-field"><label for="example-name">Exercise name</label><input id="example-name" name="name" maxlength="40" required aria-describedby="name-hint" placeholder="e.g. Burpees"><small id="name-hint">Up to 40 characters.</small></div><button class="lui-button" type="submit">Validate example</button></form>
```

## Interaction and states

fieldError(input, message) adds accessible error text and aria-invalid. Pass an empty string to clear it while preserving existing descriptions. Default, focus, disabled, readonly and error use native attributes.

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

- Do: Keep the label visible. Add hint text with aria-describedby. Error copy explains recovery; placeholders never replace labels.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
