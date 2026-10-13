# Zion A.D. — Product and gameplay acceptance contract

This is the controlling product brief distilled from the eight design decisions
agreed with the player in October 2026. It takes priority over speculative
mechanic additions. Engineering must happen in this repository's real 0 A.D. /
Pyrogenesis engine and game data, not in a companion web app or isolated mod.

## Nonnegotiable gameplay experience

- **Real-time 3D strategy, familiar to Age of Empires/0 A.D.** Players select
  units and issue direct movement, gathering, construction, training, and
  military orders. Preserve the satisfying moment-to-moment RTS loop.
  Autonomous multi-agent micromanagement is not a replacement for direct
  unit control.
- **Continuous time.** The world progresses in accelerated real time.
  Developmental tipping points are researched/initiated by the player after
  suitable conditions; time does not advance through turn-based history chapters.
- **Hidden integral developmental architecture.** Social altitudes and their
  underlying alpha/beta/gamma/delta phases must be represented in the design
  data and eventual simulation. The player sees intuitive in-world institutional
  changes and new capabilities, **not** the theoretical names.
- **Contingent history over a possible 2,000 years.** The starting art/world
  derives from ancient 0 A.D., but later outcomes are not fixed by real Earth
  chronology. Scientific, cultural, economic, spiritual, and political
  developments can diverge; no compulsory historical script.
- **Many legitimate societal arrangements.** No named religion, ownership model,
  market form, political party, or constitutional regime guarantees Zion. A
  civilization's outcomes matter; genuine material, cultural and ethical
  tensions shape development.
- **Combat stays in the game.** Ordinary 0 A.D. military control, defensive
  operations, conflict, diplomacy, and conquest remain playable. War has
  consequences for societies that extend beyond battlefield totals; neither
  violence nor nonviolence alone produces Zion.
- **Government, policies, and institutions are interconnected.** The player's
  governance decision, enacted rules, and structures built in the actual world
  must have reciprocal consequences. No shallow static menu that ignores the
  economy and built environment.
- **Multiple pathways to developmental breakthrough.** Different mixes of
  technological, economic, civic and spiritual factors can qualify for the same
  next developmental capacity. A player must then make the transition, as
  in an AoE age-up, with legible costs and consequences.
- **First milestone:** a complete, compelling *early-game* progression with
  several real developmental thresholds, more than one governance strategy,
  a functioning opponent/world, cultural tradeoffs, and a meaningful way to
  complete a match. A 2,000-year campaign is the longer-term objective, **not**
  a reason to release a shallow unplayable full-length mock-up.

## How to know a playable release is genuinely ready

A future maintainer must **not** claim "playable" based solely on tests
validating XML, JavaScript syntax, or isolated mock component functions.

### Required engineering checks

- [x] Genuine 0 A.D. / Pyrogenesis source tree imported, preserving upstream.
- [x] Native executable compiled on Linux in GitHub Actions at least once.
- [x] A 3D-map scenario begins and advances in the real headless engine.
- [x] Native Zion victory condition initializes **without** JavaScript error.
- [x] In the real engine, Civic Centers expose three successive governance
      choices, and completion updates the game's technology state (automated
      two-path scenario; ordinary manual timing and balancing still pending).
- [ ] In the real engine, a simulated resource, military or policy change
      alters a reported societal dimension, with the intended resource/effect.
- [x] An accelerated in-engine integration scenario starts with ancient
      settlements, queues multiple real institutional researches and obtains a
      First Covenant ending. Infrastructure and phase unlocks are **injected**
      by the test, so this is not a full manual or human-paced match.
- [ ] Two distinct governance strategies can **independently win** in the
      actual engine, and an impoverished/militarily dominant society cannot
      trivially win. (Current test verifies both strategies reach the final
      stage, but only one victory ends its match.)
- [ ] A graphical game session renders the new HUD, map, units and
      gameplay without errors or overlapping interfaces.
- [ ] Player-accessible packaged build with instructions; no development tools
      needed simply to try the game.
- [ ] Save/reload, ability to restart, and at least one AI opponent scenario
      exercised successfully.

### Human test experience to strive for

The player should be able to start a 3D settlement, command villagers,
gather resources, grow it through real institutions, make several visibly
consequential governance decisions, defend or fight if necessary, initiate
multiple age transitions, and win via balanced shared flourishing in more
than one way. Graphics should feel like a real continuation of 0 A.D.,
with clear, intentional interface design.

This is *not yet a verified release*. A positive outcome on an early smoke
test reduces uncertainty but is not a substitute for graphical and manual
playtesting.

## Development sequence

1. Fix genuine engine/runtime failures; add regression checks that use
   Pyrogenesis and verify actual societal execution, not merely startup.
2. Exercise technologies and governmental paths through real game commands.
3. Exercise wartime tradeoffs, diplomacy, economy and stage transitions
   through complete deterministic scenarios; refine the underlying model
   when it produces exploitative or historically absurd outcomes.
4. Build native HUD and gameplay polish; check at least one graphical
   session with actual art and 3D units.
5. Package a player-accessible build and obtain the user's playtest feedback.
6. Extend the historical scope and social simulation in successive, fully
   playable native-engine increments toward the 2,000-year vision.

**License and attribution:** retain all original 0 A.D. source and asset
licenses and credits. New engineering remains in the native fork.

## Native gameplay test evidence (October 2026)

- [Rapid Pyrogenesis gameplay smoke run](https://github.com/DalmoMendonca/zion/actions/runs/38337757889): genuine engine launch, native civic research options, first social tick, no JavaScript errors.
- [Two-path in-engine research and victory run](https://github.com/DalmoMendonca/zion/actions/runs/38338172357): the two alternative initial policies each altered live house capacity as expected; each reached Town and City civic choices; both advanced to the last early-game institutional stage; player 1 won a real First Covenant condition.
- The test artificially supplies buildings/resources and sets base game phase technologies; it cannot substitute for normal resource gathering, adversarial balancing, a rendered HUD, or a user playtest.
