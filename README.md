# City Drive 3D
Free-roam 3D driving game (Three.js). Runs in desktop and Android browsers.

## Run
ES modules need a web server (not file://). Internet is needed once to load Three.js from a CDN.
- Windows: install Python, then in this folder run `python -m http.server 8000` and open http://localhost:8000
- Android: with the PC and phone on the same Wi-Fi, open http://<PC-IP>:8000 in Chrome.

## Controls
W/S/A/D or arrows drive, Space handbrake, C camera, R reset, Esc pause, mouse drag look. Touch: on-screen buttons, drag to look.

## Files
index.html, styles.css, js/: main (game loop, settings), car (models, physics, collisions, damage), city, traffic, camera, controls (keyboard + touch), ui, audio (procedural, no asset files).

## Physics choice
Custom lightweight arcade-sim model (no physics library): per-car mass, grip, steering, handbrake slide, suspension tilt, circle-vs-box collisions. A full engine would cost mobile performance for little gain here.

## Limitations
No LOD (fog + instancing + capped traffic instead); no streetlights or road signs; traffic has no lane changes; parked-car lots are empty asphalt; damage is panel deformation, darkening and a damage meter (no detachable parts); traffic collisions use simple circles; untested on real devices.

## Infinite world (chunk streaming)
- Chunk = 3x3 blocks (222 m). Everything (roads, districts, buildings, trees, lights) is a pure function of `seed` + global block coordinates (`js/city.js`), so neighbouring chunks always connect and revisits are identical.
- Districts: downtown, commercial, residential, industrial, park, parking (smooth noise fields).
- Streaming: chunks in a radius around the player plus a look-ahead point along the velocity are queued nearest-first (max 2 built per frame, ~3 ms budget); far chunks are released into a pool and reused (preallocated InstancedMeshes).
- LOD: ring 0-1 full detail + colliders; ring 2 buildings/roads/sidewalks only; ring 3+ flat-shaded silhouettes. Traffic simulation is reduced beyond 130 m and limited to ~220 m around the player.
- Chunk distance is configurable in Settings (Short/Medium/Long); fog scales with it.
- Save (localStorage): seed, position, vehicle, graphics, and world changes (trees knocked down at speed stay down).
- Not done: highways (all roads are city streets), async generation in a Web Worker, damage persistence.
