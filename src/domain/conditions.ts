import { APPS, CHEM, SOLVO_EQ } from "./data.ts";
import type { ApplicationPreset, Conditions, ChemicalKey, RawAnswers } from "./types.ts";

export function numberValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function temperatureValidationMessages(answers: RawAnswers): string[] {
  const errors: string[] = [];
  const workTemperature = numberValue(answers.tw);
  if (!answers.unknownTemperature && numberValue(answers.tpk) < workTemperature) errors.push("El pico ocasional es menor que la temperatura de trabajo: se toma igual a la de trabajo.");
  if (numberValue(answers.tmin) > workTemperature) errors.push("La mínima es mayor que la temperatura de trabajo. Revisá los valores.");
  if (workTemperature > 200 || workTemperature < -40) errors.push("Temperatura fuera del rango que cubre esta herramienta (−40 a 200 °C).");
  return errors;
}

export function answersForPreset(preset: ApplicationPreset): RawAnswers {
  const values = preset.v;
  const ch = Object.fromEntries(CHEM.map(([key]) => [key, String(values.ch?.[key] ?? 0)])) as Record<ChemicalKey, string>;
  return { app: preset.id, tw: String(values.tw), tpk: String(values.tpk), tmin: String(values.tmin), unknownTemperature: false, customTemperature: false, appTw: values.tw, calor: values.calor, color: values.color, ext: values.ext, uv: values.uv ?? "1", hum: values.hum ?? "1", abrE: values.abr ?? "0", liq: values.liq, ch, mech: values.mech, carga: values.carga ?? "static", roce: Boolean(values.roce), rig: values.rig, food: Boolean(values.food), flame: false, fab: "solvo", noz: "260", bed: "100", enc: "0", hard: false, dryer: false, prio: "eq" };
}

export function applyApplicationPreset(answers: RawAnswers, preset: ApplicationPreset): RawAnswers {
  const values = preset.v;
  const ch = Object.fromEntries(CHEM.map(([key]) => [key, String(values.ch?.[key] || 0)])) as Record<ChemicalKey, string>;
  return { ...answers, app: preset.id, tw: String(values.tw), tpk: String(values.tpk), tmin: String(values.tmin), unknownTemperature: false, customTemperature: false, appTw: values.tw, calor: values.calor, color: values.color, ext: values.ext, uv: values.uv || "1", hum: values.hum || "1", abrE: values.abr || "0", liq: values.liq, ch, mech: values.mech, carga: values.carga || "static", roce: Boolean(values.roce), rig: values.rig, food: Boolean(values.food), flame: false };
}

export function deriveConditions(answers: RawAnswers): Conditions {
  const assume: string[] = [];
  const tw = answers.unknownTemperature ? answers.appTw + 10 : numberValue(answers.tw);
  if (answers.unknownTemperature) assume.push(`temperatura de trabajo ${tw} °C (típica de la aplicación + 10 °C)`);
  const tpk = Math.max(numberValue(answers.tpk), tw);
  const tmin = numberValue(answers.tmin);
  let uv = 0;
  let hum = 0;
  let abrE = 0;
  if (answers.ext === "si") {
    uv = Number(answers.uv);
    hum = Number(answers.hum);
    abrE = Number(answers.abrE);
  } else if (answers.ext === "ns") {
    uv = 1;
    hum = 1;
    abrE = 1;
    assume.push("exposición parcial al sol, humedad y polvo");
  }
  const ch = Object.fromEntries(CHEM.map(([key]) => [key, answers.liq === "si" ? Number(answers.ch[key]) : 0])) as Record<ChemicalKey, number>;
  if (answers.liq === "ns") {
    ch.agua = 1;
    ch.aceites = 1;
    assume.push("contacto ocasional con agua y aceites");
  }
  const carga = answers.mech === "si" ? answers.carga : answers.mech === "no" ? "none" : "static";
  if (answers.mech === "ns") assume.push("carga moderada");
  const roce = answers.mech !== "no" && answers.roce;
  const abr = Math.max(abrE, roce ? 2 : 0);
  const equipment = answers.fab === "solvo" ? SOLVO_EQ : { noz: numberValue(answers.noz), bed: numberValue(answers.bed), enc: Number(answers.enc), hard: answers.hard, dryer: answers.dryer };
  const priority = { eq: [1.5, 1.5], cost: [3, 2], perf: [0.3, 0.3] }[answers.prio];
  return { app: answers.app, tw, tpk, tmin, calor: answers.calor, color: answers.color, ext: answers.ext, uv, hum, abrE, liq: answers.liq, ch, mech: answers.mech, carga, roce, abr, rig: answers.rig, food: answers.food, flame: answers.flame, fab: answers.fab, noz: equipment.noz, bed: equipment.bed, enc: equipment.enc, hard: equipment.hard, dryer: equipment.dryer, pcost: priority[0], pease: answers.fab === "solvo" ? priority[1] * 0.5 : priority[1], assume };
}
