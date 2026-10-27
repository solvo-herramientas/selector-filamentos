import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BASE } from "../src/domain/data.ts";
import { APPS } from "../src/domain/data.ts";
import { answersForPreset, deriveConditions } from "../src/domain/conditions.ts";
import { rankMaterials } from "../src/domain/evaluation.ts";
import { exploreMaterials } from "../src/domain/exploration.ts";
import { cloneMaterials, loadCuratorAccess, loadMaterialDatabase, resetMaterialDatabase, saveCuratorAccess, saveMaterialDatabase, setMaterialField, STORAGE_KEYS } from "../src/domain/persistence.ts";

class MemoryStorage {
  values = new Map();
  writes = [];
  removals = [];
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.writes.push([key, value]); this.values.set(key, value); }
  removeItem(key) { this.removals.push(key); this.values.delete(key); }
}

const storage = new MemoryStorage();
const provider = () => storage;
const baseline = cloneMaterials();
storage.setItem(STORAGE_KEYS.current, JSON.stringify([{ id: "PLA", tc: 91, c: { agua: 0 }, food: "not numeric" }, { id: "UNKNOWN", tc: 1 }]));
storage.setItem(STORAGE_KEYS.legacy, JSON.stringify([{ id: "PLA", tc: 12 }]));
const writesBeforeLoad = storage.writes.length;
let loaded = loadMaterialDatabase(provider);
assert.equal(loaded.find(({ id }) => id === "PLA").tc, 91, "current database overrides the legacy database");
assert.equal(loaded.find(({ id }) => id === "PLA").c.agua, 0, "numeric chemical values are restored");
assert.equal(loaded.find(({ id }) => id === "PLA").food, baseline.find(({ id }) => id === "PLA").food, "non-numeric saved fields are ignored");
assert.equal(loaded.find(({ id }) => id === "PETG").tc, baseline.find(({ id }) => id === "PETG").tc, "records match by ID and missing fields keep defaults");
assert.equal(storage.writes.length, writesBeforeLoad, "loading saved data does not write or overwrite storage");

storage.values.delete(STORAGE_KEYS.current);
storage.setItem(STORAGE_KEYS.legacy, JSON.stringify([{ id: "PLA", tc: 73, c: { aguaCal: 2 } }]));
loaded = loadMaterialDatabase(provider);
assert.equal(loaded.find(({ id }) => id === "PLA").tc, 73, "legacy records load when the current key is absent");
assert.equal(loaded.find(({ id }) => id === "PLA").c.aguaCal, 2, "legacy chemical values load by material ID");

storage.setItem(STORAGE_KEYS.current, "{malformed");
storage.setItem(STORAGE_KEYS.legacy, JSON.stringify([{ id: "PLA", tc: 73 }]));
loaded = loadMaterialDatabase(provider);
assert.deepStrictEqual(loaded, baseline, "malformed current JSON is ignored without partially applying legacy data");
storage.setItem(STORAGE_KEYS.current, JSON.stringify([{ id: "PLA", c: null }, null, { id: "PETG", tc: "65", c: { agua: null } }]));
loaded = loadMaterialDatabase(provider);
assert.deepStrictEqual(loaded, baseline, "malformed records and non-numeric values are ignored safely");

assert.deepStrictEqual(loadMaterialDatabase(() => null), baseline, "unavailable storage returns defaults");
assert.deepStrictEqual(loadMaterialDatabase(() => { throw new Error("denied"); }), baseline, "storage access exceptions return defaults");
assert.equal(saveMaterialDatabase(() => null, baseline), false, "unavailable storage rejects persistence safely");
assert.equal(saveMaterialDatabase(() => { throw new Error("denied"); }, baseline), false, "storage write exceptions are contained");

assert.equal(loadCuratorAccess(provider, ""), false, "curator access defaults to off");
assert.equal(saveCuratorAccess(provider, true), true, "curator access can be persisted");
assert.equal(storage.getItem(STORAGE_KEYS.curator), "1");
assert.equal(loadCuratorAccess(provider, ""), true, "saved curator access is restored");
assert.equal(saveCuratorAccess(provider, false), true);
assert.equal(loadCuratorAccess(provider, ""), false, "curator access can be cleared");
assert.equal(loadCuratorAccess(() => null, "#curador"), true, "the direct curator fragment enables access without storage");
assert.equal(loadCuratorAccess(() => null, ""), false);

const edited = cloneMaterials();
setMaterialField(edited.find(({ id }) => id === "PLA"), "tc", 99);
setMaterialField(edited.find(({ id }) => id === "PETG"), "c.agua", 0);
assert.equal(saveMaterialDatabase(provider, edited), true, "edited material data is saved");
assert.equal(storage.getItem(STORAGE_KEYS.current), JSON.stringify(edited), "the current storage key keeps the original JSON record format");
const committed = loadMaterialDatabase(provider);
assert.equal(committed.find(({ id }) => id === "PLA").tc, 99, "committed temperature edits reload into the selector database");
assert.equal(committed.find(({ id }) => id === "PETG").c.agua, 0, "committed chemical edits reload into the explorer database");
const conditions = deriveConditions(answersForPreset(APPS.find(({ id }) => id === "ext")));
assert.equal(rankMaterials(committed, conditions).results.find(({ m }) => m.id === "PLA").m.tc, 99, "selector calculations consume the committed database immediately");
assert.equal(exploreMaterials(committed, "PETG", "").materials.find(({ id }) => id === "PETG").c.agua, 0, "explorer calculations consume the committed database immediately");
const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
assert.match(appSource, /useState<TabKey>\("sel"\)/, "the selector remains the initial tab, including curator entry");
assert.match(appSource, /loadCuratorAccess\(getBrowserStorage, typeof window === "undefined" \? "" : window\.location\.hash\)/, "the fragment and saved curator access restore access");
assert.match(appSource, /rankMaterials\(database, conditions\)/, "selector ranking reads the shared editable database");
assert.match(appSource, /<ExplorerPanel materials=\{database\}/, "explorer reads the shared editable database");
const reset = resetMaterialDatabase(provider);
assert.deepStrictEqual(reset, baseline, "reset restores cloned defaults");
assert.equal(storage.getItem(STORAGE_KEYS.current), null, "reset removes the current database key");
assert.equal(storage.getItem(STORAGE_KEYS.legacy), null, "reset removes the legacy database key");
assert.equal(storage.getItem(STORAGE_KEYS.curator), "0", "reset preserves the curator access flag");
assert.notStrictEqual(reset, BASE, "reset returns a separate array");
reset[0].tc = -1;
assert.equal(BASE[0].tc, baseline[0].tc, "editing reset defaults does not mutate the source data");
console.log("Verified current/legacy loading, numeric overlays, malformed and unavailable storage, curator access and initial tab, shared selector/explorer edits, reset behavior, and no startup database writes.");
