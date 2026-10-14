// Developer-only adversarial M1 regression: real native food removal and
// scripted lethal combat damage must stop two otherwise winning societies.
// This is a stress fixture, not proof of ordinary AI combat or a user-paced game.
(function()
{
    "use strict";

    function check(value, message)
    {
        if (!value)
            throw new Error("ZION_ADVERSARIAL_FAILED: " + message);
    }

    const originalStageThree = Trigger.prototype.ZionE2EStageThree;
    Trigger.prototype.ZionE2EStageThree = function()
    {
        // First verify both civic chains still completed via real research queues.
        originalStageThree.call(this);
        const players = this.zionTestPlayers;
        check(players && players.length === 2, "Expected both player pathways");
        this.zionAdversarialBaseline = {};

        for (const p of players)
        {
            const baseline = this.zionLatestReports[p.id];
            check(baseline && baseline.ageName === "Renewing civilization",
                "Civic progression was not ready for adversarial test");
            this.zionAdversarialBaseline[p.id] = {
                "provision": baseline.dimensions.provision,
                "communion": baseline.dimensions.communion
            };

            // Destroy real, owned fields and empty the real Player food ledger.
            const cmpPlayer = QueryPlayerIDInterface(p.id);
            const food = cmpPlayer.GetResourceCounts().food || 0;
            if (food > 0)
                check(cmpPlayer.TrySubtractResources({ "food": food }),
                    "Cannot remove food stockpile");
            const fields = TriggerHelper.GetPlayerEntitiesByClass(p.id, "Field");
            check(fields.length >= 3, "Expected actual food infrastructure");
            for (const field of fields)
                Engine.DestroyEntity(field);
            // Real Health.TakeDamage invokes casualty accounting for both
            // sides. Battle is scripted to be deterministic; no fake welfare
            // observations are handed to the social model.
            const civ = QueryPlayerIDInterface(p.id, IID_Identity).GetCiv();
            const victims = TriggerHelper.SpawnUnits(
                p.civic, "units/" + civ + "/support_female_citizen", 24, p.id);
            check(victims.length === 24, "Could not spawn combat casualties");
            const enemy = players.find(other => other.id !== p.id);
            for (const victim of victims)
            {
                const health = Engine.QueryInterface(victim, IID_Health);
                check(health && health.GetHitpoints() > 0,
                    "Victim lacks live native health component");
                health.TakeDamage(health.GetHitpoints() + 1, enemy.civic, enemy.id);
            }
        }

        // Feed the real statistics tracker once, not on every social tick.
        // The old model incorrectly granted lifelong communion for this
        // accumulated historical counter.
        const donor = QueryPlayerIDInterface(players[0].id, IID_StatisticsTracker);
        donor.IncreaseTributesSentCounter(30000);

        for (const p of players)
        {
            const stats = QueryPlayerIDInterface(p.id, IID_StatisticsTracker).GetStatistics();
            check(stats.unitsLost.Unit >= 24 && stats.enemyUnitsKilled.Unit >= 24,
                "Damage did not reach native Unit casualty counters: lost " +
                stats.unitsLost.Unit + ", killed " + stats.enemyUnitsKilled.Unit);
        }
        warn("ZION_ADVERSARIAL_NATIVE_BATTLE_OK: casualties accounted by Health and StatisticsTracker");
        warn("ZION_ADVERSARIAL_FAMINE_STARTED: fields removed and stockpiles emptied");
        this.DoAfterDelay(55000, "ZionAdversarialVerify", {});
    };

    Trigger.prototype.ZionAdversarialVerify = function()
    {
        check(!this.zionResolved, "Famine or casualties allowed an immediate victory");
        for (const p of this.zionTestPlayers)
        {
            const report = this.zionLatestReports[p.id];
            const before = this.zionAdversarialBaseline[p.id];
            check(!!report, "No actual engine society report after adversity");
            check(report.eligible === false && report.sustained === 0,
                "Civic victory streak survived hunger and casualties for player " + p.id);
            check(report.dimensions.provision < before.provision,
                "Food destruction did not reduce native provision score");
            check(report.dimensions.communion < before.communion,
                "Real battle did not lower social communion");
            check(report.warStrain >= 18,
                "Native battle casualties did not accumulate trauma");
            check(TriggerHelper.GetPlayerEntitiesByClass(p.id, "Field").length === 0,
                "Food fields unexpectedly returned");
            warn("ZION_ADVERSARIAL_PLAYER_" + p.id +
                "_REJECTED: food and war suffering prevent a civic victory");
        }
        warn("ZION_ADVERSARIAL_NEGATIVE_OK: no winner after two real welfare evaluations");
    };
})();
