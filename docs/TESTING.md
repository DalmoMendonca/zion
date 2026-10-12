# Verification and manual smoke test

## Automated

`node --test tests/*.test.js`

- 40 turns reach exactly the campaign end year.
- Cross-render event selection is deterministic, including after JSON serialization.
- Invalid and unaffordable decisions do not mutate state.
- A low treasury does not permanently block the campaign.
- Balanced play can win while extractive play can fail.
- RTS indicator calculations pass high and low fixtures.
- Mock Pyrogenesis startup dispatches the victory-condition trigger and validates success/failure routes.

## Browser

Checked in Chromium's JavaScript engine by injecting the locally generated HTML/CSS/JS directly (no external network). Verified: 17 project controls, opening display, the first decision advancing to year 51, no page errors, and 390 px mobile width without horizontal overflow.

## Still requires a real Release 28 install

- Mod selection and matching `0ad=0.28.0` dependency.
- Victory-condition entry visibility in the match configuration.
- Actual `TriggerHelper` loading order and script references.
- Gameplay matches single and multiplayer, AI player states, century notifications and end-game behavior.
- Correct class-label interpretation for specific civilizations and maps (possible class aliases).
- Save/reload behavior at multiple simulated centuries, all resolutions, game speeds and late-match scaling.

No claim of successful real-engine execution is made until these tests pass.
