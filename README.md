# 幻球傳奇 / Mystic Ball Legends — Alpha 0.3.3

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

## Alpha 0.3.1
Rounded 1.45-unit corner rails share geometry with puck/mallet boundary constraints.
Arc-normal reflection and low-speed release prevent resting in sharp corners.
An adaptive orthographic match camera fills the available touch area; the compact HUD
sits outside the play surface. Portrait, landscape and host/guest input projection are tested.
The user confirmed live multiplayer worked on Alpha 0.3. Networking is unchanged.

## Alpha 0.3.2
After results, either player can return both peers to the existing lobby. The host can
change the arena, and each player selects only their own character. Any selection
change resets both Ready flags. Host-owned settings revisions reject stale Ready
messages; guest selection requires acknowledgement before Ready. Gameplay locks all
selections. Both peers then start with an identical fresh match configuration.
Room protocol version 4 isolates incompatible clients; both players should refresh
once after updating. Subsequent matches keep the same room and connection.

## Release assets / mobile cache (Alpha 0.3.3)
After updating package.json version, run `npm run release:assets` before publishing.
This stamps the HTML, stylesheet and all local static/dynamic module imports with the
same release query, and writes version.json. The bootstrap checks that manifest with
a unique query and no-store, with a 2.5-second offline fallback. A stale installed
bootstrap navigates to a versioned page only before starting play (or restoring a menu
from the browser back-forward cache); live matches and rooms are never interrupted.
To recover browsers still holding pre-0.3.3 HTML, open `/?v=0.3.3` once.
The version badge now remains visible on mobile.
