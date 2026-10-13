# Zion A.D. — Development roadmap

**Status:** active native-engine development. **Source of truth:** this document for execution, [GAMEPLAY-CONTRACT](docs/GAMEPLAY-CONTRACT.md) for the eight player-approved design decisions, and [ZION-VISION](ZION-VISION.md) for the long-term premise. **Updated:** October 12, 2026.

Zion A.D. is a **genuine fork** of 0 A.D. / Pyrogenesis. It is a real-time 3D civilization strategy game in which ordinary workers, construction, warfare and control remain familiar, but institutions, laws, economics, relationships, cultural maturation and ecological stewardship change what civilization can become over an alternative two-thousand-year journey. Multiple political and cultural arrangements may cultivate Zion; no ideology gets an automatic victory.

This is an **implementation plan**, not a list of features already delivered. No invented deadline, release date, or percentage complete. Each stage ends in a playable and verified game state, never just mockups. All release gates below are cumulative: passing a source check does not imply gameplay quality.

## Tracked feature epics

Roadmap scope is authoritative; GitHub issues are executable work packets with acceptance criteria. [All issues](https://github.com/DalmoMendonca/zion/issues).

- [#1: M1 graphical rendering and HUD](https://github.com/DalmoMendonca/zion/issues/1)
- [#2: M1 independent victories and negative tests](https://github.com/DalmoMendonca/zion/issues/2)
- [#3: M1 full ordinary match and AI](https://github.com/DalmoMendonca/zion/issues/3)
- [#4: M1 desktop packages and save/replay](https://github.com/DalmoMendonca/zion/issues/4)
- [#5: M2 societal simulation](https://github.com/DalmoMendonca/zion/issues/5)
- [#6: M3 hidden developmental ages](https://github.com/DalmoMendonca/zion/issues/6)
- [#7: M4 institutions, economy and governance](https://github.com/DalmoMendonca/zion/issues/7)
- [#8: M5 diplomacy, war and AI](https://github.com/DalmoMendonca/zion/issues/8)
- [#9: M6–M8 contingent 2,000-year campaign](https://github.com/DalmoMendonca/zion/issues/9)
- [#10: M9 accessibility, visual/audio and release quality](https://github.com/DalmoMendonca/zion/issues/10)

## Current evidence and baseline

| Capability | Status | Evidence / limitation |
| --- | --- | --- |
| Full 0 A.D. / Pyrogenesis fork and 3D source | VERIFIED | Original C++ engine, native simulation, maps and UI in repository |
| Linux native executable and headless skirmish launch | VERIFIED | [native build](https://github.com/DalmoMendonca/zion/actions/runs/38338194693) |
| Civic research and two institutional strategies in real simulation | VERIFIED for accelerated test | [end-to-end test](https://github.com/DalmoMendonca/zion/actions/runs/38338172357); buildings and base phases artificially supplied |
| Live social evaluation and one First Covenant victory | VERIFIED in headless engine | Same end-to-end test; not both independent wins |
| Standalone 3D graphical game and Zion HUD | **BLOCKED / RETEST** | [Latest green graphical CI](https://github.com/DalmoMendonca/zion/actions/runs/38343892890) captured **Arcadia's loading screen at 77%**, not the world, and logged five invalid HUD-style warnings. A stronger test now waits for match initialization, checks the screenshot for loading-screen parchment and rejects GUI-style warnings. Actual rendered gameplay frame remains unverified until the new CI run passes and the image is inspected. |
| Save/load, complete human-paced match, AI, balance, packaged download | NOT VERIFIED | Explicit gates below |
| Extended eras and 2,000-year campaign | NOT IMPLEMENTED | Milestones M5-M8 |

**Meaning of status:** VERIFIED means cited real-engine evidence; IMPLEMENTED means source committed without complete runtime acceptance; PLANNED means not yet implemented; BLOCKED includes the specific failure and the next action. Only promote a capability when its verification is recorded. Avoid describing the current vertical slice as a finished desktop release.

## Design promises: the player experience

1. **Minute 0:** launch a native desktop build directly into an attractive, comprehensible menu; create a 3D settlement match against an AI or choose a guided scenario. Directly select and command units, gather food/wood/stone/metal, build, train and fight.
2. **Early settlement:** discover the resources and tensions of the landscape; choose a first governing institution with tradeoffs that are visible in buildings, resources, liberties and civic trust. The game explains *why* things change.
3. **A growing town:** specialized institutions, education, trade, public provision, diplomacy and combat all matter. No single tech is a substitute for a functioning society. Approaches with different strengths should remain competitive.
4. **Developmental tipping point:** several valid combinations of science, culture, resource production, civic institutions and spirituality may unlock the *possibility* of a new age. The player deliberately purchases/initiates transition. Underlying integral altitude and alpha/beta/gamma/delta data is never shown under theoretical names in normal UI.
5. **Mature game:** prosperity, freedom, dignity, solidarity, ecological limits and peace can conflict. War remains playable but exacts lasting human and institutional costs; healing and reform are strategic projects.
6. **First Covenant ending:** maintain several dimensions of flourishing for a meaningful period. Different civilizations can win by different paths. Military dominance or a single stockpiled resource cannot counterfeit societal maturity.
7. **Full vision:** continue across up to roughly 2,000 in-world years, branching out of the ancient historical starting conditions. Unlocking later assets and technologies is conditional rather than an unavoidable recreation of real-world history.

## Release sequence and dependencies

| Milestone | Deliverable | Depends on | Exit gate |
| --- | --- | --- | --- |
| **M0: Reproducible native baseline** | Engine build, provenance, tests, safe CI, headless match | Upstream 0 A.D. | Linux build and real headless Zion initialization (verified); repeatable CI artifact |
| **M1: First playable desktop alpha — PRIORITY NOW** | Graphically correct ancient RTS match, 3 native governance decisions, HUD, alternative paths, reliable First Covenant victory, installation package | M0 | All M1 acceptance scenarios A01–A12 pass; downloadable desktop bundle, a complete non-cheated match and visual review |
| **M2: Social simulation v1** | Explainable, persistent and balanced population/community/economic/ecological metrics; healing, shortages, trust, civic welfare | M1 | Deterministic scenarios show expected effects, recovery, lack of easy exploits, save/load and GUI explanation |
| **M3: Legitimate developmental ages** | Data-driven developmental altitudes + internal alpha/beta/gamma/delta, multiple breakthrough routes, reversals and legible player-triggered transitions | M2 | Three or more meaningful stages with different assets/capabilities; two distinct qualifying routes per stage; no hidden-label leaks |
| **M4: Institutions as living systems** | Flexible government, policies, laws, ownership, education, justice, health, civic voice, obligations, resistance and reform | M2–M3 | Institutions alter citizen behavior and economy; policies have budgets, tradeoffs, credible implementation limits and feedback |
| **M5: Regional world and diplomacy** | Robust opponent AI, neighboring polities, alliances, rivalries, migration, trade agreements, negotiation, just peace/reconciliation | M2–M4 | Diplomacy actually changes behavior and security, trade and trust; AI can pursue multiple goals; war has measurable scars |
| **M6: Divergent centuries I** | Post-ancient institutions, cultural innovation, new material technology, infrastructure, scientific paths and changing visual sets | M3–M5 | Several connected eras playable continuously; at least two plausible alternate histories from a shared start |
| **M7: Divergent centuries II** | Industrial/modern/possible future systems, mass education, large economies, energy, global interdependence and environmental limits | M6 | Historical branching persists, scale remains performant, mature systems interact rather than replacing earlier systems |
| **M8: Zion at 2,000 years** | Full time arc, intergenerational memory, diverse legitimate Zion outcomes, competing crises and multi-ending campaign | M6–M7 | More than one coherent 2,000-year win route, alternatives to conquest, no mandated historical development sequence |
| **M9: Production readiness** | Art direction, accessible UI, localization, accessibility, audio, automated release builds, multiplayer sync, modding and release QA | Begins M1, final gate after M8 | Release candidate passes platform, performance, multiplayer, content, licensing and accessibility suites |

Milestones can overlap only when dependencies and acceptance evidence are satisfied. M9 is a **continuous quality track** from the beginning, not a last-minute polishing phase. A later-era content dump is not permitted to obscure a broken M1 RTS loop.

## Prioritized implementation backlog

Each feature has a stable ID suitable for commits, issues and QA reports. Priority **P0** blocks the first packaged alpha, **P1** completes core social/developmental game, **P2** expands the campaign and **P3** supports mature release. These are expected deliverables, **not** claims that they already exist.

### Foundation, CI, runtime and packaging

- **ENG-01 (P0)** Fix graphical HUD bridge (allowed GuiInterface call, ownership privacy, null reports, spectators), re-run screenshot test, inspect actual frame, and check UI does not obscure standard game controls. **Gate:** zero repeated JavaScript errors, rendered HUD, screenshot reviewed.
- **ENG-02 (P0)** Separate immutable prebuilt-engine cache from game scripts; trigger fast real-engine smoke for any simulation/data/UI change, full rebuild when C++ changes. **Gate:** CI catches a deliberately broken victory/HUD call and succeeds with a correct one.
- **ENG-03 (P0)** Make reproducible graphical and headless CI with original upstream LFS assets, pinned toolchains, third-party license checks, build caches and retained diagnostics. **Gate:** stable workflow on repeat executions, no network-dependent false passes.
- **ENG-04 (P0)** Package a player-launchable native desktop build including licensed art, engine libraries and startup configuration; **begin with Linux CI proof, then Windows**, document macOS support decision. **Gate:** user launches without compiling.
- **ENG-05 (P0)** Save/load, simulation replay, reset/restart, crashes and multi-hour endurance. **Gate:** restored social history/technology/score consistent; deterministic replay checksum.
- **ENG-06 (P1)** Performance counters, consistent reproducible benchmarks and scalability profiles for population, buildings and AI. **Gate:** explicit frame time, simulation turn time, memory budget at fixed map sizes.

### Foundational RTS and scenario

- **RTS-01 (P0)** Preserve selection, multi-select, movement, formations, pathfinding, gathering, construction, training, upgrades, battles and rally points. **Gate:** manual standard-command matrix against original 0 A.D. baseline.
- **RTS-02 (P0)** Provide polished first map/scenario, two viable starting factions, a clear opening objective and a competent selectable AI difficulty. **Gate:** full unassisted start-to-end session from default starting resources.
- **RTS-03 (P0)** Keep economy and military actions meaningful under Zion scoring rather than treating them as isolated minigames. **Gate:** food/trade/war cause traceable welfare changes without making direct RTS commands cumbersome.
- **RTS-04 (P1)** Procedural/random map presets, resource scarcity climates, objectives and non-player communities with varied diplomatic starting conditions.
- **RTS-05 (P2)** Civilization identity: branching traditions, distinct models/building families and access to shared developmental possibilities without cultural rank assumptions.

### Social simulation, ethics and explanation

- **SOC-01 (P0)** Replace fragile score shortcuts with bounded, normalized inputs. Measure stock vs supply per capita, useful civic capacity, actual trade/aid rather than lifetime totals. **Gate:** exploit tests: stockpile-only, house-spam, sacrificial warfare, infinite aid, intentional famine recovery.
- **SOC-02 (P0)** Implement persistent, decay-aware trust and trauma, owned deaths and direct harm, including attribution, finite diminishing returns, and per-tick effect budgets. **Gate:** deterministic war/recovery tests against a control settlement.
- **SOC-03 (P0)** Score cannot be won by tech purchases alone; final success needs population-supported food security, minimum civic capacity and sustained threshold. **Gate:** failed dystopia controls and positive tests for distinct pathways.
- **SOC-04 (P1)** Model individuals and households at RTS-appropriate resolution: security, basic needs, aspirations, access to services, migration and social differences without forcing micromanagement. Preserve direct player orders.
- **SOC-05 (P1)** Four integral perspectives interact with eight player-readable dimensions: provision, prosperity, dignity, freedom, wisdom, communion, ecology, resilience. Interior states are **inferred game heuristics**, never objective psychometrics or judgments of real-world peoples.
- **SOC-06 (P1)** Explainability panel: current values, recent changes, contributing actions, unmet thresholds, forecast uncertainty, historical trend and simple context-sensitive advice; never render theoretical alpha/beta/gamma/delta terms to players.
- **SOC-07 (P2)** Events, collective memory, historical injustices, social recovery, education transmission and intergenerational consequences; sensible caps and player agency.
- **SOC-08 (P2)** Diverse cultural and spiritual practices as legitimate ways of cultivating meaning and solidarity; no compulsory religion, ethnicity or governance as the victory key.

### Institutions, economy and civil systems

- **GOV-01 (P0)** Native three-choice sequence (two alternatives each) visible in Civic Centers with accurate costs, in-world structure requirements, textual tradeoffs and actual unit/building modifiers.
- **GOV-02 (P1)** Distinguish **government form** (who may decide), **policy** (what is decided), **institution** (what carries it out), and **compliance** (whether implementation succeeds); avoid one-shot permanent menu bonuses.
- **GOV-03 (P1)** Policy budget: welfare, taxation, common resources, private property, trade law, labor, justice, political voice and education with upkeep and implementation capacity.
- **GOV-04 (P1)** Governance reform and crisis: peaceful transitions, consent, factional opposition, legitimacy, instability and beneficial institutional adaptation, with player-readable causes.
- **ECO-01 (P1)** Production and distribution chain: food security, housing/services coverage, specialization, meaningful trade, shortages, health, quality of infrastructure, inequality and mobility.
- **ECO-02 (P1)** Environmental systems: renewable/exhaustible resources, soils, forests, biodiversity, restoration, carrying capacity and feedback to material production.
- **ECO-03 (P2)** Regional interdependence: capital investment, logistics, transport, public goods, industrial technology and externalities balanced across developmental stages.
- **CIV-01 (P1)** Temples, assemblies, courts, libraries, schools, clinics, markets, waterworks and civic buildings contribute only when resourced, staffed and accessible.

### Development, science, culture and time

- **DEV-01 (P0)** Verify first three native institutional transitions via **ordinary queues** and meaningful different prerequisites, including appropriate UI feedback and outcomes. Current development test injects base phases; that shortcut must be eliminated for human-paced alpha.
- **DEV-02 (P1)** Formal data schema for **altitudes** and internal **alpha/beta/gamma/delta** phases with prerequisites, inherited technologies, capabilities and regression conditions; player-facing names are human-readable historical/cultural descriptions.
- **DEV-03 (P1)** Multiple ways to unlock each tipping point: e.g. innovation and education, prosperous commerce and law, community institutions and social trust. Qualify, then player explicitly researches advancement; no automatic historical date triggers.
- **DEV-04 (P1)** Scientific, economic, social, ethical and spiritual discoveries can diverge without producing nonsensical mandatory chains. Real-world history is a starting possibility, not a locked script.
- **DEV-05 (P2)** Era content pipeline: meshes, textures, animations, technologies, unit behavior, building families, map props, soundscapes and readable UI for every released stage—not just renamed icons.
- **DEV-06 (P2)** Continuous calendar and generational memory across ~2,000 years with sensible pace, game speed options, age transitions, branching setbacks and accessible chronology view.

### Warfare, diplomacy and adversaries

- **WAR-01 (P0)** Preserve base combat: direct unit orders, formations, fortifications, raids, sieges and defense. Score and social damage must not make all military play impossible or trivially optimal.
- **WAR-02 (P1)** Casualties, displacement, destruction, trauma, reconstruction, reparations and reconciliation have different persistent costs. Defensive fighting, conquest and civilian harm are not identical game events.
- **DIP-01 (P1)** Diplomacy interface with alliance, neutrality, war, ceasefire, trade, aid and treaty offers; actual AI responses, promises, trust and violations.
- **DIP-02 (P1)** A viable non-conquest path that still has difficult external pressures, negotiation, deterrence and regional security.
- **AI-01 (P0)** Adapt 0 A.D.'s native AI to prioritize civic technologies when eligible and recognize First Covenant conditions; basic victory competition without cheating.
- **AI-02 (P1)** Distinct AI temperaments and economic/political approaches, each capable of long-run development, diplomacy, warfare and recovery.
- **AI-03 (P2)** Escalating environmental, diplomatic and social challenges across ages; evaluate AI at multiple map sizes and game lengths.

### Visuals, accessibility, platforms and community

- **UX-01 (P0)** 3D screenshot inspection: terrain, buildings, selectable units, native HUD, minimap, scaling and unobstructed production commands at 1280×720 and 1920×1080.
- **UX-02 (P0)** Governance choices should clearly preview opportunity costs, prerequisites, affected entities and which age they help unlock.
- **UX-03 (P1)** Rich society dashboard and optional map overlays for welfare, production, diplomacy, environmental strain and institutional access; simple default RTS HUD.
- **UX-04 (P1)** Keyboard/shortcut consistency, legible text, tooltip pacing, colorblind-safe encoding, resizable interfaces, contrast, localization and audio accessibility.
- **ART-01 (P1)** Cohesive visual identity consistent with 0 A.D.'s 3D quality, appropriate original artwork, designed screens (not greybox or superficial renaming), coherent palettes and transitions.
- **ART-02 (P2)** Era-appropriate assets/animation/sound; preserve upstream licenses and credits; provenance manifest for new assets.
- **PLAT-01 (P2)** Deterministic multiplayer simulation and fog/privacy safety, synchronized policies and reproducible saved games; 2-player and 4-player desync checks.
- **PLAT-02 (P3)** Settings, campaigns, skirmish presets, documentation, optional modding hooks, cross-platform installers, crash reporting that respects privacy, release notes.

## M1 concrete acceptance suite

The acceptance scenarios must be runnable without the player present and ultimately also reproducible manually.

| ID | Test | Pass condition |
| --- | --- | --- |
| **A01** | Full C++ engine + assets | Clean Linux compile, Pyrogenesis starts from packaged art with correct title |
| **A02** | GUI screenshot and input | Real map/units/HUD visible; zero GUI call errors; no overlapping main controls |
| **A03** | Ordinary RTS interaction | Worker selection, gathering, building, training and soldier control unchanged |
| **A04** | Governance route A | Civic research via timed queue changes house capacity and later policy effects |
| **A05** | Governance route B | Distinct government and institutional research via timed queue causes different effects |
| **A06** | Native phase transitions | Player qualifies and initiates each stage without development-only phase grants |
| **A07** | First Covenant victory A | Real game wins through route A; conditions sustained across multiple ticks |
| **A08** | First Covenant victory B | Independent fresh game wins via B, not merely B coexisting with A when A wins |
| **A09** | Adversarial negative cases | Abundant money alone, housing spam, neglected food, repeated aid, army domination do not win |
| **A10** | Consequences and recovery | Warfare + own casualties reduce metrics, costs arise, reconciliation/food restoration produces bounded recovery |
| **A11** | AI and reliability | AI opponents function; skirmish completed; save/reload and replay deterministic |
| **A12** | Player download | Install/run without source tools; clear controls, known issues and legal attribution |

**Definition of Done for each feature:** implemented in native engine; deterministic tested; visibly understandable; performance and accessibility considered; no regression in basic RTS; documentation and relevant CI updated; stage-specific acceptance demonstrated. A feature lacking any one of these is **implemented but unverified**, not complete.

## Automated quality layers and evidence

1. **Source:** XML/JSON syntax, tech icons/requirements, JS checks, game-tree integrity, GPL/art provenance.
2. **Unit:** deterministic societal model functions, exact policy modifications and bounded histories including negative/edge cases.
3. **Native integration:** compiled Pyrogenesis, real research queue, player technologies, state changes, real stage transitions, real victory event. Include negative/dystopia test cases.
4. **Visual:** unattended 3D render with full upstream LFS assets, screenshot artifacts and GUI error scan; inspect image, compare stable layout/visibility baselines.
5. **Endurance:** 30/60/120+ simulation minute runs with easy/moderate AI, saves and reloads, no creeping memory or script errors.
6. **Human experience:** actual Windows/Linux playtest for controls, enjoyment, balance, usability, legibility and intended identity; record issues, don't claim a polished playable release before this.
7. **Release:** clean packaged installer, versioned checksums, licenses, download links, update instructions and rollback.

Every CI result recorded in roadmap must link a concrete run and list what it **does not prove**. An accelerated seeded scenario is not a complete match; a screenshot is not a playtest; a passing Node test is not an engine run.

## Current highest-value work order

- **NOW / 1:** Gate screenshots on a fully initialized, actually rendered 3D match (not the Arcadia loading screen); reject GUI style warnings, inspect resulting frame, and confirm HUD and RTS controls don't collide.
- **NOW / 2:** Make the fast engine integration suite run independent victories via both routes, plus negative tests showing a resource-rich authoritarian/war-torn or food-poor society cannot win.
- **NOW / 3:** Eliminate artificial phase grants in a separate full match scenario, exercise actual age-up costs and prerequisites, and tune thresholds to normal player pacing.
- **NEXT / 4:** Make social score robust against building spam, historic lifetime metric exploits and per-tick giveaways; add explainable causal deltas.
- **NEXT / 5:** Give one AI the ability to research civic paths and contest Zion victory; verify full match, replay/save/load, then produce packaged alpha.
- **THEN:** M2 and M3 systems, followed by civic and diplomatic depth, then sustained expansion across eras. Never start later-century art while the early-game player experience remains defective.

## Change management and scope discipline

- Commit messages mention feature IDs (such as ENG-01 or SOC-03) and link failing/passing tests.
- Maintain one authoritative backlog here; use GitHub issues as bounded work packets, not as contradictory priority lists.
- At every development session: read latest code + CI, select the **highest blocking acceptance test**, implement/fix, execute available checks, commit, update evidence, and report outcome and next blocker. If verification is asynchronous, don't prematurely claim it passed.
- Record new design decisions in [docs/DECISIONS.md](docs/DECISIONS.md), with rationale and impact, rather than silently changing the eight agreed promises.
- No private user data, accounts, paid infrastructure, or unrelated website needed for game mechanics.
- Rebase on upstream selectively with test coverage and original copyright/license provenance intact; never delete original credits.
- If the first playable differs from this roadmap, add an explicit deviation and rationale. Never replace the agreed native RTS with a browser prototype.

## Key risks to retire first

| Risk | Mitigation |
| --- | --- |
| GUI bridge only works in headless mode | Gate on real screenshot plus GUI error scan; ENG-01 |
| Social score can be gamed or accidentally made unwinnable | Negative/positive native scenarios, bounded per-capita inputs; SOC-01–03 |
| Technological ages amount to reskinned 0 A.D. phases | Real path-dependent unlocks, different capabilities and original art; DEV-02–05 |
| AIs cannot play the new victory | Teach native AI institutional choices, validate AI matches; AI-01–02 |
| 2,000 years produces tedious pacing or explosive complexity | Vertical playable stages; tiered detail, continuous clock, performance budgets; DEV-06 / ENG-06 |
| CI green but desktop build unusable | Install-from-artifact and saved-game manual QA gate; ENG-04 / A12 |
| Uncritical developmental hierarchy stigmatizes people | Integral theory treated as optional abstract game design only; culture-neutral outcomes; SOC-05 / SOC-08 |

**Next review:** whenever a release gate passes or fails, update this file's evidence and priorities, not the user's unchanging vision.
