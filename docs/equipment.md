# Equipment compatibility

`ui/equipment.js` is a pure, dependency-free module exposed as `LadderEquipment`
and CommonJS. Add `/* LADDER_EQUIPMENT_START */` and
`/* LADDER_EQUIPMENT_END */` inside a script before the app; synchronize with
`node scripts/sync-equipment.cjs`. `--check` checks the embedded source.

## Availability model

`normalize(source)` returns a flat map of capability IDs to `true` (available),
`false` (unavailable), or `null` (not confirmed). Only explicit booleans count.
Floor space, a wall, and one stable chair are the standard home baseline;
explicit false overrides that baseline. Every specialist support and load starts
unconfirmed. A legacy `{bar, weights}` object confirms only those capabilities.
Never convert unknown equipment into false during migration, and never delete
existing workout history or draft sets because of a changed availability answer.

`CAPABILITIES` supplies IDs and readable labels for controls. Persist the normalized
map in app preferences. An unconfirmed requirement should offer confirmation or
another compatible variation, rather than silently entering the automatic plan.

`requirements(gear, {stepName})` maps each exact current TRACKS step[6] string to groups. Every
group must be satisfied; any capability within a group suffices. `check(gear,caps,{stepName})`
returns `compatible`, readable `missing` and `unknown` lists, corresponding
`missingKeys` and `unknownKeys`, and the parsed `requirements`.

```js
LadderEquipment.check('Table + chair', {table:true}); // compatible
LadderEquipment.check('Table', {bar:true});          // unknown table
LadderEquipment.check('Dip bars or 2 chairs', {dipBars:false,twoChairs:true});
// compatible: the second alternative is explicitly confirmed
```

An unknown future gear string remains unconfirmed; it never falls back to no
equipment. Text normalization handles whitespace and case, not guessed synonyms.

## Limits requiring app integration

This module uses the supplied gear field, not exercise names or photos. The gear
field currently calls a straight-bar dip simply `Bar`; the app must pass
`{stepName: st[0]}` as the third `check` argument (or second `requirements` argument)
so that step uses the separate `straightDipBar` capability. The explicit refined
gear string `Straight dip bar` is also supported. A
pull-up-bar answer alone does not establish that a bar permits straight-bar dips.

General `weights` means one suitable hand-held load. It does not confirm a pair,
a heavy carry bag, a pinchable load, or a swing-safe load. A normal chair does not
confirm two suitable chairs, a bench, table, counter, doorway anchor, or dip bars.
Availability answers never certify load capacity, stability, or safe technique.
