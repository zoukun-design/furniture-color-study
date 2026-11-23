# Furniture Color Study (234Lab.)

A one-page web app for choosing the desk colours of 須崎先生's area in the 須崎・印牧研究室 (a lab the user designed with others).
An isometric SVG model of the room shows the chosen colours, with 須崎先生 living in it: she walks, sits, works,
reads, drinks coffee at the window, and the sky, sun, weather and season follow the real time and weather of the lab.

- Repo: `zoukun-design/furniture-color-study`, served by GitHub Pages: https://zoukun-design.github.io/furniture-color-study/
- Owner: 力哉さん (GitHub `zoukun-design`). Not a programmer: explain in plain Japanese, decide technical details yourself.

## How to work with 力哉さん

- **Reply in Japanese.** Call him 力哉さん only when it helps.
- After every pushed change, paste the public URL with `?v=<short commit>` (cache-buster), e.g.
  `https://zoukun-design.github.io/furniture-color-study/?v=7cd5827`
- Commit and push straight to `main` (no PR) as `zoukun-design` (`-c user.name=zoukun-design -c user.email=zoukun-design@users.noreply.github.com`).
- Think about usability before being told: how a first-time viewer closes things, whether something is hidden in the browser
  vs. the home-screen app (iOS standalone), phone / iPad / PC.
- Quality bar: physically and ergonomically plausible, natural motion (no jerks, no teleporting hands), no layering errors
  (who is in front of whom), no sudden pops (fade in/out). He notices small things; check frames, not just a screenshot.
- Standing "hold" items: **QRコードの件は彼が言うまで保留.**
- Do not search for or copy photos of 須崎先生. Passwords and sign-ins are done by him. Account changes only on his explicit choice.

### Design taste (keep to it)
- Trendy, not AI-looking. No Inter / IBM Plex style fonts. Look to Instagram, especially overseas posts. Copying good patterns is fine ("パクっていい").
- Simple structure: no stacked haze / shadow / blur. Dim-only backgrounds behind sheets.
- Symmetric and centred; avoid off-centre layouts.
- Text on one line: no "…" truncation, no wrapping to escape.
- Information sits inside the photo.
- Phone conventions (reels, swipe); no confusing duplicate controls.
- Animations calm, appear and disappear at the same speed.
- Thin, uniform lines; icons drawn correctly (Hugeicons-style strokes, ~0.95 px on screen).
- No fake print textures.

## Files

- `index.html` — the whole app (HTML, CSS, JS, photos as data URIs). About 830 KB.
- `src/sensei.js` — the animated scene (須崎先生, sky, light, weather, the sky picker). **Edit this, then run `tools/build.sh`**,
  which copies it into index.html between `// ---- Suzaki sensei: a little life in the model.` and `render();photos();`.
  Never edit that block inside index.html directly. Code after `render();photos();` (the iPad/PC layout, wheel, keys,
  `__senIdle`) lives only in index.html and is edited there.
- `full/` — full-size product photos. `og.png`, icons, `manifest.webmanifest` — share card and home-screen app.
- `tools/` — checks (need `pip install playwright numpy pillow` and `playwright install chromium`):
  - `build.sh` — sensei.js → index.html (runs `node --check`).
  - `errcheck.py` — every scene, 90 s frame by frame, phone + PC. Must print `errors: []`. Run before every push.
  - `boxes.py save|check` — phone layout regression (the phone portrait layout must not move unless intended).
  - `visual_compare.py [rev]` — pixel compare of the room against a git revision (for "invisible" changes like performance).
  - `perf.py ['?at=10:30' ...]` — main-thread / raster cost per frame on a throttled phone.
  - `paint_flash.py` — shows what gets repainted each frame.
  - `shots.py [phone,ipadP,ipadL,pc,...] [photos]` — screenshots at each size.

## URL parameters and debug hooks

