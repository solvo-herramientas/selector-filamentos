import { ANNEAL, CHEM } from "./data.ts";
import type { Conditions, EvaluationResult, Exclusion, LimitingCondition, Material, RankedMaterials } from "./types.ts";

export function evaluateMaterial(m: Material, q: Conditions): EvaluationResult {
  const ex: Exclusion[] = [];
  const pro: string[] = [];
  const con: string[] = [];
  const parts: [number, number][] = [];
  const delta = q.calor === "sol" ? (q.color === "oscuro" ? 25 : 10) : q.calor === "rad" ? 15 : q.calor === "cont" ? 10 : 0;
  const Td = q.tw + delta;
  const Tp = q.tpk + delta;
  const loaded = q.carga === "sust" || q.carga === "cyc";
  const lim = loaded ? Math.min(m.tc, m.hdt - 10) : m.tc;
  if (Td > lim) {
    const gap = Td - lim;
    let fix: string | null = null;
    if (ANNEAL.has(m.id) && gap <= 25) fix = "Cumpliría con recocido posterior a la impresión (prever contracción de 1 a 3 %)";
    else if (gap <= 10) fix = `Cumpliría si la temperatura de trabajo no superara ${q.tw - gap} °C`;
    ex.push({ k: "temp", t: `Límite ${lim} °C, menor que la temperatura de diseño ${Td} °C`, fix });
  } else if (Tp > m.hdt + 20) ex.push({ k: "pico", t: `Pico de ${Tp} °C supera su HDT (${m.hdt} °C)`, fix: Tp - (m.hdt + 20) <= 10 ? `Cumpliría si los picos no superaran ${q.tpk - (Tp - (m.hdt + 20))} °C` : null });
  const marg = lim - Td;
  parts.push([2, Math.max(0, Math.min(1, marg / 50 + 0.3))]);
  if (marg >= 40) pro.push(`Margen térmico amplio (+${marg} °C)`);
  else if (marg < 15 && marg >= 0) con.push(`Margen térmico justo (+${marg} °C)`);
  if (q.tmin < 0) {
    if ((q.tmin < -40 && m.cold < 3) || (q.tmin < -20 && m.cold < 2)) ex.push({ k: "frio", t: `Frágil a ${q.tmin} °C` });
    parts.push([q.tmin < -20 ? 2 : 1, m.cold / 3]);
    if (m.cold <= 1) con.push("Se vuelve frágil con frío");
  }
  const uv = Math.max(q.uv, q.calor === "sol" ? 1 : 0);
  if (uv > 0) {
    if (uv === 2 && m.uv === 0) ex.push({ k: "uv", t: "Se degrada con sol permanente", fix: "Cumpliría pintado o con recubrimiento anti-UV" });
    parts.push([uv * 1.5, m.uv / 3]);
    if (m.uv === 3) pro.push("Estable al UV");
    else if (m.uv === 1) con.push(uv === 2 ? "Necesita pintura o recubrimiento anti-UV" : "Sensibilidad UV moderada");
  }
  if (q.hum > 0) {
    parts.push([q.hum, m.hum / 3]);
    if (m.hum === 0) con.push("Absorbe humedad: pierde rigidez y cambia de medida");
  }
  if (q.abr > 0) {
    parts.push([q.abr, m.abr / 3]);
    if (m.abr === 3) pro.push("Muy resistente al desgaste");
    else if (m.abr <= 1 && q.abr === 2) con.push("Se desgasta con el roce");
  }
  CHEM.forEach(([k, label]) => {
    const level = q.ch[k];
    if (!level) return;
    const resistance = m.c[k];
    const lowerLabel = label.toLowerCase();
    if ((level === 2 && resistance <= 1) || (level === 1 && resistance === 0)) ex.push({ k: `chem:${k}`, t: `${resistance === 0 ? "Atacado por" : "Resistencia limitada a"} ${lowerLabel}${level === 2 ? " en inmersión" : ""}`, fix: level === 2 && resistance === 1 ? `Cumpliría si el contacto con ${lowerLabel} fuera ocasional y no sumergido` : null });
    parts.push([level * 1.5, resistance / 3]);
    if (resistance === 3) pro.push(`Resiste ${lowerLabel}`);
    else if (resistance === 1) con.push(`Resistencia limitada a ${lowerLabel}`);
  });
  if (q.rig === "flex") {
    if (!m.flex) ex.push({ k: "flex", t: "No es flexible" });
    parts.push([1, m.tgh / 3]);
  } else {
    if (m.flex) ex.push({ k: "rig", t: "Es elástico; no sirve para pieza rígida" });
    const loadScores: Record<Conditions["carga"], [number, number]> = { none: [0.5, (m.str + m.stf) / 6], static: [1.5, (2 * m.str + m.stf) / 9], sust: [2, (2 * m.crp + m.str) / 9], cyc: [2, (m.tgh + m.crp + m.str) / 9], imp: [2, (2 * m.tgh + m.str) / 9] };
    parts.push(loadScores[q.carga]);
    if (q.carga === "sust" && m.crp <= 1) con.push("Fluye (creep) bajo carga permanente");
    if (q.carga === "sust" && m.crp === 3) pro.push("Baja fluencia bajo carga");
    if (q.carga === "imp" && m.tgh === 3) pro.push("Alta tenacidad al impacto");
    if (q.carga === "imp" && m.tgh <= 1) con.push("Frágil al impacto");
  }
  if (q.food) {
    if (m.food < 1) ex.push({ k: "food", t: "No apto para alimentos" });
    else con.push("Alimentos: usar grado certificado y sellar la superficie");
  }
  if (q.flame && m.flame < 2) ex.push({ k: "flame", t: "No es autoextinguible" });
  if (q.flame && m.flame >= 2) pro.push("Autoextinguible");
  const eqfix = q.fab === "yo" ? "Cumpliría encargándola a SOLVO, con el equipo adecuado" : null;
  if (m.noz > q.noz) ex.push({ k: "eq", t: `Requiere boquilla a ${m.noz} °C`, fix: eqfix });
  if (m.bed > q.bed) ex.push({ k: "eq", t: `Requiere cama a ${m.bed} °C`, fix: eqfix });
  if (m.enc === 3 && q.enc < 2) ex.push({ k: "eq", t: "Requiere cámara calefaccionada", fix: eqfix });
  if (m.enc === 2 && q.enc < 1) ex.push({ k: "eq", t: "Requiere impresora cerrada", fix: eqfix });
  if (m.hard && !q.hard) ex.push({ k: "eq", t: "Requiere boquilla endurecida (abrasivo)", fix: eqfix });
  let ease = m.ease;
  if (q.fab === "yo") {
    if (m.enc === 1 && q.enc < 1) {
      ease--;
      con.push("Conviene imprimir con cerramiento");
    }
    if (m.dry === 3 && !q.dryer) {
      ease--;
      con.push("Muy higroscópico: secar antes de imprimir");
    }
    if (m.ease === 0) con.push("Impresión difícil");
  }
  parts.push([q.pcost, (5 - m.cost) / 4]);
  parts.push([q.pease, Math.max(0, ease) / 3]);
  let sw = 0;
  let ss = 0;
  parts.forEach(([weight, score]) => {
    sw += weight;
    ss += weight * score;
  });
  const fixes = [...new Set(ex.map((entry) => entry.fix))];
  const casi = ex.length > 0 && fixes.length === 1 && fixes[0] != null;
  return { m, ex, pro, con, score: sw ? Math.round((100 * ss) / sw) : 0, lim, Td, delta, casi, fix: casi ? fixes[0] as string : null };
}

