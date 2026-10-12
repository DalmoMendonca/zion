# Zion A.D. — First playable native-game slice

**What is implemented (in the real 0 A.D. game files)**

- 0 A.D.'s existing 3D RTS, units, buildings, farming, markets, battles, resources,
  Town and City phase transitions remain available.
- Civic Centers offer three successive, two-way technology choices through the
  engine's native research queue (six policies overall). Choices affect population
  capacity, construction time, trader profits, unit health, territory, or healing.
- The later decisions require institutions built on the map: five houses for
  Common Assembly, a market for Guild Republic, a temple for Concord, or
  three fields for Stewardship.
- Select **Zion A.D. — First Covenant** in the game setup victory settings.
  That starts a native victory trigger which samples actual player buildings,
  food and metal reserves, trade, aid, warfare, land use, and researched policies.
  It computes eight welfare dimensions and four combined perspectives.
- War creates persistent strain in society. Food shortages undermine provision;
  sustainable agricultural systems receive a restrained food dividend. Deep
  social stress after fighting consumes a modest amount of food.
- The initial victory is achieved after the third civic phase/capstone and
  three consecutive satisfactory societal evaluations. A successful player must
  balance welfare, not simply accumulate resources or eliminate enemies.

**Try it in a development build**

1. Clone `https://github.com/DalmoMendonca/zion` and fetch LFS assets from
   the original host. Build Pyrogenesis following the upstream build instructions.
2. Run the game and start a skirmish (try an easy AI or a peaceful rival).
3. In Victory Conditions select **Zion A.D. — First Covenant**. Uncheck conquest
   and other standard modes so that Zion is the sole winning objective.
4. Select your Civic Center. Choose **Covenant Council** or **Chartered
   Magistracy** from the first paired research slot.
5. Expand your settlement and advance to Town Phase, then research **Common
   Assembly** (five houses) or **Guild Republic** (one market).
6. Advance to City Phase. Research **Covenant of Concord** (one temple) or
   **Covenant of Stewardship** (three fields). Both can lead to victory, subject
   to flourishing requirements.
7. Watch periodic notifications for balance, trust, war strain and current era.
   Three consecutive qualifying checks (approximately 75 seconds of game time)
   complete the first covenant.

**Current limits**

This is a native-game vertical slice, **not a full 2,000-year campaign yet**.
The three stages reuse original 0 A.D. civilization phases and art. No custom
policy dashboard or new 3D assets are implemented. Governmental reforms are
currently one-time exclusive choices rather than reversible constitutions.
The model is a deliberately simplified game simulation, not a factual ranking
of real populations.

The code has Node/V8 engine-interface tests and XML/JSON validation.
A full native engine build and interactive Pyrogenesis launch remain unverified.
See `tests/zion-native.test.js`.

All changes remain in `binaries/data/mods/public/`, the native source tree;
there is no separate web game or bundled external mod.
