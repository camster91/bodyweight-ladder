# Tabs

Switch between adjacent views in one context.

## Anatomy and usage

Every tab needs aria-controls, an ID, aria-selected and matching labeled panel. One tab starts at tabindex=0; others use -1. Do not use tabs for unrelated navigation.

```html
<div class="lui-tabs" data-lui-tabs><div role="tablist" aria-label="Training detail"><button type="button" class="lui-tab" id="tab-overview" role="tab" aria-selected="true" aria-controls="panel-overview">Overview</button><button type="button" class="lui-tab" id="tab-history" role="tab" tabindex="-1" aria-selected="false" aria-controls="panel-history">History</button></div><div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" tabindex="0">Your selected exercise and current goal.</div><div id="panel-history" role="tabpanel" aria-labelledby="tab-history" tabindex="0" hidden>Your saved sessions belong here.</div></div>
```

## Interaction and states

bind(root) supports Arrow keys, Home, End and skips disabled tabs. Activation is automatic on arrows. Set aria-orientation=vertical for vertical tablists. Selected state is aria-selected, not aria-pressed.

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

- Do: Every tab needs aria-controls, an ID, aria-selected and matching labeled panel. One tab starts at tabindex=0; others use -1. Do not use tabs for unrelated navigation.
- Avoid replacing native semantics with a styled div, hiding required actions behind hover, or inventing loading/error/selected states where they do not apply.

## Adoption

These portable .lui controls are available for new markup. Existing Ladder screens retain their compatible app adapter; see [library README](../../ui/README.md) for the migration boundary.
