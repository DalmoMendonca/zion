const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const mod = path.resolve(__dirname, "..", "binaries/data/mods/public");
const techPath = path.join(mod, "simulation/data/technologies");
const model = require(path.join(mod, "maps/scripts/ZionModel.js"));

const base = {
  houses: 12, farms: 7, markets: 3, temples: 2,
  civics: 2, healers: 1, towers: 2, fortresses: 0,
  food: 1200, metal: 750, woodGathered: 2500, trade: 5000,
  tributes: 1500, kills: 0,
  techs: { phase_town:true, phase_city:true, zion_covenant:true,
    zion_commons:true, zion_concord:true }
};

test("Zion model starts at foundation and tracks three successive breakthroughs", () => {
  const m = model.freshMemory();
  const zero = model.measure({...base, techs: {}}, m);
  assert.equal(zero.age, 0);
  const one = model.measure({...base, techs:{zion_magistracy:true}}, m);
  assert.equal(one.age, 1);
  const two = model.measure({...base, techs:{
    zion_magistracy:true, zion_guilds:true, phase_town:true
  }}, m);
  assert.equal(two.age, 2);
  assert.equal(model.measure(base, m).age, 3);
});

test("Two distinct political/economic pathways can qualify for early victory", () => {
  assert.equal(model.measure(base, model.freshMemory()).eligible,true);
  const alternative = {...base, techs: {
    phase_town:true, phase_city:true, zion_magistracy:true,
    zion_guilds:true, zion_stewardship:true }};
  assert.equal(model.measure(alternative, model.freshMemory()).eligible,true);
});

test("Resource shortages and war reduce the welfare score", () => {
  const peaceful = model.measure(base, model.freshMemory());
  const hungry = model.measure({...base, food:0, farms:0}, model.freshMemory());
  assert.ok(hungry.dimensions.provision < peaceful.dimensions.provision);
  const casualties = {...base, kills:45};
  const afterWar = model.updateMemory(model.freshMemory(), casualties);
  assert.ok(afterWar.trauma > 20);
  const conflict = model.measure(casualties, afterWar);
  assert.ok(conflict.dimensions.communion < peaceful.dimensions.communion);
  assert.ok(conflict.score < peaceful.score);
});

test("Trauma fades rather than permanently accumulating", () => {
  let mem = model.updateMemory(model.freshMemory(), {...base, kills:40});
  const start = mem.trauma;
  for (let i=0;i<15;i++) mem=model.updateMemory(mem,{...base, kills:40});
  assert.ok(mem.trauma < start);
  assert.ok(Number.isFinite(mem.trust));
});

test("A capstone alone is not victory without balanced welfare", () => {
  const empty = {
    houses:0, farms:0, markets:0, temples:0, civics:1, healers:0,
    towers:0, fortresses:0, food:0, metal:0, woodGathered:0,
    trade:0, tributes:0, kills:0, techs:base.techs
  };
  const outcome = model.measure(empty, model.freshMemory());
  assert.equal(outcome.age,3);
  assert.equal(outcome.eligible,false);
  assert.ok(outcome.floor<42);
});

test("Native victory condition loads existing engine scripts",()=>{
  const condition=JSON.parse(fs.readFileSync(path.join(mod,
    "simulation/data/settings/victory_conditions/zion.json"),"utf8"));
  assert.deepEqual(condition.Data.Scripts, [
    "scripts/TriggerHelper.js","scripts/ZionModel.js","scripts/ZionVictory.js"]);
  for(const script of condition.Data.Scripts)
    assert.ok(fs.existsSync(path.join(mod,"maps",script)), script);
});

test("Government technologies form mutually exclusive pairs within each choice",()=>{
  const expected=[
    ["pair_zion_foundations","zion_covenant","zion_magistracy"],
    ["pair_zion_institutions","zion_commons","zion_guilds"],
    ["pair_zion_future","zion_concord","zion_stewardship"]];
  const civic=fs.readFileSync(path.join(mod,
    "simulation/templates/template_structure_civic_civil_centre.xml"),"utf8");
  for(const [pair,first,second] of expected){
    const p=JSON.parse(fs.readFileSync(path.join(techPath,pair+".json"),"utf8"));
    assert.deepEqual(p.pair,[first,second]);
    assert.ok(civic.includes(pair));
    for(const techName of p.pair){
      const tech=JSON.parse(fs.readFileSync(path.join(techPath,techName+".json"),"utf8"));
      assert.equal(tech.partOfPair,pair);
      assert.ok(tech.modifications.length);
      assert.ok(fs.existsSync(path.join(mod,"art/textures/ui/session/portraits/technologies",tech.icon)),
        "Missing icon for "+techName+": "+tech.icon);
    }
  }
});

test("Victory engine integration registers valid triggers and preserves state",()=>{
  const notifications=[],registered=[],victories=[];
  const player={ GetResourceCounts:()=>({food:1200,metal:750}),
    AddResource:()=>{},TrySubtractResources:()=>true };
  const buildings={House:12,Field:7,Market:3,Temple:2,CivCentre:2,
    Healer:1,DefenseTower:2,SentryTower:0,Fortress:0};
  const triggers={
    RegisterTrigger:(event,name,data)=>registered.push([event,name,data.enabled]),
    DoRepeatedly:(interval,name)=>registered.push(["Timer",name,interval])
  };
  const fakeTech={IsTechnologyResearched:(id)=>!!base.techs[id]};
  const context={
    ZionModel:model,Trigger:function(){},SYSTEM_ENTITY:0,
    IID_Trigger:"trigger",IID_StatisticsTracker:"stats",
    IID_TechnologyManager:"tech",IID_PlayerManager:"manager",
    IID_GuiInterface:"gui",
    Engine:{ QueryInterface:(entity,type)=>{
      if(type==="trigger")return triggers;
      if(type==="manager")return {GetActivePlayers:()=>[1]};
      if(type==="gui")return {PushNotification:(msg)=>notifications.push(msg)};
      throw new Error("Unexpected interface "+type);
    }},
    QueryPlayerIDInterface:(_id,type)=>{
      if(type==="stats")return {GetStatistics:()=>({tradeIncome:5000,
        tributesSent:1500,enemyUnitsKilled:{total:0},
        resourcesGathered:{wood:2500}})};
      if(type==="tech")return fakeTech;
      return player;
    },
    TriggerHelper:{
      GetPlayerEntitiesByClass:(_id,cls)=>Array(buildings[cls]||0).fill(1),
      GetTime:()=>75000,
      SetPlayerWon:(id)=>victories.push(id)
    },
    markForPluralTranslation:(singular)=>singular
  };
  vm.runInNewContext(fs.readFileSync(path.join(mod,"maps/scripts/ZionVictory.js"),"utf8"),context);
  Object.setPrototypeOf(triggers,context.Trigger.prototype);
  assert.ok(registered.some(x=>x[0]==="OnInitGame"));
  assert.ok(registered.some(x=>x[0]==="OnResearchFinished"));
  triggers.ZionInitialize();
  triggers.ZionResearchFinished({player:1,tech:"zion_covenant"});
  for(let i=0;i<3;i++) triggers.ZionEvaluate();
  assert.deepEqual(victories,[1]);
  assert.equal(triggers.zionSocieties[1].stableChecks,3);
  assert.ok(notifications.some(n=>n.message.includes("FIRST COVENANT FULFILLED")));
});
