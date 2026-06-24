# Galaxy Defender

Galaxy Defender is a browser space shooter built with plain `HTML`, `CSS`, and `JavaScript`. It runs without npm install, without a backend, and without external game libraries.

This version uses the local art and video assets already in `design/images/`:

- looping welcome video
- pre-launch hero setup screen
- round intro video
- in-game hero ship video
- hero defeat video
- boss defeat / next-round video
- hero, enemy, and sub-enemy rendered image views

## How to run

### Node / npm local run

This is still a frontend-only game. `npm start` runs a local Vite static server, not a backend API.

```powershell
cd E:\Projects\program\game\SpaceShip_Shooting_Game
npm install
npm start
```

Then open:

```text
http://127.0.0.1:3000/
```

### Static build

The build copies the game files and local media assets into `dist/`.

```powershell
npm run build
```

### Docker run

Start Docker Desktop first, then run:

```powershell
npm run docker:build
npm run docker:run
```

Then open:

```text
http://127.0.0.1:8080/
```

### Kubernetes run

Build the image first and make sure your Kubernetes cluster can access `galaxy-defender:latest`.

```powershell
npm run docker:build
npm run k8s:apply
```

The Kubernetes manifest is in `k8s/galaxy-defender.yaml` and includes:

- `Deployment` with `replicas: 2`
- `Service` on port `80`
- `HorizontalPodAutoscaler` from 2 to 6 pods
- readiness and liveness probes

### Vercel hosting

Vercel should host this as a static frontend build from `dist/`. Docker and Kubernetes are for container platforms, not Vercel runtime hosting.

Files added for Vercel:

- `vercel.json`
- `.github/workflows/deploy-vercel.yml`

Required GitHub secret:

```text
VERCEL_TOKEN
```

The Vercel workflow uses `npm run build`, then deploys the prebuilt static output.

### Asset audit

Use this to find large videos/images/models that affect loading speed:

```powershell
npm run audit:assets
```

### Direct file open

Open `index.html` in a modern browser.

### Recommended local server

Video playback and `.glb` loading are more reliable from a local server:

```powershell
cd E:\Projects\program\game\SpaceShip_Shooting_Game
python -m http.server 8123 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8123/index.html
```

## What is in this build

- Welcome screen with autoplay looping `game_start.mp4`
- Real `.glb` hero and enemy model viewers on the welcome screen
- Left and right ship presentation around the center launch button
- Hangar / mission setup screen
- Real interactive `.glb` hero model viewer in the hangar screen
- Player name input
- Difficulty selection: `Easy`, `Normal`, `Hard`
- Sound on/off toggle
- Local leaderboard from `localStorage`
- Draggable hero preview in the setup area
- Mobile control mode selection before the mission starts
- Rules confirmation before gameplay starts
- Round intro using `hero_enter.mp4`
- In-game hero overlay using `hero_stay.mp4`
- Hero defeat video using `hero_explotion.mp4`
- Boss defeat transition using `enemy_explotion.mp4`
- Sub enemy image from `design/images/sub_enemy/sub_enemy_top_view.png`
- Main enemy image from `design/images/enemy/Ememy_top_view.png`
- Round-based background color changes
- Score, lives, shield timer, round, health, and high score HUD
- Power-ups, floating score text, screen shake, pause, restart, and local high score

## Controls

### Desktop

- Move: `Arrow Keys` or `W A S D`
- Shoot: `Space`
- Pause / Resume: `P`
- Restart: `R`

### Mobile option 1: Buttons

- `Left` button moves left
- `Right` button moves right
- `Fire` buttons shoot

### Mobile option 2: Tilt / Touch

- Tilt the device left and right to move
- Drag on the touch area to reposition
- Corner `Fire` buttons shoot

## Start-to-finish flow

1. The project opens on the looping welcome video.
2. The left side shows the hero `.glb` model rotating slowly.
3. The right side shows the enemy `.glb` model rotating slowly.
4. The center launch button opens the hangar setup screen.
5. The player enters a name, chooses difficulty, sound, and mobile control mode.
6. The player rotates the hero model in 3D if they want.
7. `Start Mission` opens the rules confirmation.
8. `OK, Start` plays the hero entry video.
9. Gameplay starts with the hero rendered from `hero_stay.mp4`.
10. Sub enemies spawn until the score threshold is reached.
11. The main enemy appears.
12. Defeating the boss plays the enemy explosion transition.
13. Two seconds before that transition ends, the next-round label appears.
14. The next round begins with the hero entry video again and a new background theme.
15. If the player loses all lives, the hero explosion video plays.
16. Two seconds before the hero explosion video ends, replay and quit buttons appear.

