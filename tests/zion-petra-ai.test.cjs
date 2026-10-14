const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const file = path.resolve(__dirname, "../binaries/data/mods/public/simulation/ai/petra/researchManager.js");
const source = fs.readFileSync(file, "utf8")
    .replace(/^import .*;\s*$/gm, "")
    .replace("export class ResearchManager", "class ResearchManager") +
    "\nthis.ResearchManager = ResearchManager;";
const context = {
    ResearchPlan: class { constructor(_state, name) { this.name = name; } },
    Worker: { ROLE_WORKER: "worker" },
    pickRandom: choices => choices[0]
};
vm.runInNewContext(source, context);
const ResearchManager = context.ResearchManager;

function scenario(cooperative, zion = true)
{
    const researched = new Set();
    const plans = [];
    let available = [];
    const state = {
        getVictoryConditions: () => new Set(zion ? ["zion"] : ["conquest"]),
        isResearched: name => researched.has(name),
        isResearching: () => false,
        findAvailableTech: () => available.map(name => [name, { _template: {} }]),
        currentPhase: () => 1,
        ai: { queueManager: { getAvailableResources: () => ({ food: 1000, wood: 1000, stone: 1000, metal: 1000 }) } },
        getOwnEntitiesByRole: () => []
    };
    const queue = { hasQueuedUnits: () => false, addPlan: plan => plans.push(plan.name) };
    const queues = { minorTech: queue, majorTech: queue };
    const manager = new ResearchManager({ personality: { cooperative } });
    return { manager, state, queues, researched, plans, setAvailable: names => { available = names; } };
}

test("Cooperative Petra researches Covenant, Assembly, Concord in order", () => {
    const s = scenario(0.8);
    for (const name of ["zion_covenant", "zion_commons", "zion_concord"])
    {
        s.setAvailable([name]);
        s.manager.update(s.state, s.queues);
        assert.equal(s.plans.at(-1), name);
        s.researched.add(name);
    }
    assert.equal(s.plans.length, 3);
    assert.equal(s.manager.Serialize().zionPath, 0);
});

test("Other Petra personalities research Magistracy, Guilds, Stewardship", () => {
    const s = scenario(0.2);
    for (const name of ["zion_magistracy", "zion_guilds", "zion_stewardship"])
    {
        s.setAvailable([name]);
        s.manager.update(s.state, s.queues);
        assert.equal(s.plans.at(-1), name);
        s.researched.add(name);
    }
    assert.equal(s.manager.Serialize().zionPath, 1);
});

test("Zion civic decisions do not leak into normal conquest games", () => {
    const s = scenario(0.8, false);
    s.setAvailable(["zion_covenant"]);
    s.manager.update(s.state, s.queues);
    assert.deepEqual(s.plans, []);
});

test("Unavailable first institution is not skipped to a later stage", () => {
    const s = scenario(0.8);
    s.setAvailable(["zion_commons", "zion_concord"]);
    s.manager.update(s.state, s.queues);
    assert.deepEqual(s.plans, []);
});

test("Saved civic strategy survives reload and personality changes", () => {
    const s = scenario(0.8);
    s.setAvailable(["zion_covenant"]);
    s.manager.update(s.state, s.queues);
    const restored = new ResearchManager({ personality: { cooperative: 0.1 } });
    restored.Deserialize(s.manager.Serialize());
    s.researched.add("zion_covenant");
    s.setAvailable(["zion_commons", "zion_guilds"]);
    restored.update(s.state, s.queues);
    assert.equal(s.plans.at(-1), "zion_commons");
});
