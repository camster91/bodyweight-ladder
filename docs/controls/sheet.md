# Bottom sheets

Present a compact mobile task with familiar dismissal.

## Anatomy and usage

Use the same dialog API with data-presentation=sheet. This is a responsive presentation, not another state model.

```html
<button type="button" class="lui-button" data-lui-dialog="sheet-example">Open workout sheet</button><dialog class="lui lui-dialog" data-presentation="sheet" id="sheet-example" aria-labelledby="sheet-title"><header><h2 id="sheet-title" tabindex="-1">Workout options</h2><button type="button" class="lui-button" data-icon data-lui-close aria-label="Close workout options">×</button></header><p>Keep frequent settings direct and make the next action clear.</p><button type="button" class="lui-button" data-variant="primary" data-lui-close>Apply choices</button></dialog>
```

## Interaction and states

Under 600px it docks at the bottom and respects safe areas; wider screens use a centered dialog. Native focus/Escape contract is shared. No drag gesture is required to dismiss.

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

- Do: Use the same dialog API with data-presentation=sheet. This is a responsive presentation, not another state model.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