## Asset map

### Video assets

- `design/images/video/game_start.mp4`
- `design/images/video/hero_enter.mp4`
- `design/images/video/hero_stay.mp4`
- `design/images/video/hero_explotion.mp4`
- `design/images/video/enemy_explotion.mp4`

### Hero image assets

- `design/images/hero/hero_right_view.png`
- `design/images/hero/3-4_orthographic_view.png`
- `design/images/hero/hero_top_view.png`
- `design/images/hero/hero_left_view.png`
- `design/images/hero/hero_front_view.png`
- `design/images/hero/hero_back_view.png`

### Enemy image assets

- `design/images/enemy/Ememy_left_view.png`
- `design/images/enemy/Ememy_right_view.png`
- `design/images/enemy/Ememy_top_view.png`
- `design/images/enemy/Ememy_front_view.png`
- `design/images/enemy/Ememy_back_view.png`
- `design/images/enemy/Ememy_3-4_orthographic_view.png`

### Sub-enemy image assets

- `design/images/sub_enemy/sub_enemy_top_view.png`
- `design/images/sub_enemy/sub_enemy_left_view.png`
- `design/images/sub_enemy/sub_enemy_right_view.png`

### Model source files

- `design/images/3d-model/hero.glb`
- `design/images/3d-model/enemy.glb`
- `design/images/3d-model/hero2.glb`

This build includes a small custom WebGL `.glb` viewer for the welcome and hangar screens, so the hero and enemy models are rendered directly from the local `hero.glb` and `enemy.glb` files without adding a third-party 3D framework.

## Project files

- `index.html`: screens, videos, HUD, mobile controls
- `src/styles.css`: layout, welcome screen, hangar screen, HUD, responsive controls
- `src/game.js`: game loop, transitions, collision logic, local storage, sounds, mobile input, custom WebGL `.glb` viewer
- `.github/workflows/deploy-pages.yml`: GitHub Pages deploy workflow

## Verification notes

I verified:

- `src/game.js` parses with `node --check`
- the project serves over `python -m http.server`
- `http://127.0.0.1:8123/index.html` responds with HTTP `200`

The browser helper available in this environment was not usable for a full visual automation pass, so final visual QA should still be done in a normal browser on this machine.

## Image generation prompts

1. Player spaceship image prompt: `2D cartoon sci-fi hero spaceship, neon cyan glow, browser arcade game style, transparent PNG, top-down game-ready silhouette, sharp edges, readable at small size`
2. Enemy spaceship image prompt: `2D cartoon sci-fi enemy fighter, red-orange hostile glow, top-down arcade silhouette, transparent PNG, readable shape, browser game asset`
3. Boss spaceship image prompt: `2D cartoon sci-fi mothership boss, heavy armor plating, magenta and orange weapon lights, top-down transparent PNG, arcade boss scale`
4. Bullet image prompt: `2D neon plasma bullet, bright cyan arcade laser bolt, transparent PNG, narrow vertical projectile, readable at small size`
5. Shield power-up image prompt: `2D shield icon power-up, cyan energy ring with futuristic shield symbol, transparent PNG, glowing arcade item`
6. Rapid fire power-up image prompt: `2D rapid fire power-up icon, yellow lightning blaster symbol, transparent PNG, neon arcade pickup`
7. Extra life power-up image prompt: `2D extra life power-up icon, green health cross with glow, transparent PNG, arcade pickup`
8. Double bullet power-up image prompt: `2D double shot power-up icon, twin pink laser symbols, transparent PNG, neon arcade pickup`
9. Score boost power-up image prompt: `2D score boost power-up icon, purple star and x2 mark, transparent PNG, arcade pickup`
10. Explosion sprite image prompt: `2D sci-fi explosion sprite sheet, multiple frames, orange and yellow plasma burst with sparks, transparent PNG, browser arcade animation`
11. Space background image prompt: `2D dark blue space background, stars and soft nebula glow, seamless arcade backdrop, high contrast for UI readability`

## GitHub Pages deployment

This repo includes a GitHub Actions workflow for Pages deployment.

Typical setup:

1. Push the repository to GitHub.
2. In repository settings, enable GitHub Pages and set source to `GitHub Actions`.
3. Push to `main` or run the workflow manually.

The workflow publishes:

- `index.html`
- `src/`
- `design/`
- `README.md`
