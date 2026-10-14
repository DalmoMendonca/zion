// Native command-path regression: issue an ordinary UnitAI walk order and verify displacement.
// This is an engine-side movement test; graphical mouse selection requires a separate UI test.
(function()
{
    "use strict";
    function assert(ok, message)
    {
        if (!ok)
            throw new Error("ZION_MOVEMENT_FAILED: " + message);
    }
    Trigger.prototype.ZionMovementBegin = function()
    {
        const players = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetActivePlayers();
        assert(players.length > 0, "No active players");
        const player = players[0];
        let workers = TriggerHelper.GetPlayerEntitiesByClass(player, "Worker");
        if (!workers.length)
        {
            const civic = TriggerHelper.GetPlayerEntitiesByClass(player, "CivCentre")[0];
            assert(!!civic, "No Civic Centre to spawn a worker");
            const civ = QueryPlayerIDInterface(player, IID_Identity).GetCiv();
            workers = TriggerHelper.SpawnUnits(civic, "units/" + civ + "/support_female_citizen", 1, player);
        }
        assert(workers.length > 0, "No worker available");
        const unit = workers[0];
        const position = Engine.QueryInterface(unit, IID_Position);
        const ai = Engine.QueryInterface(unit, IID_UnitAI);
        assert(!!position && position.IsInWorld() && !!ai, "Worker lacks world position or UnitAI");
        const origin = position.GetPosition2D();
        this.zionMovementTest = { "unit": unit, "x": origin.x, "z": origin.y };
        ai.Walk(origin.x + 9, origin.y + 3, false);
        warn("ZION_MOVEMENT_ORDER_OK: native worker walk order issued");
        this.DoAfterDelay(12000, "ZionMovementVerify", {});
    };
    Trigger.prototype.ZionMovementVerify = function()
    {
        const t = this.zionMovementTest;
        const position = Engine.QueryInterface(t.unit, IID_Position);
        assert(!!position && position.IsInWorld(), "Worker disappeared before verification");
        const current = position.GetPosition2D();
        const distance = Math.hypot(current.x - t.x, current.y - t.z);
        assert(distance >= 1, "Worker did not move at least one world unit: " + distance);
        warn("ZION_MOVEMENT_VERIFIED: worker displaced " + distance.toFixed(2) + " world units");
    };
    Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).RegisterTrigger(
        "OnInitGame", "ZionMovementBegin", { "enabled": true });
})();
