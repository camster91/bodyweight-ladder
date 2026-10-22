# App navigation

Move between primary destinations.

## Anatomy and usage

Use named nav and real anchors with aria-current=page. Preserve actual URLs in production. The demo only changes its sample current destination.

```html
<nav class="lui-nav" aria-label="Example app navigation" id="demo-navigation"><a href="#demo-today" aria-current="page">Today</a><a href="#demo-exercises">Exercises</a><a href="#demo-progress">Progress</a></nav><p id="nav-result" role="status">Today selected in this example.</p>
```

## Interaction and states

Current page uses aria-current. Link focus stays native. Navigation is distinct from tabs; no arrow-key tab behavior is added. This library does not impose a fixed screen position.

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

- Do: Use named nav and real anchors with aria-current=page. Preserve actual URLs in production. The demo only changes its sample current destination.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
