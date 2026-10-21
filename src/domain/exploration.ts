import { APPS, CALOR, CHEM, CHS, LOADS } from "./data.ts";
import type { Conditions, EvaluationResult, Material, RankedMaterials } from "./types.ts";

export interface ExplorerProperty {
  key: string;
  label: string;
  value: (material: Material) => number;
  unit?: string;
}

export type ExplorerMessage =
  | { kind: "temperature"; value: number }
  | { kind: "keyword"; label: string }
  | { kind: "matches"; count: number; query: string }
  | { kind: "empty"; query: string }
  | { kind: "manual"; label: string }
  | { kind: "none" };

export interface ExplorerResults {
  materials: Material[];
  sortKey: string;
  hitTemperature: number | null;
  message: ExplorerMessage;
  property: ExplorerProperty | null;
  bestValue: number | null;
}

export interface ComparisonRow {
  label: string;
  values: string[];
}

export interface ComparisonSeries {
  materialId: string;
  color: string;
  values: number[];
}

export interface ComparisonData {
  series: ComparisonSeries[];
  need: number[];
  rows: ComparisonRow[];
}

export interface RadarAxisGeometry {
  label: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "middle" | "end";
}

export interface RadarGeometry {
  rings: string[];
  axes: RadarAxisGeometry[];
  need: string;
  series: { materialId: string; color: string; points: string }[];
}

export const PROPS: readonly ExplorerProperty[] = [{ key: "tc", label: "Temperatura de servicio", value: (m) => m.tc, unit: "°C" }, { key: "uv", label: "Resistencia al sol (UV)", value: (m) => m.uv }, { key: "hum", label: "Resistencia a la humedad", value: (m) => m.hum }, { key: "abr", label: "Resistencia al desgaste", value: (m) => m.abr }, { key: "cold", label: "Resistencia al frío", value: (m) => m.cold }, { key: "str", label: "Resistencia mecánica", value: (m) => m.str }, { key: "stf", label: "Rigidez", value: (m) => m.stf }, { key: "tgh", label: "Tenacidad al impacto", value: (m) => m.tgh }, { key: "crp", label: "Baja fluencia (creep)", value: (m) => m.crp }, { key: "ease", label: "Facilidad de impresión", value: (m) => m.ease }, { key: "cheap", label: "Bajo costo", value: (m) => 5 - m.cost }, { key: "flex", label: "Flexibilidad", value: (m) => m.flex * 3 }, { key: "food", label: "Aptitud alimentos", value: (m) => m.food }, { key: "flame", label: "Autoextinguible", value: (m) => m.flame }, ...CHEM.map(([key, label]) => ({ key: `c.${key}`, label: `Resistencia a ${label.toLowerCase()}`, value: (m: Material) => m.c[key] }))];

export const CARD_PROPERTIES = [["uv", "Sol (UV)"], ["hum", "Humedad"], ["abr", "Desgaste"], ["cold", "Frío"], ["str", "Resistencia"], ["stf", "Rigidez"], ["tgh", "Impacto"], ["crp", "Baja fluencia"], ["ease", "Facilidad"]] as const;
export const MATRIX_PROPERTIES: readonly (readonly [string, string, (material: Material) => number])[] = [["uv", "Sol UV", (material) => material.uv], ["hum", "Humedad", (material) => material.hum], ...CHEM.map(([key]) => [`c.${key}`, CHS[key], (material: Material) => material.c[key]] as const)];

export const KEYWORDS: readonly (readonly [RegExp, string])[] = [[/nafta|gasoil|combust|diesel|gasolina/, "c.comb"], [/acetona|solvente|thinner/, "c.solv"], [/[aá]cido/, "c.acid"], [/soda|caust|base|alcalin/, "c.base"], [/cloro|sal|mar|pileta|piscina/, "c.cl"], [/vapor|agua cal|agua caliente/, "c.aguaCal"], [/aceite|grasa|lubric/, "c.aceites"], [/alcohol|limpiador|lavandina/, "c.alc"], [/agua|lluvia/, "c.agua"], [/sol|uv|intemperie|exterior/, "uv"], [/humed/, "hum"], [/desgast|abras|roce|fricci/, "abr"], [/fr[ií]o|helad|congel/, "cold"], [/impacto|golpe|tenaz/, "tgh"], [/r[ií]gid/, "stf"], [/creep|fluencia|carga perman/, "crp"], [/flexib|el[aá]stic|goma/, "flex"], [/aliment|comida/, "food"], [/llama|fuego|ign[ií]fug|autoext/, "flame"], [/f[aá]cil|imprimir/, "ease"], [/barat|costo|econ[oó]m/, "cheap"], [/resisten|fuerte|estructur/, "str"], [/temp|calor|horno|motor|°|\d{2,3}/, "tc"]];

