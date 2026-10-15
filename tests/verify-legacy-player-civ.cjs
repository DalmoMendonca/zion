// Regress a real Pyrogenesis player-template compatibility path.
// This checks the actual simulation helper, not a copied implementation.
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const globals = {};
const warnings = [];
const source = fs.readFileSync("binaries/data/mods/public/simulation/helpers/Player.js", "utf8");
vm.runInNewContext(source, {
  Engine: { RegisterGlobal: (name, value) => { globals[name] = value; } },
  warn: message => warnings.push(message)
}, { filename: "simulation/helpers/Player.js" });

const getTemplate = globals.GetPlayerTemplateName ||
  vm.runInNewContext(source + "\nGetPlayerTemplateName;", {
    Engine: { RegisterGlobal: () => {} },
    warn: message => warnings.push(message)
  });

assert.equal(getTemplate("pers"), "special/players/achae",
  "Legacy Persian scenarios must resolve to the modern Achaemenid template");
assert.equal(getTemplate("achae"), "special/players/achae");
assert.equal(getTemplate("athen"), "special/players/athen");
assert.equal(getTemplate("gaul"), "special/players/gaul");
assert.equal(warnings.length, 1,
  "Only legacy civilization identifiers should emit a compatibility warning");
assert.match(warnings[0], /pers.*achae/);
console.log("ZION_LEGACY_CIV_OK: legacy Persian and modern civilization templates resolved");
