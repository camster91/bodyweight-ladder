# Simpler plan and equipment sheets

The plan sheet leads with goal, weekly target, a short weekly summary and the workout estimate. Detailed planning, equipment eligibility and per-exercise explanations remain available under one native disclosure. The Done action closes the sheet; preferences continue saving on change, with wording that distinguishes an adjustable first workout from saved targets.

Equipment starts with five common choices. Nineteen additional supports are grouped in a native disclosure. Opening equipment to resolve a specific blocker expands those choices automatically. All 24 selectors remain in the form, so saving common choices preserves hidden true/false/unknown values. Cancel changes nothing. The existing equipment compatibility and started-workout preservation rules are unchanged.

Shared native fields have explicit light/dark surface and text colors. Equipment selectors are wide enough for full availability labels; very narrow screens stack the label and select. Exercise training settings now explain that started workouts retain their saved exercises and targets.

## Verification

- Five focused DOM/form checks pass: field coverage, hidden-value preservation, blocker expansion, Cancel, plan disclosure and state-aware wording.
- Seventeen focused lifecycle checks still pass.
- Synthetic component previews were rendered through the existing in-app browser over local HTTP. Dark 390px plan/equipment screenshots and light 768/1440px plan screenshots were captured. DOM width checks show no horizontal overflow at checked widths, including 320px equipment. Native equipment disclosure expanded successfully.
- These isolated previews use real sheet markup/styles with synthetic data and test adapters. They do not establish that live app navigation or all save handlers work in a real browser. That interaction gap and physical Android/iOS verification remain open.
- Full app suites remain skipped. Embedded source sync, inline JavaScript parsing and diff checks pass.

Screenshots and the original eight-screen review are in workspace `outputs/deep-screen-review/`.
