// A03: a real attack order must cause measurable enemy damage.
(function()
{
    "use strict";
    function check(ok, message)
    {
        if (!ok)
            throw new Error("ZION_COMBAT_FAILED: " + message);
    }
    Trigger.prototype.ZionCombatBegin = function()
    {
        const players = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager).GetActivePlayers().slice(0, 2);
        check(players.length === 2, "Two opposing players required");
        const enemyCivic = TriggerHelper.GetPlayerEntitiesByClass(players[1], "CivCentre")[0];
        check(!!enemyCivic, "Defending player has no Civic Centre");
        // Stable canonical Athenian templates are intentionally used for the test on all maps.
        const targets = TriggerHelper.SpawnUnits(enemyCivic,
            "units/athen/support_female_citizen", 1, players[1]);
        const soldiers = TriggerHelper.SpawnUnits(enemyCivic,
            "units/athen/infantry_spearman_b", 4, players[0]);
        check(targets.length === 1 && soldiers.length === 4, "Could not spawn opposing combat units");
        const health = Engine.QueryInterface(targets[0], IID_Health);
        check(!!health, "Target has no health");
        const initialHP = health.GetHitpoints();
        for (const soldier of soldiers)
        {
            const ai = Engine.QueryInterface(soldier, IID_UnitAI);
            const attack = Engine.QueryInterface(soldier, IID_Attack);
            check(!!ai && !!attack && ai.CanAttack(targets[0]), "Soldier cannot attack enemy worker");
            ai.Attack(targets[0], false, false, false);
        }
        this.zionCombat = { "target": targets[0], "initialHP": initialHP, "checks": 0 };
        warn("ZION_COMBAT_ORDER_OK: four native infantry assigned enemy attack order");
        this.DoAfterDelay(3000, "ZionCombatCheck", {});
    };
    Trigger.prototype.ZionCombatCheck = function()
    {
        const t = this.zionCombat;
        const health = Engine.QueryInterface(t.target, IID_Health);
        const remaining = health ? health.GetHitpoints() : 0;
        if (remaining < t.initialHP)
        {
            warn("ZION_COMBAT_DAMAGE_VERIFIED: enemy worker HP " + t.initialHP +
                " -> " + remaining);
            return;
        }
        if (++t.checks >= 22)
            throw new Error("ZION_COMBAT_FAILED: attacked enemy never lost health");
        this.DoAfterDelay(3000, "ZionCombatCheck", {});
    };
    Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger).RegisterTrigger(
        "OnInitGame", "ZionCombatBegin", { "enabled": true });
})();
