import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ANNEAL, APPS, BASE, CALOR, CHA, CHEM, CHS, COLS, CONF, ENC, LOADS, REFS, SOLVO_EQ, SW } from "../src/domain/data.ts";
import { answersForPreset, applyApplicationPreset, deriveConditions, numberValue, temperatureValidationMessages } from "../src/domain/conditions.ts";
import { evaluateMaterial, labelLimitingCondition, manufacturingRecommendations, rankMaterials } from "../src/domain/evaluation.ts";
import { AXES, CARD_PROPERTIES, KEYWORDS, MATRIX_PROPERTIES, PROPS, axisValues, clearComparisonSelection, comparisonData, exploreMaterials, isExplorerHit, needValues, quotationText, radarGeometry, shouldShowComparison, updateComparisonSelection } from "../src/domain/exploration.ts";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const source = readFileSync(resolve(root, "openspec/changes/migrate-to-vite-react-typescript/reference/original-index.html"), "utf8");
const current = { CHEM, CHA, CHS, SOLVO_EQ, BASE, SW, ANNEAL, COLS, LOADS, REFS, APPS, CALOR, ENC, CONF, AX: AXES, KW: KEYWORDS };

function originalConstant(name) {
  const start = source.indexOf(`const ${name}=`);
  assert.notEqual(start, -1, `original ${name} is present`);
  const end = name === "BASE" || name === "APPS" ? source.indexOf("\n];", start) + 3 : source.indexOf("\n", start);
  const expression = source.slice(source.indexOf("=", start) + 1, end).replace(/;$/, "");
  return new Function("CHEM", "CHS", `return (${expression});`)(CHEM, CHS);
}

for (const name of Object.keys(current)) assert.deepStrictEqual(current[name], originalConstant(name), `${name} matches the original source`);

function originalFunction(name, endMarker) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(endMarker, start);
  assert.notEqual(start, -1, `original ${name} function is present`);
  assert.notEqual(end, -1, `end of original ${name} function is present`);
  return source.slice(start, end).trim();
}

const originalEvaluate = new Function("CHEM", "ANNEAL", `return (${originalFunction("evaluate", "\n\nconst LIMLBL")});`)(CHEM, ANNEAL);
const originalRecommendations = new Function("ANNEAL", `return (${originalFunction("fabRecs", "\n\n/* ---------- Render de resultados ---------- */")});`)(ANNEAL);
const originalAxisValues = new Function("CHEM", `return (${originalFunction("axVals", "\nfunction needVals")});`)(CHEM);
const originalNeedValues = new Function(`return (${originalFunction("needVals", "\nfunction radarSVG")});`)();
const originalRadar = new Function("AX", `return (${originalFunction("radarSVG", "\nfunction renderCompare")});`)(AXES);
const originalQuote = new Function("APPS", "CHEM", "CALOR", "LOADS", "LV", "LAST", `return (${originalFunction("quoteText", "\n$(\"copyQuote\").onclick=")});`);
const originalLimitingLabel = new Function("CHEM", `return (${source.slice(source.indexOf("const LIMLBL=") + "const LIMLBL=".length, source.indexOf("\n", source.indexOf("const LIMLBL="))).replace(/;$/, "")});`)(CHEM);

const originalProps = originalConstant("PROPS");
assert.deepStrictEqual(PROPS.map(({ key, label, unit }) => [key, label, unit ?? null]), originalProps.map(([key, label, , unit]) => [key, label, unit ?? null]), "explorer property labels and order match");
for (const property of PROPS) for (const material of BASE) assert.equal(property.value(material), originalProps.find(([key]) => key === property.key)[2](material), `${property.key}/${material.id}: explorer value matches`);
function originalExplorerConstant(name) {
  const start = source.indexOf(`const ${name}=`, source.indexOf("function explore(){"));
  const end = source.indexOf("\n", start);
  const expression = source.slice(source.indexOf("=", start) + 1, end).replace(/;$/, "");
  return new Function("CHEM", "CHS", `return (${expression});`)(CHEM, CHS);
}
const originalCardProperties = originalExplorerConstant("P");
const originalMatrixProperties = originalExplorerConstant("MC");
assert.deepStrictEqual(CARD_PROPERTIES, originalCardProperties, "explorer card property labels and order match");
assert.deepStrictEqual(MATRIX_PROPERTIES.map(([key, label]) => [key, label]), originalMatrixProperties.map(([key, label]) => [key, label]), "chemical matrix labels and order match");
for (const [key, , value] of MATRIX_PROPERTIES) for (const material of BASE) assert.equal(value(material), originalMatrixProperties.find(([originalKey]) => originalKey === key)[2](material), `${key}/${material.id}: matrix value matches`);

