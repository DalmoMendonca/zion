// Developer-only native Petra AI activity probe. Never loaded in ordinary matches.
// Tests an AI-controlled opponent with unchanged economy, population, or buildings.
(function()
{
    "use strict";

    const OPPONENT = 2;
    function check(ok, detail)
    {
        if (!ok)
            throw new Error("ZION_AI_OBSERVATION_FAILED: " + detail);
    }

    function counters()
    {
        const stats = QueryPlayerIDInterface(OPPONENT, IID_StatisticsTracker);
        check(!!stats, "No native opponent StatisticsTracker");
        const data = stats.GetStatistics();
        const gathered = data.resourcesGathered || {};
        return {
            "harvest": (gathered.food || 0) + (gathered.wood || 0) +
                (gathered.stone || 0) + (gathered.metal || 0),
            "trained": data.unitsTrained?.total || 0,
            "constructed": data.buildingsConstructed?.total || 0,
            "research": TriggerHelper.GetPlayerEntitiesByClass(OPPONENT, "CivCentre").length
        };
    }

    Trigger.prototype.ZionAIProbeBegin = function()
    {
        check(Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).
            GetActivePlayers().includes(OPPONENT), "No active player 2");
        this.zionAIBaseline = counters();
        warn("ZION_AI_PROBE_STARTED: independent Petra opponent observation underway");
        this.DoAfterDelay(180000, "ZionAIProbeVerify", {});
    };

    Trigger.prototype.ZionAIProbeVerify = function()
    {
        const before = this.zionAIBaseline;
        const now = counters();
        check(now.harvest > before.harvest,
            "AI gathered no real resources in 180 simulated seconds: " +
            before.harvest + " -> " + now.harvest);
        check(now.trained > before.trained || now.constructed > before.constructed,
            "AI neither trained units nor constructed buildings");
        warn("ZION_AI_OPPONENT_ACTIVE: gathered " +
            (now.harvest - before.harvest).toFixed(1) + " resources, trained " +
            (now.trained - before.trained) + ", built " +
            (now.constructed - before.constructed));
    };

    Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).RegisterTrigger(
        "OnInitGame", "ZionAIProbeBegin", { "enabled": true });
})();
