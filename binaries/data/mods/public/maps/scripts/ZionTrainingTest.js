// Native production queue regression: train a worker and verify actual population growth.
(function()
{
    "use strict";
    function check(ok, message)
    {
        if (!ok)
            throw new Error("ZION_TRAINING_FAILED: " + message);
    }
    Trigger.prototype.ZionTrainingBegin = function()
    {
        const player = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetActivePlayers()[0];
        check(player !== undefined, "No active player");
        const civic = TriggerHelper.GetPlayerEntitiesByClass(player, "CivCentre")[0];
        check(!!civic, "No civic center");
        const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
        const template = "units/" + civ + "/support_female_citizen";
        const queue = Engine.QueryInterface(civic, IID_ProductionQueue);
        check(!!queue, "Civic center has no production queue");
        QueryPlayerIDInterface(player).AddResources({ "food": 1000, "wood": 1000 });
        const before = TriggerHelper.GetPlayerEntitiesByClass(player, "Worker").length;
        check(queue.AddItem(template, "unit", 1, undefined), "Production queue rejected worker");
        this.zionTrainingTest = { "player": player, "before": before };
        warn("ZION_TRAINING_QUEUED: ordinary native production queue accepted worker");
        this.DoAfterDelay(30000, "ZionTrainingVerify", {});
    };
    Trigger.prototype.ZionTrainingVerify = function()
    {
        const test = this.zionTrainingTest;
        const after = TriggerHelper.GetPlayerEntitiesByClass(test.player, "Worker").length;
        check(after > test.before, "No new worker spawned: before " + test.before + ", after " + after);
        warn("ZION_TRAINING_VERIFIED: worker count " + test.before + " -> " + after);
    };
    Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).RegisterTrigger(
        "OnInitGame", "ZionTrainingBegin", { "enabled": true });
})();