export const AXES = ["Temperatura", "Sol (UV)", "Química", "Tenacidad", "Rigidez", "Facilidad", "Bajo costo"] as const;

export function exploreMaterials(materials: readonly Material[], query: string, manualSortKey: string): ExplorerResults {
  const raw = query.trim().toLowerCase();
  let sortKey = manualSortKey;
  let message: ExplorerMessage = { kind: "none" };
  let list = [...materials];
  let hitTemperature: number | null = null;
  if (raw) {
    const byName = materials.filter((material) => `${material.id} ${material.fam} ${material.note} ${material.apps}`.toLowerCase().includes(raw));
    const keyword = KEYWORDS.find(([pattern]) => pattern.test(raw));
    const temperature = raw.match(/(\d{2,3})\s*°?\s*c?/);
    if (temperature) {
      hitTemperature = Number(temperature[1]);
      sortKey = "tc";
      list = [...materials];
      message = { kind: "temperature", value: hitTemperature };
    } else if (keyword && !materials.some((material) => material.id.toLowerCase() === raw)) {
      sortKey = keyword[1];
      list = [...materials];
      message = { kind: "keyword", label: PROPS.find((property) => property.key === sortKey)!.label.toLowerCase() };
    } else {
      list = byName;
      message = list.length ? { kind: "matches", count: list.length, query: raw } : { kind: "empty", query: raw };
    }
  }
  const property = PROPS.find((item) => item.key === sortKey) ?? null;
  if (sortKey && property) {
    list.sort((left, right) => property.value(right) - property.value(left) || left.id.localeCompare(right.id));
    if (!raw) message = { kind: "manual", label: property.label.toLowerCase() };
  }
  if (hitTemperature != null) list = list.filter((material) => material.tc >= hitTemperature!).concat(list.filter((material) => material.tc < hitTemperature!));
  const bestValue = property ? Math.max(...materials.map(property.value)) : null;
  return { materials: list, sortKey, hitTemperature, message, property, bestValue };
}

export function isExplorerHit(material: Material, exploration: ExplorerResults): boolean {
  if (exploration.hitTemperature != null) return material.tc >= exploration.hitTemperature;
  return exploration.property !== null && exploration.property.value(material) === exploration.bestValue;
}

export function axisValues(material: Material, q: Conditions): number[] {
  const required = CHEM.filter(([key]) => q.ch[key] > 0).map(([key]) => material.c[key]);
  const chemistry = required.length ? Math.min(...required) / 3 : Object.values(material.c).reduce((sum, value) => sum + value, 0) / 27;
  return [Math.min(1, material.tc / 150), material.uv / 3, chemistry, material.tgh / 3, material.stf / 3, material.ease / 3, (5 - material.cost) / 4];
}

export function needValues(q: Conditions, designTemperature: number): number[] {
  const chemistry = Math.max(0, ...Object.values(q.ch)) / 3;
  const temperatureNeed = Math.min(1, Math.max(0, designTemperature) / 150);
  const uvNeed = [0, 0.34, 0.67][q.uv] || 0;
  const toughnessNeed = q.carga === "imp" || q.carga === "cyc" ? 0.67 : q.carga === "none" ? 0 : 0.34;
  const rigidityNeed = q.rig === "flex" ? 0 : q.carga === "none" ? 0.34 : 0.67;
  return [temperatureNeed, uvNeed, chemistry, toughnessNeed, rigidityNeed, 0, 0];
}

export function comparisonData(results: readonly EvaluationResult[], q: Conditions): ComparisonData {
  const colors = ["var(--s1)", "var(--s2)", "var(--s3)"];
  const series = results.map((result, index) => ({ materialId: result.m.id, color: colors[index]!, values: axisValues(result.m, q) }));
  const anyChemical = Object.values(q.ch).some((value) => value > 0);
  const rows: ComparisonRow[] = [
    { label: "Puntaje", values: results.map((result) => `${result.score}/100`) },
    { label: "Estado", values: results.map((result) => result.ex.length ? (result.casi ? "Casi" : "Descartado") : "Cumple") },
    { label: "Límite térmico", values: results.map((result) => `${result.lim} °C`) },
    { label: "Sol (UV)", values: results.map((result) => ["No", "Limitado", "Bueno", "Excelente"][result.m.uv]) },
    { label: anyChemical ? "Química (tu caso)" : "Química (prom.)", values: results.map((result) => ["No", "Limitado", "Bueno", "Excelente"][Math.floor(axisValues(result.m, q)[2] * 3 + 1e-9)]) },
    { label: "Tenacidad", values: results.map((result) => `${result.m.tgh}/3`) },
    { label: "Rigidez", values: results.map((result) => `${result.m.stf}/3`) },
    { label: "Fluencia baja", values: results.map((result) => `${result.m.crp}/3`) },
    { label: "Facilidad", values: results.map((result) => `${result.m.ease}/3`) },
    { label: "Costo", values: results.map((result) => "$".repeat(result.m.cost)) },
  ];
  return { series, need: needValues(q, results[0]?.Td ?? 0), rows };
}

