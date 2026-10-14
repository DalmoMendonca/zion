// A03: actual resource gathering and deposit, without crediting test resources.
// This developer-only victory mode starts one owned farm and one worker near a Civic Centre.
(function()
{
    "use strict";
    function check(ok, message)
    {
        if (!ok)
            throw new Error("ZION_GATHER_FAILED: " + message);
    }
    Trigger.prototype.ZionGatherBegin = function()
    {
        const player = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetActivePlayers()[0];
        check(player !== undefined, "No active player");
        const civic = TriggerHelper.GetPlayerEntitiesByClass(player, "CivCentre")[0];
        check(!!civic, "No Civic Centre");
        const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
        const farms = TriggerHelper.SpawnUnits(civic, "structures/" + civ + "/field", 1, player);
        const workers = TriggerHelper.SpawnUnits(civic, "units/" + civ + "/support_female_citizen", 2, player);
        check(farms.length === 1 && workers.length === 2, "Failed to spawn real farms/workers");
        const resource = Engine.QueryInterface(farms[0], IID_ResourceSupply);
        check(!!resource && resource.GetType().generic === "food", "Farm lacks food resource supply");
        const dropsite = Engine.QueryInterface(civic, IID_ResourceDropsite);
        check(!!dropsite && dropsite.AcceptsType("food"), "Civic Centre cannot accept food");
        const startingFood = QueryPlayerIDInterface(player).GetResourceCounts().food;
        for (const worker of workers)
        {
            const gatherer = Engine.QueryInterface(worker, IID_ResourceGatherer);
            const ai = Engine.QueryInterface(worker, IID_UnitAI);
            check(!!gatherer && !!ai && gatherer.CanGather(farms[0]), "Worker cannot gather from real field");
            ai.Gather(farms[0], false, false);
        }
        this.zionGatherTest = { "player": player, "workers": workers, "startingFood": startingFood,
            "sawCarrying": false, "checks": 0 };
        warn("ZION_GATHER_ORDER_OK: two native workers gathering field food");
        this.DoAfterDelay(3000, "ZionGatherObserve", {});
    };
    Trigger.prototype.ZionGatherObserve = function()
    {
        const t = this.zionGatherTest;
        for (const worker of t.workers)
        {
            const gatherer = Engine.QueryInterface(worker, IID_ResourceGatherer);
            if (gatherer && gatherer.GetCarryingStatus().some(c => c.type === "food" && c.amount > 0))
                t.sawCarrying = true;
        }
        const food = QueryPlayerIDInterface(t.player).GetResourceCounts().food;
        if (t.sawCarrying && food > t.startingFood)
        {
            warn("ZION_GATHER_DEPOSIT_VERIFIED: observed carried food and stockpile " +
                t.startingFood + " -> " + food);
            return;
        }
        if (++t.checks >= 30)
            throw new Error("ZION_GATHER_FAILED: food never gathered and deposited; observedCarrying=" +
                t.sawCarrying + ", startingFood=" + t.startingFood + ", finalFood=" + food);
        this.DoAfterDelay(3000, "ZionGatherObserve", {});
    };
    Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).RegisterTrigger(
        "OnInitGame", "ZionGatherBegin", { "enabled": true });
})();
