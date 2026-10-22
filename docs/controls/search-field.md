# Search fields

Narrow the visible collection without losing typing focus.

## Anatomy and usage

Use type=search, a visible label and a polite result count. Update results in place. Provide an explicit Clear button.

```html
<div class="lui-stack"><div class="lui-field"><label for="example-search">Find an exercise</label><input id="example-search" type="search" enterkeyhint="search" autocomplete="off" aria-describedby="search-result"></div><p id="search-result" role="status">Try push, pull or stretch.</p><button type="button" class="lui-button" data-demo="clear-search">Clear search</button></div>
```

## Interaction and states

Default, focus, disabled and empty-result states apply. Search itself has no selected state. Announce the count, not the whole collection.

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

- Do: Use type=search, a visible label and a polite result count. Update results in place. Provide an explicit Clear button.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