function originalConditions(raw) {
  const q = { assume: [], ch: {} };
  q.app = raw.app;
  if (raw.unknownTemperature) {
    q.tw = raw.appTw + 10;
    q.assume.push(`temperatura de trabajo ${q.tw} °C (típica de la aplicación + 10 °C)`);
  } else q.tw = numberValue(raw.tw);
  q.tpk = Math.max(numberValue(raw.tpk), q.tw);
  q.tmin = numberValue(raw.tmin);
  q.calor = raw.calor;
  q.color = raw.color;
  q.ext = raw.ext;
  if (q.ext === "si") {
    q.uv = Number(raw.uv);
    q.hum = Number(raw.hum);
    q.abrE = Number(raw.abrE);
  } else if (q.ext === "no") {
    q.uv = 0;
    q.hum = 0;
    q.abrE = 0;
  } else {
    q.uv = 1;
    q.hum = 1;
    q.abrE = 1;
    q.assume.push("exposición parcial al sol, humedad y polvo");
  }
  q.liq = raw.liq;
  CHEM.forEach(([key]) => { q.ch[key] = q.liq === "si" ? Number(raw.ch[key]) : 0; });
  if (q.liq === "ns") {
    q.ch.agua = 1;
    q.ch.aceites = 1;
    q.assume.push("contacto ocasional con agua y aceites");
  }
  q.mech = raw.mech;
  q.carga = q.mech === "si" ? raw.carga : q.mech === "no" ? "none" : "static";
  if (q.mech === "ns") q.assume.push("carga moderada");
  q.roce = q.mech !== "no" && raw.roce;
  q.abr = Math.max(q.abrE, q.roce ? 2 : 0);
  q.rig = raw.rig;
  q.food = raw.food;
  q.flame = raw.flame;
  q.fab = raw.fab;
  if (q.fab === "solvo") Object.assign(q, SOLVO_EQ);
  else Object.assign(q, { noz: numberValue(raw.noz), bed: numberValue(raw.bed), enc: Number(raw.enc), hard: raw.hard, dryer: raw.dryer });
  const priority = { eq: [1.5, 1.5], cost: [3, 2], perf: [0.3, 0.3] }[raw.prio];
  q.pcost = priority[0];
  q.pease = q.fab === "solvo" ? priority[1] * 0.5 : priority[1];
  return q;
}

const referenceStartup = answersForPreset(APPS.find((preset) => preset.id === "ext"));
for (const preset of APPS) {
  const before = { ...structuredClone(referenceStartup), fab: "yo", prio: "cost", noz: "285", bed: "105", enc: "2", hard: true, dryer: true, unknownTemperature: true };
  const after = applyApplicationPreset(before, preset);
  assert.deepStrictEqual(deriveConditions(after), originalConditions(after), `${preset.id}: selecting a preset derives the original conditions`);
  assert.equal(after.app, preset.id);
  assert.equal(after.fab, "yo", `${preset.id}: selecting a preset preserves the fabrication choice`);
  assert.equal(after.prio, "cost", `${preset.id}: selecting a preset preserves the priority`);
  assert.equal(after.noz, "285", `${preset.id}: selecting a preset preserves manual equipment values`);
  assert.equal(after.unknownTemperature, false, `${preset.id}: selecting a preset clears the unknown-temperature toggle`);
}

