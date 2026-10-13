# Zion A.D. — Decision record

This separates **player-approved requirements** from **revisable engineering choices**. The eight October 2026 decisions are binding. Changes require explicit player direction, not engineering convenience.

| ID | Approved decision | Implementation invariant |
| --- | --- | --- |
| D001 | Integral hybrid built from 0 A.D. | Genuine 3D, real-time native RTS plus societal simulation |
| D002 | Continuous time and age tipping points | No turn-based historical chapters; internal altitude + alpha/beta/gamma/delta labels hidden |
| D003 | Classic RTS control | Players directly select citizens, assign jobs, build, train and fight |
| D004 | Multiple legitimate routes to Zion | No single ideology, government, cultural practice or economy guarantees victory |
| D005 | Warfare with societal consequences | Retain actual armies/combat; enduring costs and possibilities for peace/recovery |
| D006 | Multiple ways to advance | Science, economy, culture, spirituality and institutions unlock a player-initiated age transition |
| D007 | Government, laws and physical institutions connected | All three affect world, economy and collective experience |
| D008 | Complete early-game progression first | A real, tested native desktop game before expanding all 2,000 years |

## Revisable technical decisions

- T001: Keep all changes within the Pyrogenesis/0 A.D. fork, no separate web simulator.
- T002: Reuse original 0 A.D. models/phases for the current engine integration slice; replace with stage-specific gameplay/assets over time.
- T003: Provisional eight-dimensional welfare model and four integral perspectives are game heuristics, not objective measures of human worth.
- T004: Pair-based Civic Center research is the initial governance interface, later evolving into funded, changeable institutions.
- T005: Distinguish unit/schema validation, real headless engine, rendered 3D, AI match, save/replay, desktop package, and human playtest as separate gates.
- T006: Development-only ZionEngineTest.js injects buildings/resources/phases to verify integration; its success does **not** establish normal pacing.
- T007: Social state must be deterministic, serializable and player-privacy-safe. GUI reads must not mutate it.
- T008: Existing licenses, original asset provenance and credits stay intact.

## Design details still open

Names/visuals of later ages, their number and relative pacing, particular cultural traditions, precise economic policy set, multiplayer modes, and detailed campaign story arcs are not yet player-decided. Proceed with reversible gameplay experimentation and raise a question only if a binding decision is truly necessary.

See [roadmap](../ROADMAP.md), [architecture](ARCHITECTURE.md) and [acceptance contract](GAMEPLAY-CONTRACT.md).
