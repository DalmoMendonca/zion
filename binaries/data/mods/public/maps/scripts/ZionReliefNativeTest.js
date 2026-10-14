// Developer-only real Pyrogenesis test for player-funded postwar reconstruction.
// Never included in the normal First Covenant match mode.
(function()
{
    "use strict";
    function check(condition, description)
    {
        if (!condition)
            throw new Error("ZION_RELIEF_NATIVE_FAILED: " + description);
    }

    const priorStageThree = Trigger.prototype.ZionE2EStageThree;
    Trigger.prototype.ZionE2EStageThree = function()
    {
        priorStageThree.call(this);
        const players = this.zionTestPlayers;
        check(players && players.length === 2, "Need two independently researched civic paths");
        const [recovering, rival] = players;
        this.zionReliefRecoveringPlayer = recovering.id;
        this.zionReliefRivalPlayer = rival.id;

        // Research consumes real stockpiles via native ProductionQueue. Enqueue
        // while those resources still exist, before inducing artificial famine.
        const production = Engine.QueryInterface(recovering.civic, IID_ProductionQueue);
        check(production && production.AddItem("zion_relief", "technology", 1, undefined),
            "Paid Civic Relief research was rejected");
        for (const p of players)
        {
            const fields = TriggerHelper.GetPlayerEntitiesByClass(p.id, "Field");
            check(fields.length >= 3, "No initial food infrastructure");
            for (const field of fields)
                Engine.DestroyEntity(field);
            const cmpPlayer = QueryPlayerIDInterface(p.id);
            const food = cmpPlayer.GetResourceCounts().food || 0;
            if (food)
                check(cmpPlayer.TrySubtractResources({ "food": food }),
                    "Famine failed to remove actual food stockpile");
        }
        // Real Health.TakeDamage records individual casualties through the
        // original unit system and real player StatisticsTracker.
        const civ = QueryPlayerIDInterface(recovering.id, IID_Identity).GetCiv();
        const victims = TriggerHelper.SpawnUnits(recovering.civic,
            "units/" + civ + "/support_female_citizen", 24, recovering.id);
        check(victims.length === 24, "Could not spawn casualty cohort");
        for (const victim of victims)
        {
            const health = Engine.QueryInterface(victim, IID_Health);
            check(health && health.GetHitpoints() > 0, "Native victim lacks Health");
            health.TakeDamage(health.GetHitpoints() + 1, rival.civic, rival.id);
        }
        const stats = QueryPlayerIDInterface(recovering.id, IID_StatisticsTracker).GetStatistics();
        check(stats.unitsLost.Unit >= 24, "Combat casualties bypassed native statistics");
        check(!this.zionResolved, "Society won before crisis");
        warn("ZION_RELIEF_NATIVE_CRISIS_OK: 24 real casualties, famine, paid relief queued");
        this.DoAfterDelay(65000, "ZionReliefRestoreFood", {});
    };

    const priorResearch = Trigger.prototype.ZionResearchFinished;
    Trigger.prototype.ZionResearchFinished = function(data)
    {
        const before = data && this.zionSocieties?.[data.player]?.trauma;
        priorResearch.call(this, data);
        if (!data || data.tech !== "zion_relief")
            return;
        check(data.player === this.zionReliefRecoveringPlayer,
            "Civic Relief attributed to wrong player");
        check(before >= 12, "No pre-existing battle trauma when relief finished");
        const after = this.zionSocieties[data.player];
        check(after && after.reliefApplied, "Native research failed to trigger relief");
        check(Math.abs(before - after.trauma - 12) < 0.001,
            "Research did not reduce stored trauma by twelve");
        this.zionReliefResearchVerified = true;
        warn("ZION_RELIEF_NATIVE_RESEARCH_OK: paid native research improved live societal memory");
    };

    Trigger.prototype.ZionReliefRestoreFood = function()
    {
        check(this.zionReliefResearchVerified, "Relief was not researched via ProductionQueue");
        check(!this.zionResolved, "Famine did not prevent victory");
        const p = this.zionTestPlayers[0];
        const civ = QueryPlayerIDInterface(p.id, IID_Identity).GetCiv();
        const fields = TriggerHelper.SpawnUnits(p.civic,
            "structures/" + civ + "/field", 7, p.id);
        check(fields.length === 7, "Could not restore real fields");
        QueryPlayerIDInterface(p.id).AddResources({ "food": 800 });
        check(TriggerHelper.GetPlayerEntitiesByClass(p.id, "Field").length >= 3,
            "Food security was not reestablished");
        this.zionReliefFoodRestored = true;
        warn("ZION_RELIEF_NATIVE_FOOD_RESTORED: native buildings and food returned");
    };

    // The match may terminate immediately upon native victory. Assert
    // synchronously when that victory occurs, never in a canceled timer.
    const priorEvaluate = Trigger.prototype.ZionEvaluate;
    Trigger.prototype.ZionEvaluate = function()
    {
        priorEvaluate.call(this);
        if (this.zionResolved && !this.zionReliefRecoveryVerified)
            this.ZionReliefVerifyRecovery();
    };
    Trigger.prototype.ZionReliefVerifyRecovery = function()
    {
        check(this.zionReliefResearchVerified && this.zionReliefFoodRestored,
            "Winning society did not first pay for relief and reconstruct");
        const winner = this.zionLatestReports[this.zionReliefRecoveringPlayer];
        const rival = this.zionLatestReports[this.zionReliefRivalPlayer];
        check(winner && winner.eligible && winner.sustained >= 3,
            "Recovered community did not meet persistent civic victory requirement");
        check(rival && !rival.eligible && rival.sustained === 0,
            "Still-starving rival falsely qualified");
        this.zionReliefRecoveryVerified = true;
        warn("ZION_RELIEF_NATIVE_RECOVERY_OK: crisis, real relief and recovery to victory");
    };
})();
