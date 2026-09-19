# 幻球傳奇 / Mystic Ball Legends — Alpha 0.3

Static ES-module 3D air-hockey game for the existing GitHub Pages URL.

## Play
Drag your mallet in your half. WASD / arrows also work; Space arms a skill.
Choose a character and an arena, then start AI practice or connect with friends.
Skills last 5 seconds and recharge 14 seconds after activation. Goals clear active skills.
- 皮皮熊: elastic body collision within a bounded radius.
- 吸吸鴨: attraction, capture, and release when struck; brief recapture grace.
- 跳跳貓: sweeps the rear half on a fixed defensive line, outside goal exclusion zone.

Five arenas: Classic, Space (low drag), Ice (faster), Desert (sand zones), Wind (three visible wind states).

## Architecture
- `src/game/Physics.js`: renderer-independent fixed 240 Hz authoritative simulation.
- `src/game/Scene.js`, `Arena.js`: Three.js scene and reusable mesh construction.
- `src/characters/Characters.js`: original procedural 3D mascots.
- `src/config/game.js`: tunable character, arena and match rules.
- `src/multiplayer/RoomService.js`: host-authoritative PeerJS/WebRTC transport.
- `src/main.js`, `src/ui/style.css`: menu, lobby, controls, HUD, results.

## Local development
Node 20+ for tests: `npm test` (no installation needed).
Serve with `python3 -m http.server 4173`, then open http://localhost:4173.
Do not open index.html as a file URL: modules and WebRTC need a web origin.
No build step: GitHub Pages deploys main at repository root. Keep repository name unchanged.

## Multiplayer scope and limits
Rooms and random matching use **real** PeerJS WebRTC connections, not AI substitutes.
PeerJS public signaling coordinates discovery; host computes all puck, goal and skill state.
Guest sends target input; host clamps movement and validates cooldown and placement.
Snapshots are sent at 30 Hz; guest rendering interpolates.
Four-digit rooms have optional SHA-256 password comparison over the data channel.
Both players must Ready; replays require Ready again. Disconnects stop the match.

Random matching is an **experimental single waiting slot**, classic / 5 / skills on.
The first seeker claims the public matching peer ID; the second connects. Once paired,
the host releases its signaling ID while keeping its data channel alive, making the slot
available for the next pair. Concurrent join races may return a full-room error; retry.
This is not a production matchmaking queue. No permanent matchmaking backend is deployed.
Public PeerJS signaling is a third-party dependency and has no availability guarantee.
STUN-only direct connectivity can fail under symmetric NAT / corporate firewalls. A production
release needs an owned signaling/matchmaking server and authenticated TURN credentials.
Do not place persistent TURN secrets in the public repository. Host-authoritative play is
suitable for friendly games, not competitive anti-cheat. Backgrounding the host pauses
simulation; a prolonged interruption ends the session. No reconnect/resume or accounts yet.

## Assets and licenses
Characters and arena meshes are original procedural geometry.
Bundled Three.js 0.180.0 and PeerJS 1.5.5 are MIT licensed; licenses in vendor.
A Noto Sans TC subset is bundled locally under SIL OFL 1.1 (vendor/NOTO-OFL.txt).

## Validation
`npm test`: scoring/posts, input bounds, high-speed impacts, all three skills, cooldowns,
expiry, arena effects and snapshot round-trip. Browser QA covers desktop/mobile navigation, countdown, skill arming, pause and exit.
Local signaling completed offer/answer exchange, but this sandbox produced no ICE candidates;
end-to-end WebRTC gameplay remains unverified. Public Internet / cellular interoperability
requires a real-device test. Room protocol tests use an in-memory transport and do not prove
network connectivity. This is an Alpha release, not a production multiplayer launch.
