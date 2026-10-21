# Graphics update — 2026-10-21

The built-in imagegen tool edited the existing archer pull-up, diamond push-up,
and solid app icon references. Original files are retained. The app uses these
new exports so existing 30-day asset caches cannot hide the changes:

- `img/w/pull-archer-pull-up-clear.webp`: 900 × 600; straight bar with both grips connected.
- `img/w/push-diamond-push-up-clear.webp`: 900 × 600; overhead hand-position inset.
- `assets/brand/icon-maskable-512.png`: opaque 512 × 512; padded artwork for app masks.

The manifest keeps regular icons separate from the maskable icon. Compact views
use the existing single-pose images; full cards use movement diagrams with HTML
captions. Exercise images share a background and receive reduced brightness in
dark mode. Captions retain normal text contrast.

## Image editing prompt set

Archer: Preserve the mascot identity, blue shirt, green shorts, white shoes,
pale blue background, two start/finish panels, blue arrow and START/FINISH labels.
Correct the finish panel so a straight rigid horizontal bar connects the uprights
and both hands visibly grip that same bar. Show the bent-arm grip next to the
shoulder and the opposite arm extended along the bar. Avoid floating hands,
duplicate bars and disconnected supports. Landscape 3:2.

Diamond: Preserve the mascot, palette, clothing, two side-view positions, arrow
and START/FINISH labels. Add a large overhead inset above the poses with two
hands flat, thumbs and index fingers meeting around a diamond-shaped opening.
Label it HAND POSITION. Keep the inset clear of the poses. Landscape 3:2.

Maskable: Preserve the mascot, outfit, ladder, blue palette, linework and climbing
pose. Use an opaque full-bleed square blue background without baked-in rounded
corners. Scale down and center the mascot and visible ladder together, leaving
generous blue padding for circular and squircle masks. No text, outlines or border.

The generated diagrams were downscaled and encoded as WebP, and the app icon
was downscaled to PNG. No image-generation API key or CLI fallback was used.
