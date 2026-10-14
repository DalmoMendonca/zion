// A03: build an ordinary house using the engine's production construction path.
(function()
{
    "use strict";
    function check(value, message)
    {
        if (!value)
            throw new Error("ZION_CONSTRUCTION_FAILED: " + message);
    }
    Trigger.prototype.ZionConstructionBegin = function()
    {
        const player = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetActivePlayers()[0];
        const civic = TriggerHelper.GetPlayerEntitiesByClass(player, "CivCentre")[0];
        check(!!civic, "No owned Civic Centre");
        const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
        const builders = TriggerHelper.SpawnUnits(civic, "units/" + civ + "/support_female_citizen", 7, player);
        check(builders.length === 7 && builders.every(ent => !!Engine.QueryInterface(ent, IID_Builder)),
            "Cannot spawn real construction workers");
        QueryPlayerIDInterface(player).AddResources({ "food": 500, "wood": 1000 });
        const point = Engine.QueryInterface(civic, IID_Position).GetPosition2D();
        const housesBefore = TriggerHelper.GetPlayerEntitiesByClass(player, "House").length;
        let foundation;
        for (const radius of [24, 30, 36, 44, 52])
        {
            for (let angle = 0; angle < 12 && !foundation; ++angle)
            {
                const prior = new Set(TriggerHelper.GetEntitiesByPlayer(player));
                const radians = angle * Math.PI / 6;
                // Victory scripts run in an isolated context: use the engine's
                // supported command dispatcher, not the private helper function.
                ProcessCommand(player, {
                    "type": "construct", "entities": builders,
                    "template": "structures/" + civ + "/house",
                    "x": point.x + radius * Math.cos(radians),
                    "z": point.y + radius * Math.sin(radians),
                    "angle": 0, "autorepair": true, "autocontinue": false, "queued": false
                });
                foundation = TriggerHelper.GetEntitiesByPlayer(player).find(ent =>
                    !prior.has(ent) && !!Engine.QueryInterface(ent, IID_Foundation) &&
                    Engine.QueryInterface(ent, IID_Position)?.IsInWorld());
            }
            if (foundation)
                break;
        }
        check(!!foundation && !!Engine.QueryInterface(foundation, IID_Foundation),
            "Could not place a native house foundation at any candidate site");
        this.zionConstruction = { "player": player, "housesBefore": housesBefore,
            "foundation": foundation, "checks": 0, "sawProgress": false };
        warn("ZION_CONSTRUCTION_PLACED: native building command spent resources and created foundation");
        this.DoAfterDelay(4000, "ZionConstructionCheck", {});
    };
    Trigger.prototype.ZionConstructionCheck = function()
    {
        const t = this.zionConstruction;
        const foundation = Engine.QueryInterface(t.foundation, IID_Foundation);
        if (foundation && foundation.GetBuildProgress() > 0)
            t.sawProgress = true;
        const houseCount = TriggerHelper.GetPlayerEntitiesByClass(t.player, "House").length;
        if (houseCount > t.housesBefore)
        {
            check(t.sawProgress, "Building appeared without observed worker construction progress");
            warn("ZION_CONSTRUCTION_VERIFIED: foundation was worked on and house completed, " +
                t.housesBefore + " -> " + houseCount);
            return;
        }
        if (++t.checks >= 35)
            throw new Error("ZION_CONSTRUCTION_FAILED: foundation did not become a house; progress=" +
                (foundation ? foundation.GetBuildProgress() : "no foundation"));
        this.DoAfterDelay(4000, "ZionConstructionCheck", {});
    };
    Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).RegisterTrigger(
        "OnInitGame", "ZionConstructionBegin", { "enabled": true });
})();
