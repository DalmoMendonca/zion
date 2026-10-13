// This file intentionally contains the ZionModel source at its start.
// Engine victory scripts execute independently; see tests/zion-native.test.cjs.
// Zion A.D. - native RTS societal model. GPL-2.0-or-later.
// This is a heuristic game system, not a measure of real cultures or persons.
var ZionModel = (function()
{
    "use strict";

    const DIMENSIONS = ["provision", "prosperity", "dignity", "freedom",
        "wisdom", "communion", "ecology", "resilience"];
    const GOVERNMENTS = {
        "zion_covenant": "Covenant Council",
        "zion_magistracy": "Chartered Magistracy",
        "zion_commons": "Common Assembly",
        "zion_guilds": "Guild Republic",
        "zion_concord": "Covenant of Concord",
        "zion_stewardship": "Covenant of Stewardship"
    };
    const clamp = (value, low = 0, high = 100) => Math.max(low, Math.min(high, value));
    const amount = (value) => Number.isFinite(value) ? Math.max(0, value) : 0;

    function freshMemory()
    {
        return { "trauma": 0, "trust": 0, "lastKills": 0, "lastLosses": 0, "lastTributes": 0, "stableChecks": 0 };
    }

    function measure(o, memory)
    {
        const has = id => !!(o.techs && o.techs[id]);
        const m = memory || freshMemory();
        const s = {};
        s.provision = 20 + Math.min(25, amount(o.food) / 50) +
            amount(o.farms) * 6 + amount(o.houses);
        s.prosperity = 25 + Math.min(18, amount(o.trade) / 60) +
            amount(o.markets) * 12 + amount(o.civics) * 5 +
            Math.min(15, amount(o.metal) / 75);
        s.dignity = 28 + amount(o.houses) * 3 + amount(o.temples) * 8 +
            amount(o.healers) * 9 + (has("zion_covenant") ? 5 : 0) +
            (has("zion_commons") ? 4 : 0);
        s.freedom = 28 + amount(o.houses) * 2 + amount(o.markets) * 10 +
            amount(o.civics) * 6 - amount(o.fortresses) * 6 +
            (has("zion_magistracy") ? 3 : 0) + (has("zion_guilds") ? 3 : 0);
        s.wisdom = 30 + amount(o.temples) * 14 + amount(o.healers) * 8 +
            amount(o.civics) * 5 + (has("zion_concord") ? 7 : 0) +
            (has("zion_stewardship") ? 5 : 0);
        s.communion = 31 + amount(o.houses) * 1.7 + amount(o.temples) * 9 +
            Math.min(18, amount(o.tributes) / 70) -
            Math.min(25, amount(o.kills) * 0.4) +
            (has("zion_covenant") ? 8 : 0) + (has("zion_commons") ? 5 : 0) -
            (has("zion_guilds") ? 2 : 0);
        s.ecology = 79 - Math.min(38, amount(o.woodGathered) / 125) +
            amount(o.farms) * 2 + (has("zion_stewardship") ? 8 : 0);
        s.resilience = 30 + amount(o.civics) * 9 + amount(o.towers) * 6 +
            amount(o.farms) * 2 + Math.min(13, amount(o.food) / 180) +
            (has("zion_magistracy") ? 6 : 0) +
            (has("zion_concord") ? 6 : 0);

        s.dignity -= m.trauma * 0.35;
        s.communion += m.trust * 0.8 - m.trauma * 0.55;
        s.resilience += m.trust * 0.3 - m.trauma * 0.25;

        for (const key of DIMENSIONS)
            s[key] = Math.round(clamp(s[key]));

        const values = DIMENSIONS.map(key => s[key]);
        const mean = values.reduce((total, value) => total + value, 0) / values.length;
        const floor = Math.min(...values);
        const score = Math.round(mean * 0.78 + floor * 0.22);
        const first = has("zion_covenant") || has("zion_magistracy");
        const second = has("zion_commons") || has("zion_guilds");
        const final = has("zion_concord") || has("zion_stewardship");
        const age = final && has("phase_city") ? 3 :
            second && has("phase_town") ? 2 : first ? 1 : 0;
        const names = ["Founding settlement", "Community covenant",
            "Institutional township", "Renewing civilization"];
        const quadrants = [
            Math.round((s.wisdom + s.dignity) / 2),
            Math.round((s.provision + s.resilience) / 2),
            Math.round((s.communion + s.freedom) / 2),
            Math.round((s.prosperity + s.ecology) / 2)
        ];
        // A demanding but attainable early-game objective; NOT the 2,000-year endgame.
        const eligible = age === 3 && mean >= 59 && floor >= 42 &&
            quadrants.every(value => value >= 51);
        return { "dimensions": s, "mean": Math.round(mean),
            "floor": floor, "score": score, "age": age, "ageName": names[age],
            "quadrants": quadrants, "eligible": eligible };
    }

    function updateMemory(memory, observation)
    {
        const next = Object.assign(freshMemory(), memory || {});
        const kills = amount(observation.kills);
        const newKills = Math.max(0, kills - next.lastKills);
        const losses = amount(observation.losses);
        const newLosses = Math.max(0, losses - next.lastLosses);
        const aid = amount(observation.tributes);
        const newAid = Math.max(0, aid - next.lastTributes);
        next.lastKills = kills;
        next.lastLosses = losses;
        next.lastTributes = aid;
        // Defensive casualties are socially costly too. Healing takes time.
        next.trauma = clamp(next.trauma * 0.96 + newKills * 1.4 +
            newLosses * 1.7, 0, 50);
        const foodStress = amount(observation.food) < 100;
        const cooperative = !!(observation.techs &&
            (observation.techs.zion_commons || observation.techs.zion_concord));
        next.trust = clamp(next.trust + (cooperative ? 0.7 : 0.1) +
            (newAid > 100 ? 0.5 : 0) - (foodStress ? 1.4 : 0) -
            newKills * 0.3 - newLosses * 0.35, -35, 30);
        return next;
    }

    return { "DIMENSIONS": DIMENSIONS, "GOVERNMENTS": GOVERNMENTS,
        "freshMemory": freshMemory, "measure": measure, "updateMemory": updateMemory };
})();
if (typeof module !== "undefined" && module.exports)
    module.exports = ZionModel;

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
        if (Number.isFinite(value.total))
            return value.total;
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
            "losses": total(stats.unitsLost),
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
        warn("ZION_NATIVE_READY: native Zion victory initialized");
        const pm = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
        for (const playerID of pm.GetActivePlayers())
        {
            for (const civic of TriggerHelper.GetPlayerEntitiesByClass(playerID, "CivCentre"))
            {
                const researcher = Engine.QueryInterface(civic, IID_Researcher);
                const choices = researcher ? researcher.GetTechnologiesList() : [];
                if (choices.some(tech => tech?.pair?.includes("zion_covenant")))
                {
                    warn("ZION_GOVERNANCE_TECH_OK: civic center offers constitutional choices");
                    this.zionTechCheck = true;
                    break;
                }
            }
            if (this.zionTechCheck)
                break;
        }
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
            if (!this.zionFirstTickVerified)
            {
                warn("ZION_SOCIAL_TICK_OK: live welfare evaluation completed");
                this.zionFirstTickVerified = true;
            }
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
            warn("ZION_FIRST_COVENANT_WON: player " + playerID + " fulfilled victory conditions");
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
