// Zion A.D. - native RTS societal model. GPL-2.0-or-later.
// This is a heuristic game system, not a measure of real cultures or persons.
var ZionModel = (function()
{
    "use strict";

    const DIMENSIONS = ["provision", "prosperity", "dignity", "freedom",
        "wisdom", "communion", "ecology", "resilience"];
    const GOVERNMENTS = {
        "zion_covenant": "Covenant Council",
        "zion_magistracy": "Chartered Magistracy",
        "zion_commons": "Common Assembly",
        "zion_guilds": "Guild Republic",
        "zion_concord": "Covenant of Concord",
        "zion_stewardship": "Covenant of Stewardship"
    };
    const clamp = (value, low = 0, high = 100) => Math.max(low, Math.min(high, value));
    const amount = (value) => Number.isFinite(value) ? Math.max(0, value) : 0;

    function freshMemory()
    {
        return { "trauma": 0, "trust": 0, "lastKills": 0, "lastLosses": 0, "lastTributes": 0, "stableChecks": 0 };
    }

    function measure(o, memory)
    {
        const has = id => !!(o.techs && o.techs[id]);
        const m = memory || freshMemory();
        const s = {};
        s.provision = 20 + Math.min(25, amount(o.food) / 50) +
            Math.min(24, amount(o.farms) * 6) + Math.min(12, amount(o.houses));
        s.prosperity = 25 + Math.min(18, amount(o.trade) / 60) +
            amount(o.markets) * 12 + amount(o.civics) * 5 +
            Math.min(15, amount(o.metal) / 75);
        s.dignity = 28 + Math.min(24, amount(o.houses) * 3) + amount(o.temples) * 8 +
            amount(o.healers) * 9 + (has("zion_covenant") ? 5 : 0) +
            (has("zion_commons") ? 4 : 0);
        s.freedom = 28 + Math.min(18, amount(o.houses) * 2) + amount(o.markets) * 10 +
            amount(o.civics) * 6 - amount(o.fortresses) * 6 +
            (has("zion_magistracy") ? 3 : 0) + (has("zion_guilds") ? 3 : 0);
        s.wisdom = 30 + amount(o.temples) * 14 + amount(o.healers) * 8 +
            amount(o.civics) * 5 + (has("zion_concord") ? 7 : 0) +
            (has("zion_stewardship") ? 5 : 0);
        s.communion = 31 + Math.min(17, amount(o.houses) * 1.7) + amount(o.temples) * 9 +
            Math.min(18, amount(o.tributes) / 70) -
            Math.min(25, amount(o.kills) * 0.4) +
            (has("zion_covenant") ? 8 : 0) + (has("zion_commons") ? 5 : 0) -
            (has("zion_guilds") ? 2 : 0);
        s.ecology = 79 - Math.min(38, amount(o.woodGathered) / 125) +
            amount(o.farms) * 2 + (has("zion_stewardship") ? 8 : 0);
        s.resilience = 30 + amount(o.civics) * 9 + amount(o.towers) * 6 +
            amount(o.farms) * 2 + Math.min(13, amount(o.food) / 180) +
            (has("zion_magistracy") ? 6 : 0) +
            (has("zion_concord") ? 6 : 0);

        s.dignity -= m.trauma * 0.35;
        s.communion += m.trust * 0.8 - m.trauma * 0.55;
        s.resilience += m.trust * 0.3 - m.trauma * 0.25;

        for (const key of DIMENSIONS)
            s[key] = Math.round(clamp(s[key]));

        const values = DIMENSIONS.map(key => s[key]);
        const mean = values.reduce((total, value) => total + value, 0) / values.length;
        const floor = Math.min(...values);
        const score = Math.round(mean * 0.78 + floor * 0.22);
        const first = has("zion_covenant") || has("zion_magistracy");
        const second = has("zion_commons") || has("zion_guilds");
        const final = has("zion_concord") || has("zion_stewardship");
        const age = final && has("phase_city") ? 3 :
            second && has("phase_town") ? 2 : first ? 1 : 0;
        const names = ["Founding settlement", "Community covenant",
            "Institutional township", "Renewing civilization"];
        const quadrants = [
            Math.round((s.wisdom + s.dignity) / 2),
            Math.round((s.provision + s.resilience) / 2),
            Math.round((s.communion + s.freedom) / 2),
            Math.round((s.prosperity + s.ecology) / 2)
        ];
        // A demanding but attainable early-game objective; NOT the 2,000-year endgame.
        // An actual food-producing community is required; reserves and housing alone cannot win.
        const foodSecure = amount(o.food) >= 100 && amount(o.farms) >= 3;
        const eligible = age === 3 && foodSecure && mean >= 59 && floor >= 42 &&
            quadrants.every(value => value >= 51);
        return { "dimensions": s, "mean": Math.round(mean),
            "floor": floor, "score": score, "age": age, "ageName": names[age],
            "quadrants": quadrants, "eligible": eligible };
    }

    function updateMemory(memory, observation)
    {
        const next = Object.assign(freshMemory(), memory || {});
        const kills = amount(observation.kills);
        const newKills = Math.max(0, kills - next.lastKills);
        const losses = amount(observation.losses);
        const newLosses = Math.max(0, losses - next.lastLosses);
        const aid = amount(observation.tributes);
        const newAid = Math.max(0, aid - next.lastTributes);
        next.lastKills = kills;
        next.lastLosses = losses;
        next.lastTributes = aid;
        // Defensive casualties are socially costly too. Healing takes time.
        next.trauma = clamp(next.trauma * 0.96 + newKills * 1.4 +
            newLosses * 1.7, 0, 50);
        const foodStress = amount(observation.food) < 100;
        const cooperative = !!(observation.techs &&
            (observation.techs.zion_commons || observation.techs.zion_concord));
        next.trust = clamp(next.trust + (cooperative ? 0.7 : 0.1) +
            (newAid > 100 ? 0.5 : 0) - (foodStress ? 1.4 : 0) -
            newKills * 0.3 - newLosses * 0.35, -35, 30);
        return next;
    }

    return { "DIMENSIONS": DIMENSIONS, "GOVERNMENTS": GOVERNMENTS,
        "freshMemory": freshMemory, "measure": measure, "updateMemory": updateMemory };
})();
if (typeof module !== "undefined" && module.exports)
    module.exports = ZionModel;
