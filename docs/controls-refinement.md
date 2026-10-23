# Controls and menu refinement

Refined the existing control system without changing coaching decisions or progress data.

- Workout options isolate the alternatives subpage, label internal navigation consistently, and disable workout-changing actions during active holds with an explanation.
- Training settings explain that changes apply immediately and offer Done. Priority buttons describe relative selection priority; sets have exercise-specific accessible names.
- Category filters retain an empty active selection so it can be cleared. Keyboard focus stays with priority changes, hiding and restoring exercises.
- Shared choices wrap long labels, disabled controls avoid active decoration, sheet headers preserve close targets, and scrollable controls reserve room for focus outlines.
- Portable dialogs focus their heading when no autofocus control exists. Display preferences include Done.

Validation: inline JavaScript parsing, generated-source consistency, whitespace checks, and manual browser walkthrough of menus at 390 x 844 and 1024 x 768. Automated application suites remain skipped at the user request. Screenshots: outputs/controls-refinement in the task workspace. No workout sets recorded during the walkthrough.
