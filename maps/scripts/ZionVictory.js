/* Zion A.D. victory condition for 0 A.D. Release 28.
 * The economic world, graphics, entities and combat come from 0 A.D.
 * The interpretive flourishing model is original, aspirational, and provisional.
 * Copyright (C) 2026 Zion A.D. contributors. GPL-2.0-or-later.
 */
(function() {
  'use strict';
  const YEAR_MS = 1500; // 2,000 years = ~50 minutes at 1× simulation speed.
  const CHECK_MS = 15000;
  const END_YEAR = 2000;
  const TIME_SCALE = 1;

  function numericSum(value) {
    if (typeof value === 'number') return isFinite(value) ? value : 0;
    if (!value || typeof value !== 'object') return 0;
    let n = 0;
    for (const k in value) n += numericSum(value[k]);
    return n;
  }
  function countClass(id, className) {
    return TriggerHelper.GetPlayerEntitiesByClass(id, className).length;
  }
  function resources(player) {
    return player && player.GetResourceCounts ? player.GetResourceCounts() : {};
  }
  function readCivilization(playerID) {
    const cmpPlayer = QueryPlayerIDInterface(playerID);
    const cmpStatistics = QueryPlayerIDInterface(playerID, IID_StatisticsTracker);
    const stats = cmpStatistics ? cmpStatistics.GetStatistics() : {};
    const stock = resources(cmpPlayer);
    return {
      food: stock.food || 0, metal: stock.metal || 0,
      markets: countClass(playerID,'Market'),
      houses: countClass(playerID,'House'),
      farms: countClass(playerID,'Field') + countClass(playerID,'Farmstead'),
      civics: countClass(playerID,'CivCentre'),
      temples: countClass(playerID,'Temple'),
      towers: countClass(playerID,'DefenseTower') + countClass(playerID,'SentryTower'),
      fortresses: countClass(playerID,'Fortress'),
      healers: countClass(playerID,'Healer'),
      techs: 0,
      trade: numericSum(stats.tradeIncome),
      tributes: numericSum(stats.tributesSent),
      kills: numericSum(stats.enemyUnitsKilled),
      woodGathered: numericSum(stats.resourcesGathered && stats.resourcesGathered.wood)
    };
  }
  function inform(players, msg) {
    const notification = { 'message': msg };
    if (players && players.length) notification.players = players;
    Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface).PushNotification(notification);
  }
  Trigger.prototype.ZionInit = function() {
    this.zion = {lastCentury:0, stageByPlayer:{}, resolved: false};
    inform([], 'ZION A.D. | The 2,000-year covenant has begun. Flourishing matters more than conquest.');
    this.DoRepeatedly(CHECK_MS,'ZionCheck',{});
  };
  Trigger.prototype.ZionCheck = function() {
    if (!this.zion || this.zion.resolved) return;
    const year = Math.min(END_YEAR, 1 + Math.floor(TriggerHelper.GetTime()/YEAR_MS*TIME_SCALE));
    const century = Math.floor(year / 100);
    const isCentury=century > this.zion.lastCentury;
    if(isCentury) this.zion.lastCentury=century;
    const active = Engine.QueryInterface(SYSTEM_ENTITY,IID_PlayerManager).GetActivePlayers();
    const contenders=[];
    for(const player of active) {
      const data=readCivilization(player);
      const diagnosis=ZionCore.observeRTS(data);
      contenders.push({player:player,score:diagnosis.score,flourishing:diagnosis.flourishing});
      if (this.zion.stageByPlayer[player] !== diagnosis.stage && diagnosis.stage > 0) {
        this.zion.stageByPlayer[player]=diagnosis.stage;
        inform([player],'YEAR '+year+' | Developmental center: '+diagnosis.stageName+'; balance '+diagnosis.floor+'/100.');
      }
      if(isCentury) {
        const q=diagnosis.quadrants;
        inform([player],'YEAR '+year+' | Zion score '+diagnosis.score+' · '+ diagnosis.stageName+' · quadrants '+q.map(x=>x.value).join(' / ')+'. Build houses, temples, markets, farms, and clinics; share resources and care for land.');
      }
      // Conditions matter within the match, not solely on the scorecard.
      // Renewed ecologies and care slowly replenish food; resource-depleted civilizations suffer shortages.
      if(isCentury) {
        const cmpPlayer=QueryPlayerIDInterface(player);
        if (diagnosis.floor>=60) cmpPlayer.AddResource('food',35);
        else if (diagnosis.floor<22) {
          const before=resources(cmpPlayer);
          cmpPlayer.SetResourceCounts(Object.assign({},before,{food:Math.max(0,(before.food||0)-45)}));
          inform([player],'Zion warning: severe imbalance has depleted food reserves.');
        }
      }
    }
    if (year<END_YEAR) return;
    this.zion.resolved=true;
    const qualified=contenders.filter(x=>x.flourishing).sort((a,b)=>b.score-a.score);
    if(qualified.length) {
      const winners=qualified.map(x=>x.player);
      inform(winners,'YEAR 2000 | Zion endures. All four quadrants have reached the threshold of flourishing.');
      // Multiple flourishing societies can share victory regardless of empire size.
      Engine.QueryInterface(SYSTEM_ENTITY,IID_EndGameManager).MarkPlayersAsWon(
        winners,
        n=>'Zion was cultivated through 2000 years of shared flourishing.',
        n=>'Other civilizations completed the Zion covenant.'
      );
    } else {
      for (const c of contenders) {
        inform([c.player],'YEAR 2000 | The covenant continues unfinished. Final score: '+c.score+'.');
        // Losing is not a moral judgment of a people, and rebuilding remains possible in another run.
        const player=QueryPlayerIDInterface(c.player);
        if(player && player.IsActive()) player.SetState('defeated','Zion remains unfinished at the end of the 2000-year covenant.');
      }
    }
  };
  const trigger = Engine.QueryInterface(SYSTEM_ENTITY,IID_Trigger);
  trigger.RegisterTrigger('OnInitGame','ZionInit',{'enabled':true});
})();
