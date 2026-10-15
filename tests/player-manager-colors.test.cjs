// Exercise the real PlayerManager script without a renderer or synthetic victory.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const entityData = new Map();
const broadcasts = [];
let nextEntity = 1;
let PlayerManager;

const defaults = [
  { Color: { r: 255, g: 255, b: 255 } },
  { Color: { r: 21, g: 55, b: 149 } },
  { Color: { r: 150, g: 20, b: 20 } }
];

const Engine = {
  ReadJSONFile(path) {
    assert.equal(path, "simulation/data/settings/player_defaults.json");
    return { PlayerData: defaults };
  },
  AddEntity(template) {
    const entity = nextEntity++;
    entityData.set(entity, {
      template,
      player: {
        id: undefined,
        color: undefined,
        SetPlayerID(id) { this.id = id; },
        SetColor(r, g, b) {
          assert.equal(typeof r, "number");
          assert.equal(typeof g, "number");
          assert.equal(typeof b, "number");
          for (const v of [r, g, b]) assert.ok(Number.isFinite(v));
          this.color = { r: r / 255, g: g / 255, b: b / 255, a: 1 };
        },
        GetColor() { return this.color; }
      },
      diplomacy: {
        diplomacy: [],
        SetDiplomacy(value) { this.diplomacy = [...value]; },
        GetDiplomacy() { return this.diplomacy; }
      }
    });
    return entity;
  },
  QueryInterface(entity, iid) {
    if (entity === 0 && iid === "RangeManager")
      return { GetEntitiesByPlayer: () => [] };
    const data = entityData.get(entity);
    if (!data) return null;
    if (iid === "Player") return data.player;
    if (iid === "Diplomacy") return data.diplomacy;
    return null;
  },
  BroadcastMessage(type, data) { broadcasts.push({ type, data }); },
  DestroyEntity(entity) { entityData.delete(entity); },
  FlushDestroyedEntities() {},
  RegisterSystemComponentType(iid, name, klass) {
    assert.equal(iid, "PlayerManager");
    PlayerManager = klass;
  }
};

vm.runInNewContext(
  fs.readFileSync("binaries/data/mods/public/simulation/components/PlayerManager.js", "utf8"),
  { Engine, IID_Player: "Player", IID_Diplomacy: "Diplomacy",
    IID_RangeManager: "RangeManager", IID_Ownership: "Ownership",
    IID_PlayerManager: "PlayerManager", SYSTEM_ENTITY: 0,
    MT_PlayerEntityChanged: "PlayerEntityChanged",
    INVALID_ENTITY: -1, INVALID_PLAYER: -1, warn: () => {} },
  { filename: "PlayerManager.js" }
);

const manager = new PlayerManager();
manager.Init();
assert.equal(manager.AddPlayer("special/players/gaia"), 0);
assert.equal(manager.AddPlayer("special/players/athen"), 1);
assert.equal(manager.AddPlayer("special/players/cart"), 2);
const sourceEntity = manager.GetPlayerByID(1);
const sourceColor = entityData.get(sourceEntity).player.GetColor();
assert.ok(sourceColor, "Player color must be initialized before a graphical frame");
assert.equal(sourceColor.r, 21 / 255);
assert.equal(sourceColor.g, 55 / 255);
assert.equal(sourceColor.b, 149 / 255);

manager.ReplacePlayerTemplate(1, "special/players/spart");
const replacement = entityData.get(manager.GetPlayerByID(1));
assert.ok(replacement, "Replacement player must exist");
const resultColor = replacement.player.GetColor();
for (const channel of ["r", "g", "b", "a"])
  assert.ok(Math.abs(resultColor[channel] - sourceColor[channel]) < 1e-10,
    "Template replacement changed the " + channel + " color channel");
assert.equal(entityData.has(sourceEntity), false);

manager.RemoveLastPlayer();
assert.equal(manager.GetNumPlayers(), 2);
assert.equal(broadcasts.at(-1).data.player, 2,
  "Removing player 2 must broadcast ID 2, not 3");
console.log("ZION_PLAYER_MANAGER_COLORS_OK: initialized, preserved, removed correctly");
