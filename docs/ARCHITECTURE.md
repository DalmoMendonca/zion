# Zion A.D. — Technical architecture

## Existing engine and entry points

Zion A.D. remains a **fork**, not a mod-only companion or web prototype. Use Pyrogenesis's real entity, ownership, position, resource, production, technology, pathfinding, diplomacy and combat systems.

| System | Native code / data | Role and known issue |
| --- | --- | --- |
| Social scoring | binaries/data/mods/public/maps/scripts/ZionModel.js | Provisional deterministic model; avoid perpetual lifetime-stat bonuses |
| In-engine victory | binaries/data/mods/public/maps/scripts/ZionVictory.js | Native first-covenant logic; currently embeds the model source due to isolated script scope |
| E2E real-engine test | binaries/data/mods/public/maps/scripts/ZionEngineTest.js | Two accelerated governance paths and a native victory; phases/resources are injected |
| Technologies | binaries/data/mods/public/simulation/data/technologies/zion*.json and pair_zion*.json | Costs, conditions, native value modifications |
| Civic Center | binaries/data/mods/public/simulation/templates/template_structure_civic_civil_centre.xml | Research via native timed production queue |
| GUI bridge | binaries/data/mods/public/simulation/components/GuiInterface.js | Read-only per-player GetZionStatus must be on exposedFunctions allowlist |
| Native HUD | binaries/data/mods/public/gui/session/ZionStatus.js / ZionStatus.xml | Live report; inspect real rendered screenshots and spectator behavior |
| Native CI | .github/workflows/native-fast-smoke.yml | Actual engine launches and timed research |
| Graphical CI | .github/workflows/native-graphical-smoke.yml | Full LFS, software GL, screenshot and error scan |
| C++ CI | .github/workflows/native-engine-smoke.yml | Builds genuine Pyrogenesis executable |

## Target architecture

1. **Player commands:** Keep unchanged RTS selection, pathfinding, gathering, construction, training, formations and combat. Never force governance-only indirect control.
2. **Physical simulation:** Observe resources, workers, consumption, production, military casualties, trade, territory, accessible institutions and environmental depletion from real in-world entities.
3. **Societal simulation:** Synchronized, serialized component tracks bounded per-period/per-capita provision, dignity, freedom, communion, prosperity, wisdom, ecology and resilience, alongside remembered trust and trauma. A GUI frame never recalculates a whole civilization.
4. **Governance:** Separate authority/government, enacted law/policy, staffed/funded built institutions, and actual compliance/legitimacy. Policies affect ordinary economic and unit systems through native deterministic commands/modifiers.
5. **Development:** Machine-readable private altitudes/alpha–delta subdivisions with multiple prerequisite combinations. The player's deliberate research action initiates a transition and unlocks **substantially new capabilities**, not merely a renamed phase.
6. **Zion conditions:** Sustainable plural flourishing over several turns, checked by the real endgame engine. No compulsory ethnicity, religion, state type, market form or conquest.
7. **AI and diplomacy:** Agents use permitted simulation information (not omniscient opponent score), choose civic research, negotiate, adapt to wars, build, govern and try to win.
8. **Presentation:** Player-specific readonly report with recent causes, deltas, policies, unmet requirements and warnings. All navigation, rendering, input and multiplayer compatibility remain native.

## Nonnegotiable simulation invariants

- Updates are deterministic and player-scoped, without random network/browser API calls.
- Save/reload and replay preserve every persistent societal state and pending transition.
- Lifetime totals do not generate endless income or trust; repeated identical observations have no windfall.
- Raw house count and a single resource stockpile cannot satisfy a mature civilization's population needs.
- Defensive casualties and aggression have long-term consequences; reconciliation and rebuilding are possible.
- Many ideologically distinct governance strategies can succeed; do not rank actual cultures/people via theoretical developmental terminology.
- Aggregate updates over scheduled simulation ticks; GUI gets cached read-only reports.
- Only call explicit engine GUI allowlisted functions; tests must validate this exact integration point.
- Never claim full playability based on headless success, an accelerated scripted scenario, or a single screenshot.

## Refactoring strategy

The current ZionVictory.js embeds the entire scoring model to work around 0 A.D. victory-script scope. This is temporary integration scaffolding. In M2 migrate to a canonical, serializable simulation component (or explicitly engine-loaded globalscript) with a small pure model for deterministic test vectors. Extract a stable versioned societal report API. Transition in small tested commits rather than a blind rewrite.

Game data should gradually move into declarative technology/era/institution definitions (new files under simulation/data), with presentation labels separated from internal integral schema. Extend the actual game AI and victory scripting around these stable interfaces.

## Verification hierarchy

Source/schema → pure model tests → real Pyrogenesis timed research and adversarial victory controls → rendered 3D game and UI screenshots → human-paced matches versus native AI → replay/save/load → desktop install from clean package → player feedback. Each stage is necessary; no early green check bypasses later failures.

See [ROADMAP](../ROADMAP.md), [design decisions](DECISIONS.md), and [gameplay acceptance contract](GAMEPLAY-CONTRACT.md).
