# Settings layout

Release: 2026-10-26-settings-layout

The settings content scrolls independently of its heading and Done button. Dialog height remains bounded by the viewport. At 800px and above it uses two columns with save status spanning both; smaller screens keep a single column. Existing settings sections, native fields and handlers remain in place.

Cue mute buttons expose their current state through aria-pressed and a selected border. The muted status explains that sound and vibration choices stay saved. This changes presentation and status copy, not cue preferences or workout records.

Tests, screenshots and browser interaction checks were skipped at the user's request. Source synchronization copies modules into index.html and does not establish runtime correctness. Physical-device behavior remains unverified.
