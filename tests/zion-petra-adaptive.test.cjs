const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const code = fs.readFileSync(path.join(__dirname,
  "../binaries/data/mods/public/simulation/ai/petra/researchManager.js"), "utf8")
  .replace(/^import\s+.*;\s*$/gm, "")
  .replace("export class ResearchManager", "class ResearchManager") +
  "\nthis.TestResearchManager = ResearchManager;";

const sandbox = {
  ResearchPlan: class { constructor(_gameState, name) { this.name = name; } },
  Worker: { ROLE_WORKER: "worker" },
  warn: () => {},
  pickRandom: values => values[0]
};
vm.runInNewContext(code, sandbox);

function simulate({ preferred = 0, victory = "zion", researched = [],
  researching = [], available = [], savedPath = undefined } = {}) {
  const priorities = { majorTech: 240, minorTech: 120 };
  const config = { personality: { cooperative: preferred === 0 ? .8 : .2 }, priorities };
  const manager = new sandbox.TestResearchManager(config);
  if (savedPath !== undefined)
    manager.Deserialize({ zionPath: savedPath });
  const prioritiesChanged = [], planned = [];
  const state = {
    getVictoryConditions: () => new Set([victory]),
    isResearched: name => researched.includes(name),
    isResearching: name => researching.includes(name),
    ai: { queueManager: {
      changePriority: (queue, value) => prioritiesChanged.push([queue, value])
    } }
  };
  const queues = { minorTech: { addPlan: plan => planned.push(plan) } };
  const changed = manager.researchZionInstitutions(state, queues,
    available.map(name => [name, { _template: {} }]));
  return { manager, planned: planned.map(plan => plan.name),
    plans: planned, changed, prioritiesChanged, state, queues };
}

test("Prefers Council when both founding civic technologies can be researched", () => {
  const r = simulate({available:["zion_covenant","zion_magistracy"]});
  assert.deepEqual(r.planned, ["zion_covenant"]);
  assert.equal(r.changed, true);
  assert.equal(r.plans[0].queueToReset, "minorTech");
  assert.deepEqual(r.prioritiesChanged, [["minorTech",240]]);
});

test("A different civic temperament prefers Magistracy", () => {
  const r = simulate({ preferred:1, available:["zion_covenant","zion_magistracy"] });
  assert.deepEqual(r.planned,["zion_magistracy"]);
});

test("An institutionally blocked preference falls back to valid market pathway", () => {
  const r = simulate({researched:["zion_covenant"],available:["zion_guilds"]});
  assert.deepEqual(r.planned,["zion_guilds"]);
});

test("A missing temple can be replaced with researched Stewardship when viable", () => {
  const r = simulate({researched:["zion_covenant","zion_commons"],
    available:["zion_stewardship"]});
  assert.deepEqual(r.planned,["zion_stewardship"]);
});

test("Cannot research another member of completed exclusive stage", () => {
  const r = simulate({researched:["zion_magistracy","zion_guilds"],
    available:["zion_covenant","zion_commons","zion_concord","zion_stewardship"]});
  assert.deepEqual(r.planned,["zion_concord"]);
});

test("Pending research is respected and no duplicate can enter queue", () => {
  const r = simulate({researched:["zion_magistracy"],researching:["zion_commons"],
    available:["zion_guilds"]});
  assert.equal(r.changed,true);
  assert.deepEqual(r.planned,[]);
});

test("Unmet requirements never grant a technology or emit a research plan", () => {
  const r = simulate({researched:["zion_covenant"],available:[]});
  assert.equal(r.changed,false);
  assert.deepEqual(r.planned,[]);
  assert.deepEqual(r.prioritiesChanged,[]);
});

test("Non-Zion games preserve ordinary Petra behavior", () => {
  const r = simulate({victory:"conquest",available:["zion_covenant"]});
  assert.equal(r.changed,false);
  assert.deepEqual(r.planned,[]);
});

test("Serialized preference survives AI reload and retains priority", () => {
  const r=simulate({preferred:1,available:["zion_magistracy"]});
  const serialized=JSON.parse(JSON.stringify(r.manager.Serialize()));
  assert.equal(serialized.zionPath,1);
  const after=simulate({preferred:0,savedPath:serialized.zionPath,
    available:["zion_covenant","zion_magistracy"]});
  assert.deepEqual(after.planned,["zion_magistracy"]);
  assert.deepEqual(after.prioritiesChanged,[["minorTech",240]]);
});