- `?at=HH:MM` fix the time · `?date=` · `?weather=clear|cloudy|rain|snow|storm|fog...` · `?scene=read|work|gaze|drawings|research|dance`.
- `window.__senManual=true` (init script) starts the scene stopped; then `__sen.run(sec)` steps it frame-exactly.
- `window.__sen`: `manual(on)`, `run(sec)`, `state()` (cur, sub, F, mug, slot…), `geo()`, `seq`. `window.__senEnv`: `env()`, `temp(t)`.
- `window.__senIdle()` (in index.html) — true while the room can't be seen; the scene loop rests then.

## Architecture notes (src/sensei.js)

- The drawing's svg is sized in fixed px by `fit()` (percent sizing made the whole SVG re-lay out every frame).
- `SVGElement.prototype.setAttribute` is patched to skip identical values. Avoid needless attribute churn.
- Scene order is handled by "slots" (`SLOT.top` = `#senTop`, `slotFront`, `slotB`, `senOverB`). She, her low parts and the plant
  move between slots for correct depth. Created with `createElementNS` (a null-namespace `<g>` once made her invisible).
- Light: `litMask` + the shade rect `SHD` (multiply over the room; her slots are `<use>`d into the mask with a silhouette filter).
  Sun patches `sunG` etc. are color-dodge groups masked by `sunMask*`. Those masks use the default objectBoundingBox region
  so a change repaints only around the patches. **SHD still repaints the whole room every frame while the sun is in
  (mornings to ~13:00 on clear days).** This is the main remaining performance cost. A fix needs a change to how the shade is built.
- Shadows: solids projected along the sunlight per surface; static shadow cache `SHC`; bbox reject. Plant shadows per leaf (`PLEAF`).
- Her fade: door-anchored, about 1 s smoothstep; her shadows fade with her.
- Hands: spring (om 10, fast 20, slow 6, acceleration cap). `HLAST` holds the target over a step-boundary frame.
  Target inertialization (`TRAW/TEFF/TOFF/TJT/TJD`): jumps over 2100 mm/s are blended out over 0.25–0.6 s.
- Sky picker: pill `.envb` in the stage; panel `.envp` fixed in body, centred on the card (visualViewport). Dim `.envbg` closes on tap.
  Round × `.envx` under the card. Escape closes. Taps outside are eaten so they don't press things beneath.
  Time comes before season. Temperatures in °C. Contrails always on; frequent lightning in storms.
- Loop: rests (`sen-rest` class on `<html>`) while `__senIdle()` or the svg isn't shown. The loop is capped at 60 fps on faster screens.

## Layout (index.html CSS `#rsp`)

- Phone (< 700 px wide, or portrait under 700 px tall): the original 520 px column. **Don't change the phone look unintentionally.**
- Tablet portrait (≥700×700, aspect ≤ 1.1): phone column widened until the model fills it; bigger swatches.
- Wide (≥640 px wide, aspect ≥ 1.1: iPad landscape, PC, landscape phones):
  - Model on the left.
  - Header column on the right: logo, TITLE/AREA/USER, Preview/Photos, then the colour panel (moved there by JS) at the bottom.
  - The menu opens in that column; clicking beside it closes it.
- The model hugs its own box (container queries), so the pill, share and Randomize sit on its corners.
- PC input:
  - Trackpad sideways swipes Preview/Photos.
  - Wheel: Main/Sub on the photos; next colour in the viewer (one step per gesture, queued while sliding); sideways switches desk.
  - Arrow keys move like swipes.
  - The viewer has round ↑↓ buttons and a "Scroll for next color" hint; a click beside the photo closes it.
  - Colour names show on hover.

## Open / offered, not decided

- Performance in the sunny state (SHD full repaint): asked which device felt heavy. No answer yet.
- Offered, unanswered:
  - reorder the sky panel to TIME → SEASON → WEATHER to match the pill;
  - fix the near-arm elbow bend when standing up;
  - slow the end-of-book (doneBook) motion.
- Known minor: a one-frame R-hand hiccup around leaveSeat el ≈ 1.07 was left.
