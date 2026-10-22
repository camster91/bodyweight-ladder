# Loading placeholders

Reserve space while real content is loading.

## Anatomy and usage

Hide decorative placeholders from accessibility APIs. Announce loading once with a status message and replace with real content when it arrives.

```html
<div aria-busy="true"><p role="status">Loading your history…</p><span class="lui-skeleton" aria-hidden="true"></span></div>
```

## Interaction and states

Static skeletons avoid shimmer and respect reduced motion. Loading belongs to the parent region. Error recovery replaces the placeholder rather than leaving it indefinitely.

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

- Do: Hide decorative placeholders from accessibility APIs. Announce loading once with a status message and replace with real content when it arrives.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
