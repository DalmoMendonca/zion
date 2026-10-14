// Developer-only second native victory match. Production victory rules are unchanged.
(function()
{
    "use strict";
    const originalStageThree = Trigger.prototype.ZionE2EStageThree;
    Trigger.prototype.ZionE2EStageThree = function()
    {
        originalStageThree.call(this);
        const [first, second] = this.zionTestPlayers;
        if (!first || !second)
            throw new Error("ZION_E2E_ALT_FAILED: both routes required");
        const player = QueryPlayerIDInterface(first.id);
        const food = player.GetResourceCounts().food || 0;
        if (food > 0 && !player.TrySubtractResources({ "food": food }))
            throw new Error("ZION_E2E_ALT_FAILED: resource subtraction failed");
        for (const field of TriggerHelper.GetPlayerEntitiesByClass(first.id, "Field"))
            Engine.DestroyEntity(field);
        warn("ZION_E2E_ALT_CONTROL_OK: first society lost food security; second society must achieve independent victory");
    };
})();