export function labelLimitingCondition(key: string): string {
  if (key.startsWith("chem:")) return `el contacto con ${CHEM.find(([chemicalKey]) => chemicalKey === key.slice(5))![1].toLowerCase()}`;
  return ({ temp: "la temperatura de trabajo", pico: "los picos de temperatura", frio: "el frío extremo", uv: "el sol permanente", flex: "que sea flexible", rig: "que sea rígida", food: "el contacto con alimentos", flame: "que sea autoextinguible", eq: "el equipo de impresión disponible" } as Record<string, string>)[key];
}

export function rankMaterials(materials: readonly Material[], conditions: Conditions): RankedMaterials {
  const results = materials.map((material) => evaluateMaterial(material, conditions));
  const sortByScore = (left: EvaluationResult, right: EvaluationResult) => right.score - left.score;
  const ok = results.filter((result) => !result.ex.length).sort(sortByScore);
  const casi = results.filter((result) => result.casi).sort(sortByScore);
  const no = results.filter((result) => result.ex.length > 0 && !result.casi);
  const counts = new Map<string, number>();
  results.forEach((result) => new Set(result.ex.map(({ k }) => k)).forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1)));
  const limits: LimitingCondition[] = [...counts].sort((left, right) => right[1] - left[1]).map(([key, count]) => ({ key, label: labelLimitingCondition(key), count }));
  return { results, ok, casi, no, limits };
}

export function manufacturingRecommendations(result: EvaluationResult, q: Conditions): string[] {
  const m = result.m;
  const recommendations: string[] = [];
  if (q.carga !== "none" && q.rig === "rig") recommendations.push("Orientá la pieza para que la carga principal actúe a lo largo de las capas y no las separe: la unión entre capas resiste entre 50 y 70 % del material.");
  if (["static", "sust", "cyc"].includes(q.carga)) recommendations.push("Usá 4 a 6 perímetros y 40 % de relleno o más en las zonas cargadas.");
  if (q.carga === "cyc" || q.carga === "imp") recommendations.push("Redondeá las esquinas internas (radio de 1 mm o más) para evitar fisuras.");
  if (ANNEAL.has(m.id) && result.lim - result.Td < 15) recommendations.push("Considerá recocer la pieza: sube la temperatura admisible, con 1 a 3 % de contracción.");
  if (q.uv > 0 && m.uv < 3) recommendations.push("Si va al sol todo el día, pintala o aplicá un recubrimiento anti-UV.");
  if (Object.values(q.ch).some((value) => value === 2)) recommendations.push("En zonas sumergidas usá 100 % de relleno o 5 perímetros o más, para que el líquido no penetre entre capas.");
  if (q.food) recommendations.push("Para alimentos: filamento con certificación, boquilla de acero inoxidable y sellado de la superficie con resina apta.");
  if (m.hard) recommendations.push("Boquilla endurecida obligatoria: la fibra desgasta una de bronce en pocas horas.");
  if (m.dry >= 1) recommendations.push(`Secá el filamento antes de imprimir: ${m.dryp}.`);
  if (q.carga !== "none" && q.rig === "rig") recommendations.push("Para uniones que se arman y desarman, usá insertos roscados de latón colocados con calor.");
  return recommendations.slice(0, 6);
}