assert.deepStrictEqual(temperatureValidationMessages({ ...structuredClone(referenceStartup), tw: "40", tpk: "39", tmin: "41" }), ["El pico ocasional es menor que la temperatura de trabajo: se toma igual a la de trabajo.", "La mínima es mayor que la temperatura de trabajo. Revisá los valores."], "temperature warnings preserve order and exact copy");
assert.deepStrictEqual(temperatureValidationMessages({ ...structuredClone(referenceStartup), tw: "-41", tpk: "0", tmin: "-40" }), ["La mínima es mayor que la temperatura de trabajo. Revisá los valores.", "Temperatura fuera del rango que cubre esta herramienta (−40 a 200 °C)."], "temperature range warnings use the original bounds");
assert.deepStrictEqual(temperatureValidationMessages({ ...structuredClone(referenceStartup), unknownTemperature: true, tw: "40", tpk: "0", tmin: "41" }), ["La mínima es mayor que la temperatura de trabajo. Revisá los valores."], "unknown temperature suppresses only the peak warning");
assert.deepStrictEqual(temperatureValidationMessages({ ...structuredClone(referenceStartup), tw: "", tpk: "", tmin: "" }), [], "empty numeric fields use the zero fallback");

function referenceRanking(materials, conditions) {
  const results = materials.map((material) => originalEvaluate(material, conditions));
  const ok = results.filter((result) => !result.ex.length).sort((a, b) => b.score - a.score);
  const casi = results.filter((result) => result.casi).sort((a, b) => b.score - a.score);
  const no = results.filter((result) => result.ex.length && !result.casi);
  const counts = {};
  results.forEach((result) => new Set(result.ex.map((entry) => entry.k)).forEach((key) => counts[key] = (counts[key] || 0) + 1));
  const limits = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([key, count]) => ({ key, label: originalLimitingLabel(key), count }));
  return { results, ok, casi, no, limits };
}

function referenceExplorer(materials, query, manualSortKey) {
  const raw = query.trim().toLowerCase();
  let sortKey = manualSortKey;
  let info = "";
  let list = materials.slice();
  let hitTemperature = null;
  if (raw) {
    const byName = materials.filter((material) => `${material.id} ${material.fam} ${material.note} ${material.apps}`.toLowerCase().includes(raw));
    const keyword = KEYWORDS.find(([pattern]) => pattern.test(raw));
    const temperature = raw.match(/(\d{2,3})\s*°?\s*c?/);
    if (temperature) {
      hitTemperature = Number(temperature[1]);
      sortKey = "tc";
      list = materials.slice();
      info = `Materiales con temperatura de servicio de <b>${hitTemperature} °C</b> o más, primero.`;
    } else if (keyword && !materials.some((material) => material.id.toLowerCase() === raw)) {
      sortKey = keyword[1];
      list = materials.slice();
      info = `Ordenado por <b>${originalProps.find(([key]) => key === sortKey)[1].toLowerCase()}</b>.`;
    } else {
      list = byName;
      info = list.length ? `${list.length} material${list.length > 1 ? "es" : ""} con «${escapeHtml(raw)}».` : `No hay materiales con «${escapeHtml(raw)}». Probá con una necesidad: nafta, sol, desgaste, impacto, 100 °C.`;
    }
  }
  if (sortKey) {
    const property = originalProps.find(([key]) => key === sortKey);
    list.sort((left, right) => property[2](right) - property[2](left) || left.id.localeCompare(right.id));
    if (!raw) info = `Ordenado por <b>${property[1].toLowerCase()}</b>.`;
  }
  if (hitTemperature != null) list = list.filter((material) => material.tc >= hitTemperature).concat(list.filter((material) => material.tc < hitTemperature));
  const property = sortKey ? originalProps.find(([key]) => key === sortKey) : null;
  return { ids: list.map(({ id }) => id), sortKey, hitTemperature, info, propertyKey: property?.[0] ?? null, bestValue: property ? Math.max(...materials.map(property[2])) : null };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[character]);
}

function explorerMessageHtml(message) {
  if (message.kind === "temperature") return `Materiales con temperatura de servicio de <b>${message.value} °C</b> o más, primero.`;
  if (message.kind === "keyword") return `Ordenado por <b>${message.label}</b>.`;
  if (message.kind === "matches") return `${message.count} material${message.count > 1 ? "es" : ""} con «${escapeHtml(message.query)}».`;
  if (message.kind === "empty") return `No hay materiales con «${escapeHtml(message.query)}». Probá con una necesidad: nafta, sol, desgaste, impacto, 100 °C.`;
  if (message.kind === "manual") return `Ordenado por <b>${message.label}</b>.`;
  return "";
}

function originalQuoteFor(q, ranked) {
  const createQuote = originalQuote(APPS, CHEM, CALOR, LOADS, ["no", "salpicadura", "sumergida"], { q, ...ranked });
  return createQuote();
}

