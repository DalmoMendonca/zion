const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const mod = path.resolve(__dirname, "../binaries/data/mods/public");
const tech = JSON.parse(fs.readFileSync(path.join(mod,
  "simulation/data/technologies/zion_relief.json"), "utf8"));

test("Civic Relief requires meaningful player-paid research in both constitutions", () => {
  const center = fs.readFileSync(path.join(mod,
    "simulation/templates/template_structure_civic_civil_centre.xml"), "utf8");
  assert.match(center, /\bzion_relief\b/);
  assert.ok(tech.cost.food >= 150 && tech.cost.wood >= 100 && tech.cost.stone >= 50);
  assert.ok(tech.researchTime >= 20);
  const prereqs = tech.requirements.all;
  assert.ok(prereqs.some(x => x.tech === "phase_town"));
  assert.ok(prereqs.some(x => x.any &&
    ["zion_covenant","zion_magistracy"].every(name =>
      x.any.some(choice => choice.tech === name))));
  assert.ok(tech.modifications.some(x => x.value === "Health/IdleRegenRate"));
});

function setup(memory) {
  const trigger = { zionSocieties: {1: {...memory}}, RegisterTrigger: () => {} };
  const notices = [];
  const context = {
    Trigger: function() {}, SYSTEM_ENTITY: 0, IID_Trigger: "trigger",
    IID_GuiInterface: "gui", warn: () => {},
    Engine: { QueryInterface: (_id,type) => type === "gui" ?
      { PushNotification: notice => notices.push(notice) } : trigger },
    markForPluralTranslation: value => value
  };
  vm.runInNewContext(fs.readFileSync(path.join(mod,
    "maps/scripts/ZionVictory.js"), "utf8"), context);
  Object.setPrototypeOf(trigger, context.Trigger.prototype);
  return {trigger, notices};
}

test("Native research event changes the initiating player's state exactly once", () => {
  const {trigger,notices}=setup({trauma:26,trust:-7});
  trigger.zionSocieties[2]={trauma:32,trust:-11};
  trigger.ZionResearchFinished({player:1,tech:"zion_relief"});
  assert.equal(trigger.zionSocieties[1].trauma,14);
  assert.equal(trigger.zionSocieties[1].trust,-4);
  assert.equal(trigger.zionSocieties[1].reliefApplied,true);
  assert.equal(trigger.zionSocieties[2].trauma,32);
  assert.equal(notices.length,1);
  assert.deepEqual(Array.from(notices[0].players),[1]);
  trigger.ZionResearchFinished({player:1,tech:"zion_relief"});
  assert.equal(trigger.zionSocieties[1].trauma,14);
  assert.equal(notices.length,1);
  const restored=setup(JSON.parse(JSON.stringify(trigger.zionSocieties[1])));
  restored.trigger.ZionResearchFinished({player:1,tech:"zion_relief"});
  assert.equal(restored.trigger.zionSocieties[1].trauma,14);
  assert.equal(restored.notices.length,0);
});

test("Research cannot erase more trauma than present or break the trust ceiling", () => {
  const {trigger}=setup({trauma:5,trust:29});
  trigger.ZionResearchFinished({player:1,tech:"zion_relief"});
  assert.equal(trigger.zionSocieties[1].trauma,0);
  assert.equal(trigger.zionSocieties[1].trust,30);
});
