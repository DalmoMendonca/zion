// Zion A.D. - native Pyrogenesis victory mode and social simulation.
// Runs only in matches with the "Zion: First Covenant" victory condition.
(function()
{
    "use strict";

    const CHECK_INTERVAL = 25000;
    const CHECKS_TO_WIN = 3;
    const POLICY_IDS = Object.keys(ZionModel.GOVERNMENTS);
    const PHASES = ["phase_town", "phase_city"];
    const allTechs = POLICY_IDS.concat(PHASES);

    function total(value)
    {
        if (typeof value === "number")
            return Number.isFinite(value) ? value : 0;
        if (!value || typeof value !== "object")
            return 0;
        return Object.values(value).reduce((n, child) => n + total(child), 0);
    }

    function count(player, cls)
    {
        return TriggerHelper.GetPlayerEntitiesByClass(player, cls).length;
    }

    function observe(playerID)
    {
        const cmpPlayer = QueryPlayerIDInterface(playerID);
        const cmpStats = QueryPlayerIDInterface(playerID, IID_StatisticsTracker);
        const cmpTech = QueryPlayerIDInterface(playerID, IID_TechnologyManager);
        const stats = cmpStats ? cmpStats.GetStatistics() : {};
        const stock = cmpPlayer ? cmpPlayer.GetResourceCounts() : {};
        const techs = {};
        for (const id of allTechs)
            techs[id] = !!(cmpTech && cmpTech.IsTechnologyResearched(id));
        return {
            "food": stock.food || 0,
            "metal": stock.metal || 0,
            "houses": count(playerID, "House"),
            "farms": count(playerID, "Field"),
            "markets": count(playerID, "Market"),
            "temples": count(playerID, "Temple"),
            "civics": count(playerID, "CivCentre"),
            "healers": count(playerID, "Healer"),
            "towers": count(playerID, "DefenseTower") + count(playerID, "SentryTower"),
            "fortresses": count(playerID, "Fortress"),
            "trade": total(stats.tradeIncome),
            "tributes": total(stats.tributesSent),
            "kills": total(stats.enemyUnitsKilled),
            "woodGathered": total(stats.resourcesGathered && stats.resourcesGathered.wood),
            "techs": techs
        };
    }

    function notify(players, message)
    {
        Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface).PushNotification({
            "players": players,
            "message": message
        });
    }

    Trigger.prototype.ZionInitialize = function()
    {
        // Stored on the engine Trigger component so savegames retain institutional memory.
        this.zionSocieties = {};
        this.zionLatestReports = {};
        this.zionLastAges = {};
        this.zionResolved = false;
        notify([], "ZION A.D. | First Covenant. Select a Civic Center to research forms of government. Develop a society that endures, not merely an empire that wins wars.");
        this.DoRepeatedly(CHECK_INTERVAL, "ZionEvaluate", {}, 6000);
    };

    Trigger.prototype.ZionResearchFinished = function(data)
    {
        if (this.zionResolved || !data || POLICY_IDS.indexOf(data.tech) === -1)
            return;
        notify([data.player], "CIVIC REFORM | " + ZionModel.GOVERNMENTS[data.tech] +
            " enacted. Its benefits and costs now affect buildings and units.");
    };

    Trigger.prototype.ZionEvaluate = function()
    {
        if (this.zionResolved || !this.zionSocieties)
            return;
        const manager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
        const active = manager.GetActivePlayers();
        for (const playerID of active)
        {
            const observation = observe(playerID);
            const memory = ZionModel.updateMemory(
                this.zionSocieties[playerID] || ZionModel.freshMemory(), observation);
            let result = ZionModel.measure(observation, memory);
            memory.stableChecks = result.eligible ? memory.stableChecks + 1 : 0;
            this.zionSocieties[playerID] = memory;
            this.zionLatestReports[playerID] = {
                "score": result.score,
                "floor": result.floor,
                "ageName": result.ageName,
                "dimensions": result.dimensions,
                "quadrants": result.quadrants,
                "trust": Math.round(memory.trust),
                "warStrain": Math.round(memory.trauma),
                "sustained": memory.stableChecks,
                "needed": CHECKS_TO_WIN
            };
            const oldAge = this.zionLastAges[playerID] || 0;
            if (result.age > oldAge)
            {
                this.zionLastAges[playerID] = result.age;
                notify([playerID], "NEW AGE | " + result.ageName +
                    ". Your institutional choices have changed your civilization's capabilities.");
            }
            const cmpPlayer = QueryPlayerIDInterface(playerID);
            // Prosperous, ecologically viable local food systems gain a modest payoff.
            if (result.dimensions.ecology >= 68 && result.dimensions.provision >= 65 &&
                observation.farms >= 3)
                cmpPlayer.AddResource("food", 10);
            // Prolonged wartime stress has a real, restrained resource cost.
            if (memory.trauma >= 18 && observation.food >= 30 &&
                result.dimensions.communion < 42)
                cmpPlayer.TrySubtractResources({ "food": 8 });

            const step = Math.floor(TriggerHelper.GetTime() / CHECK_INTERVAL);
            if (step % 3 === 0 || memory.stableChecks === 1)
                notify([playerID], "ZION | " + result.ageName + " | balance " +
                    result.floor + "/100; flourishing " + result.score +
                    "/100; trust " + Math.round(memory.trust) +
                    "; war strain " + Math.round(memory.trauma) +
                    (result.eligible ? "; enduring covenant " +
                        memory.stableChecks + "/" + CHECKS_TO_WIN : "") + ".");

            if (memory.stableChecks < CHECKS_TO_WIN)
                continue;
            this.zionResolved = true;
            notify([playerID], "FIRST COVENANT FULFILLED | Your society sustained balanced flourishing through multiple evaluations.");
            TriggerHelper.SetPlayerWon(
                playerID,
                n => markForPluralTranslation(
                    "%(lastPlayer)s has built an enduring first covenant.",
                    "%(players)s and %(lastPlayer)s have built an enduring first covenant.", n),
                n => markForPluralTranslation(
                    "%(lastPlayer)s did not complete the first covenant.",
                    "%(players)s and %(lastPlayer)s did not complete the first covenant.", n)
            );
            return;
        }
    };

    const trigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
    trigger.RegisterTrigger("OnInitGame", "ZionInitialize", { "enabled": true });
    trigger.RegisterTrigger("OnResearchFinished", "ZionResearchFinished", { "enabled": true });
})();
