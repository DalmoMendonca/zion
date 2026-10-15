"use strict";
// Exercise the checked-in Pyrogenesis game setup attribute implementation.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const GameSettings = { prototype: { Attributes: {} } };
class GameSetting {}
vm.runInNewContext(fs.readFileSync(
  "binaries/data/mods/public/gamesettings/attributes/PlayerCiv.js", "utf8"
), { GameSettings, GameSetting }, { filename: "PlayerCiv.js" });

const civ = new GameSettings.prototype.Attributes.PlayerCiv();
civ.values = [];
civ.locked = [];
civ.settings = { map: { type: "scenario" } };

civ._getMapData = () => "pers";
civ._set(0, "gaul");
assert.equal(civ.values[0], "achae");
assert.equal(civ.locked[0], true);

civ._getMapData = () => "achae";
civ._set(1, "gaul");
assert.equal(civ.values[1], "achae");
assert.equal(civ.locked[1], true);

civ.settings.map.type = "skirmish";
civ._getMapData = () => undefined;
civ._set(2, "pers");
assert.equal(civ.values[2], "achae");
assert.equal(civ.locked[2], false);

civ._set(3, "gaul");
assert.equal(civ.values[3], "gaul");
console.log("ZION_GAMESETTINGS_CIV_OK: historical Persian, modern Achaemenid, and normal setup");
