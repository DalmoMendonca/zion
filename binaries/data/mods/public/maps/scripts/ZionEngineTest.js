// Zion A.D. native-engine integration exercise.
// Loaded only when the developer selects the zion_e2e victory condition.
// It intentionally accelerates map setup; normal games are never affected.
(function()
{
    "use strict";

    const paths = [
        { "first": "zion_covenant", "second": "zion_commons",
          "third": "zion_concord", "firstDelta": 3 },
        { "first": "zion_magistracy", "second": "zion_guilds",
          "third": "zion_stewardship", "firstDelta": -1 }
    ];

    function check(condition, message)
    {
        if (!condition)
            throw new Error("ZION_E2E_FAILED: " + message);
    }

    function tech(playerID)
    {
        return QueryPlayerIDInterface(playerID, IID_TechnologyManager);
    }

    function civic(playerID)
    {
        const entities = TriggerHelper.GetPlayerEntitiesByClass(playerID, "CivCentre");
        check(entities.length > 0, "Player " + playerID + " lacks Civic Centre");
        return entities[0];
    }

    function population(house)
    {
        return Engine.QueryInterface(house, IID_Population).GetPopBonus();
    }

    function queue(civicID, name)
    {
        const cmpResearcher = Engine.QueryInterface(civicID, IID_Researcher);
        check(!!cmpResearcher, "Civic Centre has no Researcher component");
        const id = cmpResearcher.QueueTechnology(name);
        check(id !== -1, "Research queue rejected " + name);
    }

    Trigger.prototype.ZionE2EBegin = function()
    {
        const pm = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
        const players = pm.GetActivePlayers().slice(0, 2);
        check(players.length === 2, "Need two active players for two strategies");
        this.zionTestPlayers = [];

        for (let i = 0; i < players.length; ++i)
        {
            const playerID = players[i];
            const civicID = civic(playerID);
            const cmpIdentity = QueryPlayerIDInterface(playerID, IID_Identity);
            const civ = cmpIdentity.GetCiv();
            const scheme = paths[i];
            // Establish real owned structures using the engine's spawning APIs.
            const counts = { "house": 12, "field": 7, "market": 3, "temple": 2 };
            let firstHouse;
            for (const structure in counts)
            {
                const spawned = TriggerHelper.SpawnUnits(
                    civicID, "structures/" + civ + "/" + structure, counts[structure], playerID);
                check(spawned.length === counts[structure],
                    "Could not create " + structure + " structures for " + civ);
                if (structure === "house")
                    firstHouse = spawned[0];
            }

            QueryPlayerIDInterface(playerID).AddResources({
                "food": 2000, "wood": 2000, "stone": 1000, "metal": 1000
            });
            const startingBonus = population(firstHouse);
            queue(civicID, scheme.first);
            this.zionTestPlayers.push({
                "id": playerID, "civic": civicID,
                "house": firstHouse, "bonus": startingBonus,
                "choice": i
            });
        }

        warn("ZION_E2E_QUEUED: real Civic Centre research for both pathways");
        this.DoAfterDelay(35000, "ZionE2EStageOne", {});
    };

    Trigger.prototype.ZionE2EStageOne = function()
    {
        for (const p of this.zionTestPlayers)
        {
            const path = paths[p.choice];
            check(tech(p.id).IsTechnologyResearched(path.first),
                path.first + " did not complete through Researcher queue");
            const delta = population(p.house) - p.bonus;
            check(delta === path.firstDelta,
                path.first + " changed population by " + delta +
                " instead of " + path.firstDelta);
            // Introduce native town phase as scenario setup, then use an
            // ordinary research queue for the institution decision.
            tech(p.id).ResearchTechnology("phase_town_generic");
            check(tech(p.id).IsTechnologyResearched("phase_town_generic"),
                "Town phase could not be established");
            queue(p.civic, path.second);
        }

        warn("ZION_E2E_FIRST_RESEARCH_OK: both political effects applied to houses");
        this.DoAfterDelay(40000, "ZionE2EStageTwo", {});
    };

    Trigger.prototype.ZionE2EStageTwo = function()
    {
        for (const p of this.zionTestPlayers)
        {
            const path = paths[p.choice];
            check(tech(p.id).IsTechnologyResearched(path.second),
                path.second + " did not complete via research queue");
            tech(p.id).ResearchTechnology("phase_city_generic");
            check(tech(p.id).IsTechnologyResearched("phase_city_generic"),
                "City phase could not be established");
            queue(p.civic, path.third);
        }

        warn("ZION_E2E_TOWN_OK: two legitimate second-stage paths researched");
        this.DoAfterDelay(45000, "ZionE2EStageThree", {});
    };

    Trigger.prototype.ZionE2EStageThree = function()
    {
        for (const p of this.zionTestPlayers)
        {
            const path = paths[p.choice];
            check(tech(p.id).IsTechnologyResearched(path.third),
                path.third + " did not finish research");
            check(this.zionLatestReports?.[p.id],
                "Zion societal report missing for player " + p.id);
            const report = this.zionLatestReports[p.id];
            check(report.ageName === "Renewing civilization",
                "No third-age progression for player " + p.id);
            check(report.floor >= 42,
                "Welfare floor below threshold for path " + p.choice +
                ": " + report.floor);
            warn("ZION_E2E_PATH_" + (p.choice + 1) + "_OK: civic stages researched, " +
                "societal score " + report.score + " and floor " + report.floor);
        }
        warn("ZION_E2E_BOTH_PATHS_OK: two institutional strategies reach final age");
    };

    const trigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);
    trigger.RegisterTrigger("OnInitGame", "ZionE2EBegin", { "enabled": true });
})();
