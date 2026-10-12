const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.join(__dirname,'..');
function run(tall=false){
 let time=0, messages=[], won=false, playerDefeated=false, registered={};
 const counts=tall?{Market:4,House:8,Field:6,Farmstead:0,CivCentre:4,Temple:7,DefenseTower:6,SentryTower:0,Fortress:0,Healer:3}:{Market:0,House:2,Field:0,Farmstead:0,CivCentre:1,Temple:0,DefenseTower:0,SentryTower:0,Fortress:0,Healer:0};
 const stock=tall?{food:1000,metal:2000}:{food:0,metal:0};
 const player={GetResourceCounts:()=>stock,AddResource:(key,val)=>stock[key]+=val,SetResourceCounts:next=>Object.assign(stock,next),IsActive:()=>true,SetState:(s)=>{playerDefeated=s==='defeated'}};
 function Trigger(){};const trigger=new Trigger();trigger.RegisterTrigger=(ev,name)=>registered[ev]=name;trigger.DoRepeatedly=()=>0;
 const context={Trigger,console,Math,JSON,Set,Object,Array,Error,
  SYSTEM_ENTITY:0,IID_Trigger:'Trigger',IID_StatisticsTracker:'Statistics',IID_GuiInterface:'GUI',IID_PlayerManager:'Players',IID_EndGameManager:'EndGame',
  TriggerHelper:{GetTime:()=>time,GetPlayerEntitiesByClass:(id,c)=>Array(counts[c]||0).fill(1)},
  QueryPlayerIDInterface:(id,iid)=>iid==='Statistics'?{GetStatistics:()=>({tradeIncome:tall?1000:0,tributesSent:0,enemyUnitsKilled:{Total:tall?0:200},resourcesGathered:{wood:tall?500:30000}})}:player,
  Engine:{QueryInterface:(id,iid)=>iid==='Trigger'?trigger:iid==='GUI'?{PushNotification:n=>messages.push(n)}:iid==='Players'?{GetActivePlayers:()=>[1]}:iid==='EndGame'?{MarkPlayersAsWon:()=>won=true}:null}
 };
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'maps/scripts/ZionCore.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,'maps/scripts/ZionVictory.js'),'utf8'),context);
 assert.equal(registered.OnInitGame,'ZionInit');
 trigger.ZionInit();time=3_005_000;trigger.ZionCheck();
 return {won,playerDefeated,messages};
}
test('new mode registers and initializes under an engine-simulator stub',()=>{
 const good=run(true);assert.equal(good.won,true);assert.equal(good.playerDefeated,false);assert.ok(good.messages.length>=2);
});
test('run ends with an incomplete covenant rather than automatic victory',()=>{
 const fail=run(false);assert.equal(fail.won,false);assert.equal(fail.playerDefeated,true);
});
