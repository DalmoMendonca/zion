# Zion A.D. — vision, systems and milestones

## The central question

**How might a civilization become capable of sustaining love across complexity?**

The player's goal is not an abstract demographic multiplier, military supremacy, or a fixed theological state apparatus. It is to make conditions possible for persons and communities to flourish without sacrificing the stranger, vulnerable, environment, or freedom of conscience. The victory screen is a snapshot in an always-unfinished story.

## Progression / playable first slice

- Span: 1–2000 A.D. in 40 turns of 50 years in the browser; 1 simulated year per 1.5 seconds (50 minutes total) in native RTS.
- Decisions: a capital project, constitutional arrangement, and a response to historical moral crises in each browser turn.
- Developmental capacities: survival → belonging → order → achievement → pluralism → integration → planetary care. Societies exhibit mixed states: earlier capacities do not simply vanish when new ones emerge. A stage names a broad *center of gravity*, not a moral ranking.
- AQAL: simultaneous interior/exterior and individual/collective outcomes; no quadrant can be ignored for a final win.
- Resources: simplified public treasury, population, eight value indicators, the ecological feedback loop, shock propagation and intergenerational institutional inertia.
- Choices: explicit social trade-offs; corruption by concentrating gain; hospitality and inclusion with genuine fiscal demands; green investments with short-term cost; security versus rights; deliberation versus rapid coordination.

## Many pathways to Zion

**Covenantal commons:** small-scale mutual aid, contemplation, peacemaking, federated associations.

**Democratic republic:** constitutional protections, libraries, oversight, public institutions, participatory assemblies.

**Abundant society:** agricultural innovation, trade, science and shared ownership, balanced with justice and ecology.

**Care economy:** health, care, water and sanitation, universal education, redistributive solidarity.

**Ecological restoration:** regenerate watersheds and soils, increase resilience, slow down extraction.

**Wisdom traditions:** contemplative life and literacy, interpretation across difference without compulsory confession.

**Confederated network:** subsidiarity and cooperation between self-governing communities.

The final implementation should allow hybrid approaches, local variation and dynamic institutional change rather than one universal template.

## Milestone 0.1 — implemented

- Native 0 A.D. mod metadata and a custom victory-condition data entry.
- First scripted RTS society measurements, announcements, milestone feedback, food bonus/shortage feedback and an end-of-2,000-years evaluation.
- Deterministic engine-independent scoring core.
- Browser-based interactive campaign with 17 projects, 7 governments, 18 multi-path crises, persistent storage, a generated civic landscape, chronicle and developmental history.
- Automated core and engine-mock tests.

## Milestone 0.2 — priority: truly native civic play

- Verify and debug against real 0 A.D. 0.28.0 in Windows and Linux.
- Add a Zion civic dashboard in the Pyrogenesis in-match GUI; port explicit governance reforms, project budgets and civic dilemmas to native GUI and synchronized simulation code.
- Introduce native peaceful diplomacy, federation, settlements and enduring cooperation mechanics; the current end-game evaluator already permits multiple qualifying societies to win together.
- Separate tax revenue, private wealth, commons, inequality, subsistence, political rights, liberty of conscience, environmental debt and climate resilience; track them with meaningful agent-level state rather than building-count proxies.
- Make incidents arise from measurable conditions (migrations, famine, domination, war, social polarization, pollution, climate disruption).

## Milestone 0.3 — historical world and art

- Era-aware building trees spanning ancient, medieval, industrial, modern and future institutional forms.
- Reusable 0 A.D. terrain, actors and animations transformed through a structured licensed asset pipeline.
- A Zion-specific city aesthetic with both ancient and modern layers; new architectural models and art direction; generational civic growth visually apparent on the actual map.
- Civil institutions: hospitals, libraries, councils, shelters, farms, trade routes, sacred spaces, schools, waterworks, ecosystem restoration sites.
- New citizen roles: cultivators, caregivers, philosophers, diplomats, teachers, builders, explorers, organizers.

## Milestone 1.0 — full fork ambition

- A reproducible standalone distribution derived from the *current* Wildfire Games Gitea tree, with tracked upstream history, GPL/CC BY-SA license notices, build scripts, signed releases and no proprietary dependencies.
- Deep multi-city ecological/social simulation with real household distribution and diverse religions, institutions and political ideologies.
- Multiplayer cooperation and asymmetrical tradeoffs. Meaningful nonviolent modes of conflict resolution, external pressures and civil protection.
- Campaign achievements for partial flourishing and recoveries after failed experiments; no irreversible stage hierarchy.
- Extensive scenario-driven balance testing, accessibility support and research bibliography distinguishing history, theology, developmental theory and fictional counterfactuals.

## Why a mod before an engine fork?

0 A.D.'s Pyrogenesis C++ engine plus its model library is large; an unreviewed source dump would not be a substantive new game. A mod is the supported path to prove mechanics against the working engine first. Once the game loop works, promote the change set to a proper history-preserving fork and replace the historical constraints systematically.
