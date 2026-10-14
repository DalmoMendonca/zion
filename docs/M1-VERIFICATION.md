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