function referenceComparison(results, q) {
  const colors = ["var(--s1)", "var(--s2)", "var(--s3)"];
  const series = results.map((result, index) => ({ materialId: result.m.id, color: colors[index], values: originalAxisValues(result.m, q) }));
  const anyChemical = Object.values(q.ch).some((value) => value > 0);
  const rowValues = [
    ["Puntaje", (result) => `${result.score}/100`],
    ["Estado", (result) => result.ex.length ? (result.casi ? "Casi" : "Descartado") : "Cumple"],
    ["Límite térmico", (result) => `${result.lim} °C`],
    ["Sol (UV)", (result) => ["No", "Limitado", "Bueno", "Excelente"][result.m.uv]],
    [anyChemical ? "Química (tu caso)" : "Química (prom.)", (result) => ["No", "Limitado", "Bueno", "Excelente"][Math.floor(originalAxisValues(result.m, q)[2] * 3 + 1e-9)]],
    ["Tenacidad", (result) => `${result.m.tgh}/3`],
    ["Rigidez", (result) => `${result.m.stf}/3`],
    ["Fluencia baja", (result) => `${result.m.crp}/3`],
    ["Facilidad", (result) => `${result.m.ease}/3`],
    ["Costo", (result) => "$".repeat(result.m.cost)],
  ];
  return { series, need: originalNeedValues(q, results[0]?.Td ?? 0), rows: rowValues.map(([label, value]) => ({ label, values: results.map(value) })) };
}

function verifyRadarGeometry(series, need) {
  const geometry = radarGeometry(series, need);
  const svg = originalRadar(series.map(({ values, color }) => [values, color]), need);
  const polygons = [...svg.matchAll(/<polygon points="([^"]+)"/g)].map((match) => match[1]);
  assert.deepStrictEqual(polygons, [...geometry.rings, geometry.need, ...geometry.series.map((item) => item.points)], "radar polygon points match the original SVG");
  const lines = [...svg.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)" stroke="([^"]+)"\/>/g)].map((match) => match.slice(1));
  assert.deepStrictEqual(lines, geometry.axes.map((axis) => ["180", "155", String(axis.x), String(axis.y), "var(--line)"]), "radar axis line attributes match the original SVG");
  const labels = [...svg.matchAll(/<text x="([^"]+)" y="([^"]+)" font-size="12" fill="var\(--muted\)" text-anchor="([^"]+)" dominant-baseline="middle" font-family="Archivo, sans-serif">([^<]+)<\/text>/g)].map((match) => match.slice(1));
  assert.deepStrictEqual(labels, geometry.axes.map((axis) => [String(axis.labelX), String(axis.labelY), axis.anchor, axis.label]), "radar text attributes match the original SVG");
  assert.match(svg, /^<svg class="radar" viewBox="0 0 360 310" role="img" aria-label="Comparación en gráfico radar">/);
}

const cases = APPS.map((preset) => [preset.id, answersForPreset(preset)]);
const base = structuredClone(answersForPreset(APPS.find((preset) => preset.id === "ext")));
cases.push(["unknown temperature and answers", { ...structuredClone(base), unknownTemperature: true, ext: "ns", liq: "ns", mech: "ns" }]);
cases.push(["empty numeric inputs", { ...structuredClone(base), tw: "", tpk: "", tmin: "", noz: "", bed: "", enc: "", fab: "yo" }]);
cases.push(["manual equipment limits", { ...structuredClone(base), fab: "yo", noz: "215", bed: "50", enc: "0", hard: false, dryer: false, prio: "perf" }]);
cases.push(["thermal boundaries and impact", { ...structuredClone(base), tw: "85", tpk: "115", tmin: "-41", calor: "cont", mech: "si", carga: "imp", rig: "rig" }]);
for (const [key] of CHEM) for (const level of ["1", "2"]) cases.push([`chemical ${key} level ${level}`, { ...structuredClone(base), liq: "si", ch: { ...base.ch, [key]: level } }]);

