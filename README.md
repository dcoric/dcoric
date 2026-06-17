# dcoric.dev — ARCADE

A gamified, retro-arcade version of Denis Ćorić's portfolio/business profile.
Instead of a static site, visitors explore a top-down pixel world, walk into
buildings to read about Denis, inspect a skill tree, accept "quests" (projects),
visit open-source guilds, collect trophies, and hunt a hidden treasure chest.

Built with **vanilla HTML/CSS/JS + Canvas + Web Audio** — no frameworks, no build
step, no external assets. All sound is synthesized at runtime and all sprites are
drawn from code.

## Run it

It's static. Any of these work:

```bash
# Option A: Python
python3 -m http.server 8000
# open http://localhost:8000

# Option B: Node
npx serve .

# Option C: just double-click index.html
```

(Double-clicking works because it uses plain `<script>` tags, not ES modules.)

## Controls

| Action         | Keys                |
|----------------|---------------------|
| Move           | Arrow keys / WASD   |
| Interact / OK  | Space / Enter       |
| Close panel    | Esc                 |
| Toggle music   | M                   |

On-screen D-pad + action button are available for touch devices.

## What to do

- **PRESS START** on the title screen.
- Walk into the 6 buildings:
  - **Home** → About / bio / stats
  - **Armory** → Skill tree (TypeScript, React, AWS, …)
  - **Quest Board** → Projects (ReportPilot, Git Proxy, Redstone, …)
  - **Guild Hall** → Open-source contributions (FINOS, Apache, Spotify, G-Research)
  - **Trophy Hall** → GitHub + in-game achievements
  - **Mailbox** → Contact links
- Find the **hidden treasure chest** in the far corner of the map.
- Try the **Konami code** (↑↑↓↓←→←→ B A).
- Read the **welcome sign** in the plaza (walk up to it, press Space).

## Achievements

GitHub badges (Pull Shark x3, Pair Extraordinaire x2, YOLO, Quickdraw) plus
in-game ones: Cartographer, Scholar, Armorer, Guildmaster, Connected, and a
hidden Konami trophy.

## Files

```
index.html          # structure + overlays
css/style.css       # retro pixel UI, CRT effect, panels
js/data.js          # all profile content (from dcoric.dev + github.com/dcoric)
js/audio.js         # chiptune + SFX engine (Web Audio, no assets)
js/sprites.js       # 16x16 pixel sprite definitions + renderer
js/world.js         # procedural tile map, buildings, collision, doors, camera
js/game.js          # main engine: loop, input, movement, panels, HUD, achievements
```

## Tech notes

- Canvas internal resolution: 896×576 (28×18 tiles × 32px), CSS-scaled & pixelated.
- Grid-based RPG movement with smooth interpolation and 2-frame walk animation.
- Camera follows the player, clamped to a 40×30 map.
- Minimap renders explored buildings + player position.
- CRT overlay via CSS scanlines + vignette + subtle flicker.

© Denis Ćorić — Belgrade, Serbia
