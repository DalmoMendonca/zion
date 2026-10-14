# M1 native verification ledger

Updated October 13, 2026. Each entry records a reproducible GitHub Actions run; a green workflow is evidence only for its stated assertions.

| Gate | Evidence | Verified | Not verified |
| --- | --- | --- | --- |
| A01 engine baseline | [Rapid native smoke 38499134719](https://github.com/DalmoMendonca/zion/actions/runs/38499134719) | Precompiled native Pyrogenesis starts current scripts and reaches simulation ticks | Clean release installation and source rebuild at current commit |
| A02 rendered world | [Graphical 38498563274](https://github.com/DalmoMendonca/zion/actions/runs/38498563274) | Software-rendered 1280×720 world and society HUD screenshot; GUI error checks passed | Human interaction, different display resolutions |
| A04–A05 civic routes | [Rapid native smoke 38499134719](https://github.com/DalmoMendonca/zion/actions/runs/38499134719) | Timed civic research and effects in accelerated scenario | Normal resource/phase pacing |
| A07–A08 distinct wins | [Independent victories 38493183565](https://github.com/DalmoMendonca/zion/actions/runs/38493183565) | Two distinct native match winners | Human-paced wins |
| A03, A06, A09–A12 | No complete integration evidence yet | Some source/unit checks exist | Direct RTS interaction, natural phases, adversarial native cases, war recovery, AI match, save/reload/replay, final packaged install |

## Execution protocol

For each acceptance test, retain the engine log, screenshot or save artifact, exact commit SHA, workflow run URL, and pass/fail assertion. Never treat scripted injected phases or resources as a natural-match pass. Preserve failing diagnostics for repair and rerun before changing a gate to verified.

## Next concrete integration tests

1. Native scenario: worker gathering, construction, training, and combat with engine-side assertions.
2. Native scenario: natural phase prerequisites, queue-based research and both governance routes without phase grants.
3. Ordinary Petra skirmish with recorded resource, construction, research and victory progress.
4. Save/reload and replay continuation from the same deterministic seed.

## Turn 2 / Turn 3 live checks

- **PASS:** source build [38500703364](https://github.com/DalmoMendonca/zion/actions/runs/38500703364), followed by stricter compiled-engine/`ldd` dependency build [38500721310](https://github.com/DalmoMendonca/zion/actions/runs/38500721310); both concluded successfully, archived diagnostics and launched native Zion.
- Turn 3 asset verification baseline: [graphical workflow 38498563274](https://github.com/DalmoMendonca/zion/actions/runs/38498563274) successfully fetched real upstream LFS art and `sandbox_athenians.pmp`, rendered a 1280×720 gameplay frame, rejected loading parchment and black viewport, and asserted visible society HUD text. The CI screenshot artifact is [11864544622](https://github.com/DalmoMendonca/zion/actions/runs/38498563274/artifacts/11864544622). Real citizen locomotion, harvesting, and building COLLADA files were additionally hydrated and verified (six files) in the [native smoke asset step 38502794568](https://github.com/DalmoMendonca/zion/actions/runs/38502794568); animated playback for every actor is not yet verified.

## Turn 4–6 regression updates

- [Native worker movement 38501574452](https://github.com/DalmoMendonca/zion/actions/runs/38501574452) **passed**: `ZION_MOVEMENT_VERIFIED` recorded 9.38 world units displacement. This does not test GUI selection.
- [Foundation run 38501689315](https://github.com/DalmoMendonca/zion/actions/runs/38501689315) found an actual pair prerequisite defect: the second-stage pair referenced its own second-stage options, and the third-stage pair referenced first-stage options. Both were corrected to require their immediate preceding stage. Reverification **passed** in [foundation run 38501790330](https://github.com/DalmoMendonca/zion/actions/runs/38501790330).
- **PASS:** worker training in [native run 38501945936](https://github.com/DalmoMendonca/zion/actions/runs/38501945936): real production queue increased worker count 6 -> 7.
- **PASS:** food gathering and Civic Centre stockpile deposit in [native run 38502533029](https://github.com/DalmoMendonca/zion/actions/runs/38502533029): worker was observed carrying food and stockpile increased 300 -> 320. This individual test step passed although the overall job subsequently failed in construction.
- **PASS:** native construction in [full passing run 38503235991](https://github.com/DalmoMendonca/zion/actions/runs/38503235991): ordinary `ProcessCommand` spent resources, placed a foundation, builders progressed and completed a real house (0 -> 1). The first test failed because a private engine helper was inaccessible; corrected in commit `aaa5ceee`, then reverified.
- **PASS:** native combat in the same [run 38503235991](https://github.com/DalmoMendonca/zion/actions/runs/38503235991): four infantry received an attack order and enemy worker HP fell 25 -> 0.
- **PENDING:** graphical mouse selection and point-and-click orders, plus full human-paced interactive match; overall A03 remains open despite all scoped engine-side Turn 4–8 checks passing.
- **CI performance:** `tests/run-zion-native-mode.sh` ends each headless scenario as soon as its completion marker appears, rather than allowing the entire command timeout to elapse; independent step outcomes are preserved even when another case fails.
