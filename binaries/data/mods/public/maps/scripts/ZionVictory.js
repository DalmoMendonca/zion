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
        return { "trauma": 0, "trust": 0, "lastKills": 0, "lastLosses": 0,
            "lastTributes": 0, "lastTrade": 0, "tradeActivity": 0,
            "lastFoodGathered": 0, "recentFoodGathered": 0,
            "stableChecks": 0 };
    }

    function measure(o, memory)
    {
        const has = id => !!(o.techs && o.techs[id]);
        const m = memory || freshMemory();
        const s = {};
        s.provision = 20 + Math.min(25, amount(o.food) / 50) +
            Math.min(24, amount(o.farms) * 6) + Math.min(12, amount(o.houses));
        // Living prosperity follows recent real exchanges, not lifetime trade.
        s.prosperity = 25 + Math.min(18, amount(m.tradeActivity) / 60) +
            amount(o.markets) * 12 + amount(o.civics) * 5 +
            Math.min(15, amount(o.metal) / 75);
        s.dignity = 28 + Math.min(24, amount(o.houses) * 3) + amount(o.temples) * 8 +
            amount(o.healers) * 9 + (has("zion_covenant") ? 5 : 0) +
            (has("zion_commons") ? 4 : 0);
        s.freedom = 28 + Math.min(18, amount(o.houses) * 2) + amount(o.markets) * 10 +
            amount(o.civics) * 6 - amount(o.fortresses) * 6 +
            (has("zion_magistracy") ? 3 : 0) + (has("zion_guilds") ? 3 : 0);
        s.wisdom = 30 + amount(o.temples) * 14 + amount(o.healers) * 8 +
            amount(o.civics) * 5 + (has("zion_concord") ? 7 : 0) +
            (has("zion_stewardship") ? 5 : 0);
        // Lifetime diplomatic and military totals are observations, not permanent
        // welfare modifiers. Their effects enter through the recoverable trust
        // and trauma memories below; they must not be rewarded every tick.
        s.communion = 31 + Math.min(17, amount(o.houses) * 1.7) + amount(o.temples) * 9 +
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
        const age = final && second && first && has("phase_city") && has("phase_town") ? 3 :
            second && first && has("phase_town") ? 2 : first ? 1 : 0;
        const names = ["Founding settlement", "Community covenant",
            "Institutional township", "Renewing civilization"];
        const quadrants = [
            Math.round((s.wisdom + s.dignity) / 2),
            Math.round((s.provision + s.resilience) / 2),
            Math.round((s.communion + s.freedom) / 2),
            Math.round((s.prosperity + s.ecology) / 2)
        ];
        // A demanding but attainable early-game objective; NOT the 2,000-year endgame.
        // An actual food-producing community is required; reserves and housing alone cannot win.
        const foodSecure = amount(o.food) >= 100 && amount(o.farms) >= 3;
        const eligible = age === 3 && foodSecure && mean >= 59 && floor >= 42 &&
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
        // Only harvests since the previous simulation sample count.
        // A cumulative statistics counter must never generate repeat income.
        const foodGathered = amount(observation.foodGathered);
        next.recentFoodGathered = Math.max(0, foodGathered - next.lastFoodGathered);
        next.lastFoodGathered = foodGathered;
        const trade = amount(observation.trade);
        // Legacy serialized games have no trade counter baseline. Seed it
        // without treating the entire historical total as a new transaction.
        const hasBaseline = memory &&
            Object.prototype.hasOwnProperty.call(memory, "lastTrade");
        const lastTrade = hasBaseline ? amount(memory.lastTrade) : trade;
        const newTrade = Math.max(0, trade - lastTrade);
        next.tradeActivity = Math.min(1200,
            amount(next.tradeActivity) * 0.65 + newTrade);
        next.lastTrade = trade;
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
    const allTechs = POLICY_IDS.concat(PHASES, ["zion_relief"]);

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
            // The engine's StatisticsTracker increments the Unit class counters,
            // not the initialized-but-unmaintained .total fields.
            "kills": total(stats.enemyUnitsKilled && stats.enemyUnitsKilled.Unit),
            "losses": total(stats.unitsLost && stats.unitsLost.Unit),
            "woodGathered": total(stats.resourcesGathered && stats.resourcesGathered.wood),
            "foodGathered": total(stats.resourcesGathered && stats.resourcesGathered.food),
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
        if (this.zionResolved || !data)
            return;
        if (data.tech === "zion_relief")
        {
            // Research has already charged food, wood, stone and research
            // time via the real ProductionQueue. Its social effect is a
            // single, player-chosen event, not a recurring free welfare gain.
            if (!this.zionSocieties || data.player === undefined)
                return;
            const memory = this.zionSocieties[data.player] ||
                ZionModel.freshMemory();
            if (memory.reliefApplied)
                return;
            memory.reliefApplied = true;
            const recovered = Math.min(12, memory.trauma);
            memory.trauma = Math.max(0, memory.trauma - recovered);
            memory.trust = Math.min(30, memory.trust + 3);
            this.zionSocieties[data.player] = memory;
            notify([data.player], "CIVIC RELIEF | Reconstruction funded. War strain -" +
                Math.round(recovered) + "; trust strengthened. Lasting healing still requires peace and provision.");
            return;
        }
        if (POLICY_IDS.indexOf(data.tech) === -1)
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
            // Track changes between completed native simulation evaluations.
            // The report is cached on Trigger for deterministic save/rejoin;
            // reading the HUD must never mutate this state.
            const previous = this.zionLatestReports[playerID];
            const changes = {};
            for (const dimension of ZionModel.DIMENSIONS)
                changes[dimension] = previous && previous.dimensions &&
                    previous.dimensions[dimension] !== undefined ?
                    result.dimensions[dimension] - previous.dimensions[dimension] : 0;
            memory.stableChecks = result.eligible ? memory.stableChecks + 1 : 0;
            this.zionSocieties[playerID] = memory;
            // Expose a concrete path from the current bottleneck to progress.
            const weakest = ZionModel.DIMENSIONS.reduce((low, key) =>
                result.dimensions[key] < result.dimensions[low] ? key : low);
            const remedies = {
                "provision": "Gather food and build productive fields",
                "prosperity": "Trade, build markets and produce metal",
                "dignity": "Build housing, temples and train healers",
                "freedom": "Build housing and markets; limit forts",
                "wisdom": "Support temples, healers and civic centers",
                "communion": "Rebuild trust and support community life",
                "ecology": "Protect forests and maintain fields",
                "resilience": "Secure food, defenses and civic centers"
            };
            // Native research prerequisites, not a prescribed ideology.
            const has = id => observation.techs[id];
            const first = has("zion_covenant") || has("zion_magistracy");
            const second = has("zion_commons") || has("zion_guilds");
            const third = has("zion_concord") || has("zion_stewardship");
            const civicPath = [
                has("zion_covenant") ? "Council" :
                    has("zion_magistracy") ? "Magistracy" : "Undecided",
                has("zion_commons") ? "Assembly" :
                    has("zion_guilds") ? "Guilds" : "Undecided",
                has("zion_concord") ? "Concord" :
                    has("zion_stewardship") ? "Stewardship" : "Undecided"
            ].join(" > ");
            let nextStep;
            if (!first)
                nextStep = "Choose Council or Magistracy at Civic Center";
            else if (!has("phase_town"))
                nextStep = "Advance to Town Phase at Civic Center";
            else if (!second && observation.houses < 5 && observation.markets < 1)
                nextStep = "Build 5 houses (" + observation.houses +
                    "/5) or 1 market for next civic choice";
            else if (!second)
                nextStep = observation.houses >= 5 && observation.markets >= 1 ?
                    "Choose Assembly or Guilds at Civic Center" :
                    observation.houses >= 5 ?
                        "Choose Common Assembly at Civic Center" :
                        "Choose Guild Republic at Civic Center";
            else if (!has("phase_city"))
                nextStep = "Advance to City Phase at Civic Center";
            else if (!third && observation.temples < 1 && observation.farms < 3)
                nextStep = "Build 1 temple or 3 fields (" + observation.farms +
                    "/3) for final civic choice";
            else if (!third)
                nextStep = observation.temples >= 1 && observation.farms >= 3 ?
                    "Choose Concord or Stewardship at Civic Center" :
                    observation.temples >= 1 ?
                        "Choose Concord at Civic Center" :
                        "Choose Stewardship at Civic Center";
            else if (observation.farms < 3)
                nextStep = "Build food fields (" + observation.farms + "/3)";
            else if (observation.food < 100)
                nextStep = "Gather at least 100 food";
            else if (result.floor < 42 || result.mean < 59 ||
                result.quadrants.some(value => value < 51))
                nextStep = remedies[weakest];
            else
                nextStep = "Maintain flourishing until covenant completion";
            this.zionLatestReports[playerID] = {
                "score": result.score,
                "mean": result.mean,
                "eligible": result.eligible,
                "nextStep": nextStep,
                "civicPath": civicPath,
                "recoveryAction": memory.trauma >= 12 && !has("zion_relief") &&
                    has("phase_town") ?
                    "Research Civic Relief at Civic Center" :
                    memory.trauma >= 12 ?
                    "Rebuild food security and avoid further casualties" : "",
                "reliefApplied": !!memory.reliefApplied,
                "floor": result.floor,
                "weakest": weakest,
                "ageName": result.ageName,
                "dimensions": result.dimensions,
                "changes": changes,
                "quadrants": result.quadrants,
                "trust": Math.round(memory.trust),
                "warStrain": Math.round(memory.trauma),
                "recentTrade": Math.round(memory.tradeActivity),
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
                observation.farms >= 3 && memory.recentFoodGathered >= 25)
                cmpPlayer.AddResource("food",
                    Math.min(10, Math.floor(memory.recentFoodGathered / 25)));
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
