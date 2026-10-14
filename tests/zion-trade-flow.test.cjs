const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const base = path.resolve(__dirname, "../binaries/data/mods/public/maps/scripts");
const source = fs.readFileSync(path.join(base, "ZionModel.js"), "utf8");
const context = { module: { exports: {} } };
vm.runInNewContext(source, context);
const model = context.module.exports;
const settlement = {
  food: 1000, metal: 900, farms: 6, houses: 10, markets: 3,
  civics: 2, temples: 2, healers: 1, towers: 2, fortresses: 0,
  trade: 0, woodGathered: 250, foodGathered: 0,
  tributes: 0, kills: 0, losses: 0,
  techs: { phase_town:true, phase_city:true, zion_covenant:true,
    zion_commons:true, zion_concord:true }
};
const prosperity = (o, mem) => model.measure(o, mem).dimensions.prosperity;

test("Historical trade cannot inflate prosperity forever", () => {
  const memory = model.freshMemory();
  assert.equal(prosperity({...settlement,trade:800000}, memory),
    prosperity(settlement,memory));
});

test("New real trade briefly increases prosperity and idle time removes it", () => {
  let memory = model.freshMemory();
  memory = model.updateMemory(memory,{...settlement,trade:240});
  const earned = prosperity({...settlement,trade:240},memory);
  assert.equal(memory.tradeActivity,240);
  for(let i=0;i<12;i++)
    memory=model.updateMemory(memory,{...settlement,trade:240});
  assert.ok(memory.tradeActivity<2);
  assert.ok(prosperity({...settlement,trade:240},memory)<earned);
});

test("Continuous commerce remains economically useful", () => {
  let memory=model.freshMemory();
  for(let i=1;i<=12;i++)
    memory=model.updateMemory(memory,{...settlement,trade:i*180});
  assert.ok(memory.tradeActivity>400);
  assert.ok(prosperity(settlement,memory)>prosperity(settlement,model.freshMemory()));
});

test("Existing saves migrate historical trade counters without a windfall", () => {
  const previous={trust:0,trauma:0,lastKills:0,lastLosses:0,
    lastTributes:0,lastFoodGathered:0,recentFoodGathered:0,stableChecks:0};
  const migrated=model.updateMemory(previous,{...settlement,trade:250000});
  assert.equal(migrated.lastTrade,250000);
  assert.equal(migrated.tradeActivity,0);
  const next=model.updateMemory(migrated,{...settlement,trade:250090});
  assert.equal(next.tradeActivity,90);
});

test("Serialization preserves every trade baseline deterministically", () => {
  const before=model.updateMemory(model.freshMemory(),{...settlement,trade:240});
  const serialized=JSON.parse(JSON.stringify(before));
  const actual=model.updateMemory(before,{...settlement,trade:300});
  const restored=model.updateMemory(serialized,{...settlement,trade:300});
  assert.deepEqual(JSON.parse(JSON.stringify(actual)),JSON.parse(JSON.stringify(restored)));
});

test("Trade counter reset never produces negative commerce or a repeat reward", () => {
  const start=model.updateMemory(model.freshMemory(),{...settlement,trade:300});
  const reset=model.updateMemory(start,{...settlement,trade:0});
  assert.equal(reset.tradeActivity,195);
  assert.equal(reset.lastTrade,0);
  assert.ok(model.updateMemory(reset,{...settlement,trade:0}).tradeActivity<195);
});

test("Native victory model embeds the same tested social-economic model", () => {
  const native=fs.readFileSync(path.join(base,"ZionVictory.js"),"utf8");
  assert.ok(native.includes(source),"Standalone and actual native victory calculations diverged");
  assert.ok(native.includes('"recentTrade": Math.round(memory.tradeActivity)'));
});
