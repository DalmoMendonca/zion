const test=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../maps/scripts/ZionCore.js');

test('campaign covers exactly 40 decisions and 2,000 years',()=>{
 let s=Core.create(5);
 assert.equal(s.year,1);
 for(let t=0;t<40;t++){
   const e=Core.eventFor(s);
   const choices=[];
   for(const p of Core.PROJECTS) for(const g of Core.availableGovernance(s)){
     if(Core.costOf(s,p,g)>s.treasury)continue;
     for(let choice=0;choice<2;choice++){
       const next=Core.advance(s,{project:p.id,governance:g.id,eventId:e.id,choice});
       const score=Core.diagnose(next.metrics);
       choices.push({next, priority:score.floor*3+score.mean});
     }
   }
   choices.sort((a,b)=>b.priority-a.priority);
   s=choices[0].next;
 }
 assert.equal(s.year,2000);assert.equal(s.turn,40);assert.equal(s.completed,true);
 assert.throws(()=>Core.advance(s,{project:'volunteers',eventId:'drought',choice:0}));
});

test('event ordering is deterministic, not mutated by viewing the screen',()=>{
 const s=Core.create(123);
 const event=Core.eventFor(s).id;
 assert.equal(Core.eventFor(s).id,event);
 assert.equal(Core.eventFor(JSON.parse(JSON.stringify(s))).id,event);
});

test('unavailable governance, invalid actions and unaffordable investments fail closed',()=>{
 const s=Core.create(1), event=Core.eventFor(s);
 assert.throws(()=>Core.advance(s,{project:'nonsense',eventId:event.id,choice:0}),/valid project/);
 assert.throws(()=>Core.advance(s,{project:'harvest',governance:'federation',eventId:event.id,choice:0}),/unavailable/);
 s.treasury=0;
 assert.throws(()=>Core.advance(s,{project:'harvest',eventId:event.id,choice:0}),/treasury/);
 assert.equal(Core.costOf(s,Core.PROJECTS[0],Core.GOVERNANCE[0]),0);
 assert.doesNotThrow(()=>Core.advance(s,{project:'volunteers',eventId:event.id,choice:0}));
});

test('bounded scores and 4 quadrant diagnostics',()=>{
 const input={provision:100,prosperity:100,dignity:100,freedom:100,wisdom:100,communion:100,ecology:100,resilience:10};
 const d=Core.diagnose(input);
 assert.equal(d.flourishing,false);assert.equal(d.quadrants.length,4);assert.equal(d.floor,10);
 const full=Core.diagnose(Object.fromEntries(Core.KEYS.map(k=>[k,80])));
 assert.equal(full.flourishing,true);
});

test('the reward model permits deliberate balanced success and genuine failure',()=>{
 function simulate(good){let s=Core.create(29);for(let turn=0;!s.completed&&turn<40;turn++){
   const e=Core.eventFor(s), options=[];
   for(const p of Core.PROJECTS) for(const g of Core.availableGovernance(s)){
     if(Core.costOf(s,p,g)>s.treasury)continue;
     for(let choice=0;choice<2;choice++){
       const next=Core.advance(s,{project:p.id,governance:g.id,eventId:e.id,choice});
       const d=Core.diagnose(next.metrics);
       options.push({next,priority: d.floor*3+d.mean});
     }
   }
   assert.ok(options.length,'there is always a legal choice');
   options.sort((a,b)=>good?b.priority-a.priority:a.priority-b.priority);
   s=options[0].next;
 }return Core.outcome(s);}
 const thriving=simulate(true), failing=simulate(false);
 assert.equal(thriving.year,2000);assert.equal(thriving.won,true);
 assert.equal(failing.won,false);
 assert.ok(thriving.score>failing.score);
});

test('RTS proxy counts interpret care, ecology and trade without exceeding bounds',()=>{
 const weak=Core.observeRTS({food:5,metal:0,markets:0,houses:0,farms:0,civics:0,temples:0,towers:0,fortresses:0,healers:0,techs:0,trade:0,tributes:0,kills:900,woodGathered:30000});
 const strong=Core.observeRTS({food:1000,metal:2000,markets:4,houses:8,farms:6,civics:4,temples:7,towers:6,fortresses:0,healers:3,techs:0,trade:1000,tributes:60,kills:0,woodGathered:500});
 assert.equal(weak.flourishing,false);
 assert.equal(strong.flourishing,true);
});