function radarPoint(index: number, value: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / AXES.length;
  return [180 + Math.cos(angle) * 100 * value, 155 + Math.sin(angle) * 100 * value];
}

function radarPoints(values: readonly number[]): string {
  return values.map((value, index) => radarPoint(index, Math.max(value, 0.02)).join(",")).join(" ");
}

export function radarGeometry(series: readonly ComparisonSeries[], need: readonly number[]): RadarGeometry {
  const axes = AXES.map((label, index) => {
    const [x, y] = radarPoint(index, 1);
    const [labelX, labelY] = radarPoint(index, 1.2);
    return { label, x, y, labelX, labelY, anchor: (Math.abs(labelX - 180) < 8 ? "middle" : labelX < 180 ? "end" : "start") as RadarAxisGeometry["anchor"] };
  });
  return { rings: [1 / 3, 2 / 3, 1].map((fraction) => radarPoints(AXES.map(() => fraction))), axes, need: radarPoints(need), series: series.map((item) => ({ materialId: item.materialId, color: item.color, points: radarPoints(item.values) })) };
}

export function updateComparisonSelection(selectedIds: readonly string[], id: string, checked: boolean): { selectedIds: string[]; limitExceeded: boolean } {
  if (checked && selectedIds.length >= 3) return { selectedIds: [...selectedIds], limitExceeded: true };
  if (checked) return { selectedIds: [...selectedIds, id], limitExceeded: false };
  return { selectedIds: selectedIds.filter((selectedId) => selectedId !== id), limitExceeded: false };
}

export function shouldShowComparison(selectedCount: number): boolean {
  return selectedCount >= 2;
}

export function clearComparisonSelection(): string[] {
  return [];
}

export function quotationText(q: Conditions, ranked: RankedMaterials): string {
  const application = APPS.find((preset) => preset.id === q.app);
  const lines: string[] = [];
  lines.push("Consulta desde el Selector de Filamentos de SOLVO");
  lines.push("");
  lines.push(`Aplicación: ${application ? application.t : "—"}`);
  lines.push(`Temperatura de trabajo: ${q.tw} °C (pico ${q.tpk} °C, mínima ${q.tmin} °C)${q.calor !== "amb" ? `; calor extra: ${CALOR[q.calor]}${q.calor === "sol" ? `, pieza ${q.color === "oscuro" ? "oscura" : "clara"}` : ""}` : ""}`);
  lines.push(`Intemperie: ${q.ext === "no" ? "no" : `sol ${["no", "parte del día", "todo el día"][q.uv]}, humedad ${["baja", "normal", "alta"][q.hum]}, tierra/arena ${["no", "polvo", "arena con roce"][q.abrE]}`}${q.ext === "ns" ? " (supuesto)" : ""}`);
  const chemicals = CHEM.filter(([key]) => q.ch[key] > 0).map(([key, label]) => `${label.toLowerCase()} (${["no", "salpicadura", "sumergida"][q.ch[key]]})`);
  lines.push(`Líquidos y químicos: ${chemicals.length ? chemicals.join(", ") : "ninguno"}${q.liq === "ns" ? " (supuesto)" : ""}`);
  const loadLabel = q.carga === "none" ? "sin carga relevante" : LOADS.find(([key]) => key === q.carga)![1].toLowerCase();
  lines.push(`Esfuerzos: ${loadLabel}${q.roce ? ", con roce" : ""}; pieza ${q.rig === "flex" ? "flexible" : "rígida"}`);
  const requirements = [q.food && "contacto con alimentos", q.flame && "autoextinguible"].filter(Boolean);
  if (requirements.length) lines.push(`Requisitos: ${requirements.join(", ")}`);
  lines.push("");
  lines.push(`Materiales sugeridos: ${ranked.ok.length ? ranked.ok.slice(0, 3).map((result, index) => `${index + 1}. ${result.m.id} (${result.score}/100)`).join("  ") : "ninguno cumple todas las condiciones"}`);
  if (ranked.casi.length) lines.push(`Casi cumplen: ${ranked.casi.slice(0, 3).map((result) => `${result.m.id} (${result.fix!.charAt(0).toLowerCase()}${result.fix!.slice(1)})`).join("; ")}`);
  lines.push("");
  lines.push("Cantidad: ");
  lines.push("Medidas aproximadas o archivo: ");
  lines.push("Plazo: ");
  return lines.join("\n");
}
