/* Zion A.D. — deterministic, engine-independent societal simulation.
 * Copyright (C) 2026 Zion A.D. contributors. GPL-2.0-or-later.
 * No external runtime dependencies. Kept compatible with SpiderMonkey and browsers.
 */
var ZionCore = (function() {
  'use strict';
  const KEYS = ['provision','prosperity','dignity','freedom','wisdom','communion','ecology','resilience'];
  const TITLES = {provision:'Provision', prosperity:'Prosperity', dignity:'Human dignity', freedom:'Freedom', wisdom:'Wisdom', communion:'Communion', ecology:'Creation care', resilience:'Resilience'};
  const QUADRANTS = [
    {id:'inner-self',name:'Interior · Person', subtitle:'Awareness & transformation', keys:['wisdom','dignity']},
    {id:'outer-self',name:'Exterior · Person', subtitle:'Health & material capacity', keys:['provision','resilience']},
    {id:'inner-world',name:'Interior · Collective',subtitle:'Trust & shared meaning',keys:['communion','freedom']},
    {id:'outer-world',name:'Exterior · Collective',subtitle:'Institutions & ecology',keys:['prosperity','ecology']}
  ];
  const STAGES = [
    {name:'Survival', description:'Meet the requirements of life', color:'#8a7c70', threshold:0},
    {name:'Belonging', description:'Kinship, ritual, and solidarity', color:'#8058aa',threshold:26},
    {name:'Order', description:'Law, meaning, and dependable institutions',color:'#bd584b',threshold:39},
    {name:'Achievement',description:'Inquiry, innovation, and agency',color:'#bf8a45',threshold:52},
    {name:'Pluralism',description:'Empathy, rights, and distributed voice',color:'#4e986f',threshold:64},
    {name:'Integration',description:'Coordinate diverse, legitimate needs',color:'#c49e37',threshold:74},
    {name:'Planetary care',description:'Durable interdependence across generations',color:'#4b9ea5',threshold:85}
  ];
  const GOVERNANCE = [
    {id:'covenant',name:'Covenant communities', intro:'Mutual obligation sustained through trusted relationships.', year:1, effects:{communion:3,dignity:1,prosperity:-1}, upkeep:0},
    {id:'elders',name:'Council of elders', intro:'Continuity and mediation with concentrated authority.',year:1,effects:{resilience:3,communion:1,freedom:-2},upkeep:0},
    {id:'monarchy',name:'Sacred monarchy',intro:'Rapid coordination, meaningful succession risks.',year:1,effects:{provision:3,resilience:2,freedom:-3},upkeep:0},
    {id:'charter',name:'Constitutional charter',intro:'Accountable institutions and protected liberties.',year:250,effects:{freedom:3,dignity:2,resilience:1,prosperity:-1},upkeep:2},
    {id:'republic',name:'Mercantile republic',intro:'Distributed enterprise with a danger of inequality.',year:400,effects:{prosperity:4,freedom:1,dignity:-2,ecology:-1},upkeep:2},
    {id:'assemblies',name:'Participatory assemblies',intro:'Wide voice and legitimacy; slower collective decisions.',year:550,effects:{freedom:3,communion:2,resilience:-1,prosperity:-1},upkeep:3},
    {id:'federation',name:'Federated commons',intro:'Subsidiarity, cross-community cooperation, shared stewardship.',year:800,effects:{communion:2,ecology:2,freedom:2,prosperity:-1},upkeep:4}
  ];
  const PROJECTS = [
    {id:'volunteers',name:'Neighborly service',domain:'Shared life',cost:0,effects:{communion:3,dignity:2,provision:1},desc:'A free collective effort when the treasury is exhausted.'},
    {id:'harvest',name:'Regenerative agriculture',domain:'Material life',cost:16, effects:{provision:8,ecology:3,prosperity:1}, desc:'Feed people while restoring soil.'},
    {id:'water',name:'Water & sanitation',domain:'Material life',cost:17,effects:{provision:7,dignity:4,resilience:3}, desc:'Invest in public health.'},
    {id:'enterprise',name:'Local enterprise',domain:'Material life',cost:12,effects:{prosperity:9,provision:1,ecology:-3},desc:'Increase production and wealth.'},
    {id:'trade',name:'Fair trade networks',domain:'Material life',cost:14,effects:{prosperity:7,communion:3,ecology:-2},desc:'Open routes of exchange and contact.'},
    {id:'study',name:'Libraries & learning',domain:'Consciousness',cost:16,effects:{wisdom:9,freedom:3,prosperity:1},desc:'Broaden literacy and critical thought.'},
    {id:'contemplation',name:'Contemplation & formation',domain:'Consciousness',cost:10,effects:{wisdom:6,communion:5,dignity:2},desc:'Make room for the interior life.'},
    {id:'healing',name:'Clinics & mutual aid',domain:'Human flourishing',cost:18,effects:{dignity:8,provision:3,communion:2},desc:'Care for the ill and vulnerable.'},
    {id:'rights',name:'Rights & safeguards',domain:'Human flourishing',cost:15,effects:{freedom:8,dignity:5,resilience:-1},desc:'Protect conscience and due process.'},
    {id:'reconciliation',name:'Restorative justice',domain:'Shared life',cost:12,effects:{communion:8,dignity:5,resilience:1},desc:'Repair harm without normalizing injustice.'},
    {id:'assembly',name:'Citizen deliberation',domain:'Shared life',cost:13,effects:{freedom:7,communion:5,prosperity:-1},desc:'Let affected people participate.'},
    {id:'science',name:'Science & invention',domain:'Institutions',cost:17,effects:{wisdom:5,prosperity:6,ecology:-2},desc:'Expand human capabilities.'},
    {id:'restoration',name:'Watershed restoration',domain:'Institutions',cost:17,effects:{ecology:10,resilience:4,provision:1},desc:'Repair damaged ecosystems.'},
    {id:'defense',name:'Common defense',domain:'Institutions',cost:18,effects:{resilience:9,prosperity:-2,freedom:-2},desc:'Build security without assuming domination.'},
    {id:'solidarity',name:'Redistributive covenant',domain:'Institutions',cost:14,effects:{dignity:8,communion:4,prosperity:-2},desc:'Prevent prosperity from bypassing the poorest.'},
    {id:'transparency',name:'Open public accounts',domain:'Institutions',cost:11,effects:{freedom:6,resilience:4,communion:3},desc:'Give power scrutiny and accountability.'},
    {id:'peacemaking',name:'Diplomacy & refuge',domain:'Shared life',cost:13,effects:{communion:6,dignity:5,resilience:3,prosperity:-1},desc:'Welcome outsiders and negotiate peace.'}
  ];
  const EVENTS = [
    {id:'drought',title:'The river withdraws',text:'A long drought exposes the limits of old irrigation systems.',min:1, choices:[{text:'Share supplies with neighbors',effects:{provision:-5,communion:7,dignity:4}},{text:'Protect core settlements first',effects:{provision:4,resilience:3,communion:-6,dignity:-4}}]},
    {id:'migrants',title:'Strangers at the gates',text:'Families displaced by conflict ask to make their homes among you.',min:1,choices:[{text:'Welcome and integrate',effects:{communion:6,dignity:6,provision:-3,resilience:-2}},{text:'Strictly restrict settlement',effects:{resilience:3,provision:2,freedom:-4,dignity:-6}}]},
    {id:'succession',title:'The burden of succession',text:'A leader dies without agreement on who should follow.',min:1,choices:[{text:'Convene broad deliberation',effects:{freedom:6,communion:4,resilience:-4}},{text:'Appoint an emergency regent',effects:{resilience:5,freedom:-6,communion:-2}}]},
    {id:'plague',title:'An unfamiliar illness',text:'Illness spreads through towns faster than custom can contain.',min:150,choices:[{text:'Fund care for all',effects:{dignity:8,provision:-4,resilience:3}},{text:'Prioritize economic continuity',effects:{prosperity:5,dignity:-7,communion:-4}}]},
    {id:'merchant',title:'The wealthy guilds',text:'Trade guilds offer prosperity in return for political privilege.',min:150,choices:[{text:'Accept their charter',effects:{prosperity:8,freedom:-4,dignity:-5}},{text:'Condition it on public obligations',effects:{prosperity:3,freedom:3,dignity:5}}]},
    {id:'heresy',title:'A dispute about truth',text:'Communities disagree over sacred interpretations and authority.',min:200,choices:[{text:'Allow conscience and open debate',effects:{freedom:7,wisdom:4,communion:-2}},{text:'Impose a single confession',effects:{communion:2,resilience:2,freedom:-9,wisdom:-3}}]},
    {id:'harvest_failure',title:'A failed harvest',text:'A blight threatens the food supply just before winter.',min:250,choices:[{text:'Distribute emergency reserves',effects:{provision:4,communion:3,prosperity:-6}},{text:'Allow scarcity prices',effects:{prosperity:3,provision:-7,dignity:-5}}]},
    {id:'revolt',title:'A challenge to legitimacy',text:'Those excluded from council decisions demand representation.',min:400,choices:[{text:'Expand political participation',effects:{freedom:8,communion:4,resilience:-3}},{text:'Suppress the demonstrations',effects:{resilience:5,freedom:-9,communion:-8}}]},
    {id:'innovation',title:'A disruptive invention',text:'New machinery promises abundance but displaces established livelihoods.',min:500,choices:[{text:'Adapt with universal retraining',effects:{prosperity:5,wisdom:4,dignity:5}},{text:'Concentrate the gains',effects:{prosperity:10,dignity:-7,communion:-5}}]},
    {id:'forest',title:'The contested forest',text:'A timber boom threatens the watershed on which villages depend.',min:550,choices:[{text:'Restore and steward the commons',effects:{ecology:9,provision:2,prosperity:-5}},{text:'Exploit the short-term windfall',effects:{prosperity:8,ecology:-10,resilience:-3}}]},
    {id:'war',title:'War across the frontier',text:'Neighboring factions demand a military response.',min:600,choices:[{text:'Seek mediation and defend civilians',effects:{communion:5,dignity:4,resilience:-2,prosperity:-2}},{text:'Launch a pre-emptive campaign',effects:{resilience:5,prosperity:-3,communion:-9,dignity:-5}}]},
    {id:'technology',title:'Power without wisdom',text:'A transformative technology multiplies both possibility and risk.',min:800,choices:[{text:'Create shared oversight',effects:{wisdom:5,freedom:3,resilience:4,prosperity:-3}},{text:'Race forward without constraints',effects:{prosperity:9,ecology:-6,communion:-4,resilience:-4}}]},
    {id:'inequality',title:'Two cities in one',text:'The prosperity of the center obscures hardship on its outskirts.',min:900,choices:[{text:'Invest in those left behind',effects:{dignity:9,communion:5,prosperity:-3}},{text:'Let wealth trickle through markets',effects:{prosperity:5,dignity:-7,communion:-4}}]},
    {id:'climate',title:'The changing seasons',text:'Climate patterns shift, demanding choices beyond one generation.',min:1100,choices:[{text:'Commit to a long transition',effects:{ecology:10,resilience:4,prosperity:-5}},{text:'Defer costly adaptation',effects:{prosperity:6,ecology:-10,resilience:-5}}]},
    {id:'network',title:'The networked world',text:'Information circulates faster than any authority can fully govern.',min:1300,choices:[{text:'Teach discernment and protect speech',effects:{wisdom:6,freedom:5,communion:2}},{text:'Centralize information control',effects:{resilience:3,freedom:-9,wisdom:-4}}]},
    {id:'automation',title:'Labor transformed',text:'Machines now perform work that once supplied livelihoods and identity.',min:1450,choices:[{text:'Share productivity and expand care',effects:{dignity:8,communion:5,prosperity:1}},{text:'Concentrate ownership',effects:{prosperity:10,dignity:-9,freedom:-3}}]},
    {id:'planet',title:'The fragile home',text:'Your ecological footprint now affects communities beyond your borders.',min:1650,choices:[{text:'Join a planetary covenant',effects:{ecology:8,communion:6,resilience:2,prosperity:-3}},{text:'Secure domestic advantage',effects:{prosperity:5,communion:-6,ecology:-8}}]},
    {id:'final',title:'The last shall be first',text:'The civilization must decide how to measure its final achievements.',min:1850,choices:[{text:'Give priority to the most vulnerable',effects:{dignity:10,communion:6,prosperity:-3}},{text:'Celebrate power and abundance',effects:{prosperity:8,resilience:3,dignity:-8}}]}
  ];
  function clamp(x,lo,hi) { return Math.max(lo,Math.min(hi,x)); }
  function average(arr){return arr.reduce((a,b)=>a+b,0)/arr.length;}
  function quadrantScores(metrics){return QUADRANTS.map(q=>({id:q.id,name:q.name,value:Math.round(average(q.keys.map(k=>metrics[k])))}));}
  function diagnose(metrics) {
    const vals=KEYS.map(k=>metrics[k]);const mean=average(vals);const floor=Math.min(...vals);
    const balance=clamp(1-(Math.max(...vals)-floor)/110,0,1);
    const score=Math.round(mean*0.62+floor*0.32+balance*6);
    const stage=STAGES.reduce((a,s,i)=>score>=s.threshold?i:a,0);
    const quadrants=quadrantScores(metrics);
    const flourishing=mean>=76 && floor>=62 && quadrants.every(q=>q.value>=70);
    return {score:score,stage:stage,stageName:STAGES[stage].name,mean:Math.round(mean),floor:floor,quadrants:quadrants,flourishing:flourishing};
  }
  function create(seed){return {year:1,turn:0,seed:seed||43, metrics:{provision:48,prosperity:42,dignity:48,freedom:38,wisdom:39,communion:59,ecology:72,resilience:45}, governance:'covenant', treasury:76,population:450,history:[],usedEvents:[], completed:false, collapseYears:0, legacy:0};}
  function copy(s){return JSON.parse(JSON.stringify(s));}
  function rnd(s){s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;}
  function apply(m,effects){for(const k of Object.keys(effects||{}))if(k in m)m[k]=clamp(m[k]+effects[k],0,100);}
  function eventFor(s){
    const eligible=EVENTS.filter(e=>e.min<=s.year && s.usedEvents.indexOf(e.id)<0);
    if(!eligible.length) { const prior=EVENTS.filter(e=>e.min<=s.year); return prior[(Math.floor(s.year/50))%prior.length]; }
    const hash=(Math.imul(1664525,(s.seed ^ Math.imul(s.turn+1,2654435761))>>>0)+1013904223)>>>0;
    return eligible[Math.floor((hash/4294967296)*eligible.length)];
  }
  function availableGovernance(s){return GOVERNANCE.filter(g=>s.year>=g.year);}
  function costOf(s,p,g) {
    const reform = g.id===s.governance?0:6;
    const upkeep = p.id==='volunteers' && reform===0 ? Math.min(g.upkeep,Math.max(0,s.treasury)) : g.upkeep;
    return p.cost+reform+upkeep;
  }
  function advance(s, opts){
    if(s.completed)throw new Error('The campaign has ended');
    const p=PROJECTS.find(x=>x.id===opts.project);if(!p)throw new Error('Choose a valid project');
    const g=GOVERNANCE.find(x=>x.id===(opts.governance||s.governance));if(!g||g.year>s.year)throw new Error('Governance unavailable');
    const costs=costOf(s,p,g);
    if(costs>s.treasury)throw new Error('Insufficient treasury');
    const next=copy(s), before=diagnose(next.metrics);
    next.treasury-=costs;next.governance=g.id;
    apply(next.metrics,p.effects);apply(next.metrics,g.effects);
    const event=EVENTS.find(e=>e.id===opts.eventId && e.min<=s.year);
    if(!event)throw new Error('Event no longer valid');
    const choice=event.choices[opts.choice];if(!choice)throw new Error('Invalid response');
    apply(next.metrics,choice.effects);
    next.usedEvents.push(event.id);
    const m=next.metrics;
    // Dynamic interdependence: abundance improves capacity; ecological stress undermines it.
    const income=11+Math.floor(m.prosperity/5)+Math.floor(m.provision/12);
    const needs=8+Math.floor(next.population/1700);
    next.treasury=clamp(next.treasury+income-needs,0,250);
    if(m.ecology<40){apply(m,{provision:-3,resilience:-3});}
    if(m.dignity<35||m.freedom<25)apply(m,{communion:-3,resilience:-2});
    if(m.communion<30)apply(m,{prosperity:-2});
    if(m.provision<25)apply(m,{dignity:-4,communion:-2});
    if(m.wisdom>70&&m.freedom>60)apply(m,{resilience:1});
    if(m.ecology>70&&m.provision>55)apply(m,{resilience:1});
    const pressure=next.turn>0&&next.turn%5===4 ? 3:1;
    // Historical shocks and institutional entropy prevent endless effortless compounding.
    apply(m,{provision:-pressure,prosperity:-1,dignity:-1,freedom:-1,wisdom:-1,communion:-2,ecology:-2,resilience:-2});
    next.population=Math.max(30,Math.round(next.population*(1+(m.provision-35)/850)));
    next.year=Math.min(2000, s.year+50);next.turn++;
    const report=diagnose(m);
    if(report.floor<12)next.collapseYears++;else next.collapseYears=0;
    next.legacy+=report.score;
    next.history.push({year:next.year,project:p.id,governance:g.id,event:event.id,choice:opts.choice,score:report.score,stage:report.stage,treasury:next.treasury,metrics:copy(m),delta:report.score-before.score});
    next.completed=next.year>=2000||next.collapseYears>=3;
    return next;
  }
  function outcome(s){const d=diagnose(s.metrics);return {won:s.year>=2000&&d.flourishing,score:d.score,stage:d.stageName,year:s.year,description:s.collapseYears>=3?'Institutional collapse':d.flourishing?'A durable, unfinished Zion':'The covenant remains unfinished',diagnosis:d};}
  function observeRTS(obs){
    // Game-world proxy measurements, not a claim to quantify consciousness or actual justice.
    const metrics={
      provision:clamp(22+obs.food/20+obs.farms*7+obs.houses*0.8,0,100),
      prosperity:clamp(19+obs.trade/80+obs.markets*11+obs.civics*6+obs.metal/120,0,100),
      dignity:clamp(28+obs.houses*4+obs.healers*11+obs.temples*2,0,100),
      freedom:clamp(35+obs.markets*7+obs.civics*6+obs.houses*1.3-obs.fortresses*7,0,100),
      wisdom:clamp(24+obs.temples*11+obs.healers*5+obs.civics*4+obs.techs*2,0,100),
      communion:clamp(32+obs.temples*7+obs.houses*2+obs.tributes/60-obs.kills*0.7,0,100),
      ecology:clamp(75-obs.woodGathered/180+obs.farms*3,0,100),
      resilience:clamp(26+obs.towers*5+obs.civics*8+obs.healers*4+obs.food/120,0,100)
    };
    return diagnose(metrics);
  }
  return {KEYS:KEYS,TITLES:TITLES,QUADRANTS:QUADRANTS,STAGES:STAGES,GOVERNANCE:GOVERNANCE,PROJECTS:PROJECTS,EVENTS:EVENTS,create:create,diagnose:diagnose,availableGovernance:availableGovernance,eventFor:eventFor,costOf:costOf,advance:advance,outcome:outcome,observeRTS:observeRTS};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ZionCore;