for (const [name, raw] of cases) {
  const conditions = deriveConditions(raw);
  assert.deepStrictEqual(conditions, originalConditions(raw), `${name}: derived conditions match the original`);
  const actual = rankMaterials(BASE, conditions);
  const expected = referenceRanking(BASE, conditions);
  assert.deepStrictEqual(actual, expected, `${name}: scores, stable ordering, near matches, exclusions, and limiting conditions match`);
  for (const material of BASE) assert.deepStrictEqual(axisValues(material, conditions), originalAxisValues(material, conditions), `${name}/${material.id}: radar values match`);
  assert.deepStrictEqual(needValues(conditions, expected.results[0]?.Td ?? 0), originalNeedValues(conditions, expected.results[0]?.Td ?? 0), `${name}: requested radar values match`);
  const comparison = comparisonData(expected.results.slice(0, 3), conditions);
  assert.deepStrictEqual(comparison, referenceComparison(expected.results.slice(0, 3), conditions), `${name}: comparison calculations match`);
  verifyRadarGeometry(comparison.series, comparison.need);
  assert.equal(quotationText(conditions, actual), originalQuoteFor(conditions, expected), `${name}: quotation text matches`);
  for (const result of expected.results) assert.deepStrictEqual(evaluateMaterial(result.m, conditions), originalEvaluate(result.m, conditions), `${name}/${result.m.id}: evaluation matches`);
  for (const result of expected.results) assert.deepStrictEqual(manufacturingRecommendations(result, conditions), originalRecommendations(result, conditions), `${name}/${result.m.id}: recommendations match`);
}

let selected = [];
for (const id of ["PLA", "PETG", "ASA"]) {
  const result = updateComparisonSelection(selected, id, true);
  selected = result.selectedIds;
  assert.equal(result.limitExceeded, false);
}
assert.deepStrictEqual(selected, ["PLA", "PETG", "ASA"]);
assert.equal(shouldShowComparison(selected.length), true);
assert.deepStrictEqual(updateComparisonSelection(selected, "PC", true), { selectedIds: ["PLA", "PETG", "ASA"], limitExceeded: true }, "comparison selection stops at three materials");
selected = updateComparisonSelection(selected, "PETG", false).selectedIds;
selected = updateComparisonSelection(selected, "PC", true).selectedIds;
assert.deepStrictEqual(selected, ["PLA", "ASA", "PC"], "unselected comparison materials can be replaced in insertion order");
selected = clearComparisonSelection();
assert.equal(shouldShowComparison(selected.length), false, "comparison hides below two selected materials");
assert.equal(shouldShowComparison(1), false);
assert.equal(shouldShowComparison(2), true);

const searchCases = [["", ""], ["", "tc"], ["nafta", ""], ["goma", ""], ["agua caliente", ""], ["resistente al agua", ""], ["acetona", ""], ["sol", ""], ["POM", ""], ["PA12", ""], ["100 °C", ""], ["nafta 100 °C", ""], ["carcasa", "tc"], ["xyz <", ""], ["agua", "c.agua"]];
for (const [query, sortKey] of searchCases) {
  const actual = exploreMaterials(BASE, query, sortKey);
  const expected = referenceExplorer(BASE, query, sortKey);
  assert.deepStrictEqual({ ids: actual.materials.map(({ id }) => id), sortKey: actual.sortKey, hitTemperature: actual.hitTemperature, info: explorerMessageHtml(actual.message), propertyKey: actual.property?.key ?? null, bestValue: actual.bestValue }, expected, `exploration query ${query} / sort ${sortKey} matches`);
  const originalProperty = expected.propertyKey ? originalProps.find(([key]) => key === expected.propertyKey) : null;
  for (const material of BASE) assert.equal(isExplorerHit(material, actual), expected.hitTemperature != null ? material.tc >= expected.hitTemperature : originalProperty !== null && originalProperty[2](material) === expected.bestValue, `${query}/${material.id}: explorer highlight matches`);
}

assert.deepStrictEqual(rankMaterials([], deriveConditions(base)), { results: [], ok: [], casi: [], no: [], limits: [] }, "empty material lists are handled");
assert.equal(numberValue(""), 0, "empty numeric inputs retain the original zero fallback");
assert.equal(labelLimitingCondition("temp"), "la temperatura de trabajo");
console.log(`Verified ${Object.keys(current).length} data constants, ${APPS.length} presets, ${cases.length} condition cases, ${cases.length * BASE.length} material evaluations, recommendations, radar/comparison values, ${searchCases.length} explorer queries, and quotation strings against the original.`);
