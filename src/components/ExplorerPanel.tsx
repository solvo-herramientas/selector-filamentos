import { useMemo, useState } from "react";
import { CHA, CHEM, CHS, CONF, ENC, SW } from "../domain/data.ts";
import { CARD_PROPERTIES, exploreMaterials, isExplorerHit, MATRIX_PROPERTIES, PROPS } from "../domain/exploration.ts";
import type { ExplorerView, Material } from "../domain/types.ts";
import { SegmentedControl } from "./SegmentedControl.tsx";

const VIEW_OPTIONS = [{ value: "cards", label: "Fichas" }, { value: "mx", label: "Matriz química" }] as const;
const RATINGS = ["No", "Limitado", "Bueno", "Excelente"] as const;
const MATRIX_RATINGS = ["No", "Limit.", "Bueno", "Exc."] as const;

function ExplorerMessage({ message }: { message: ReturnType<typeof exploreMaterials>["message"] }) {
  if (message.kind === "temperature") return <>Materiales con temperatura de servicio de <b>{message.value} °C</b> o más, primero.</>;
  if (message.kind === "keyword" || message.kind === "manual") return <>Ordenado por <b>{message.label}</b>.</>;
  if (message.kind === "matches") return <>{message.count} material{message.count > 1 ? "es" : ""} con «{message.query}».</>;
  if (message.kind === "empty") return <>No hay materiales con «{message.query}». Probá con una necesidad: nafta, sol, desgaste, impacto, 100 °C.</>;
  return null;
}

function Dots({ value }: { value: number }) {
  return <span className="dots">{[1, 2, 3].map((level) => <i key={level} className={value >= level ? "f" : ""} />)}</span>;
}

export default function ExplorerPanel({ materials, hidden }: { materials: readonly Material[]; hidden: boolean }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [view, setView] = useState<ExplorerView>("cards");
  const exploration = useMemo(() => exploreMaterials(materials, query, sortKey), [materials, query, sortKey]);
  const matrixColumns = MATRIX_PROPERTIES;

  return <section id="tab-exp" hidden={hidden}>
    <div className="xbar">
      <input type="search" id="xq" value={query} placeholder="Buscá por material o necesidad: nafta, sol, desgaste, impacto, 100 °C…" aria-label="Buscar materiales" onChange={(event) => setQuery(event.currentTarget.value)} />
      <select id="xsort" value={sortKey} aria-label="Ordenar por" onChange={(event) => setSortKey(event.currentTarget.value)}>
        <option value="">Orden: por nombre</option>
        {PROPS.map((property) => <option key={property.key} value={property.key}>{property.label}</option>)}
      </select>
      <SegmentedControl name="xview" value={view} options={VIEW_OPTIONS} onChange={(value) => setView(value as ExplorerView)} />
    </div>
    <div className="xinfo" id="xinfo"><ExplorerMessage message={exploration.message} /></div>
    <div id="xcards" className="xgrid" hidden={view !== "cards"}>
      {exploration.materials.map((material) => {
        const property = exploration.property;
        const value = property ? property.value(material) : null;
        const hit = isExplorerHit(material, exploration);
        let badge = null;
        if (property) {
          if (property.key === "tc") badge = <div className={`match ${exploration.hitTemperature != null ? (material.tc >= exploration.hitTemperature ? "c3" : "c0") : "c2"}`}>{property.label}: <b>{material.tc} °C</b></div>;
          else if (property.key === "cheap") badge = <div className="match c2">Costo: <b>{"$".repeat(material.cost)}</b></div>;
          else badge = <div className={`match c${Math.max(0, Math.min(3, value ?? 0))}`}>{property.label}: <b>{RATINGS[Math.max(0, Math.min(3, value ?? 0))]}</b></div>;
        }
        return <article key={material.id} className={`xcard${hit ? " hit" : ""}`}>
          {badge}
          <div className="chead"><span className="sw" style={{ background: SW[material.id] || "#999" }} /><h3>{material.id}</h3><span className="fam">{material.fam}</span><span className="conf" style={{ marginLeft: "auto" }}>{CONF[material.conf] || ""}</span></div>
          <div className="tbar"><span>Servicio</span><div className="bar"><i style={{ width: `${Math.min(100, material.tc / 1.5)}%` }} /></div><b>{material.tc} °C</b></div>
          <div className="note">{material.note}</div>
          <div className="apps-t"><b>Usos típicos:</b> {material.apps}</div>
          <div className="props">{CARD_PROPERTIES.map(([key, label]) => <div key={key} className={`prop${exploration.sortKey === key ? " on" : ""}`}><span>{label}</span><Dots value={material[key as keyof Material] as number} /></div>)}</div>
          <div className="chemstrip" title="Resistencia química">{CHEM.map(([key]) => <span key={key} className={`c${material.c[key]}`} title={CHS[key]}>{CHA[key]}</span>)}</div>
          <div className="print"><span>Boquilla <b>{material.noz} °C</b></span><span>Cama <b>{material.bed} °C</b></span><span>Cerramiento <b>{ENC[material.enc]}</b></span>{material.hard ? <span><b>Boquilla endurecida</b></span> : null}<span>Costo <b>{"$".repeat(material.cost)}</b></span></div>
        </article>;
      })}
    </div>
    <div id="xmx" hidden={view !== "mx"}>
      <div className="legend"><span className="c3">Excelente</span><span className="c2">Bueno</span><span className="c1">Limitado</span><span className="c0">No resiste</span><span>Valores orientativos: dependen de concentración, tiempo y temperatura.</span></div>
      <div className="mxwrap"><table className="mx" id="mxt">
        <thead><tr><th>Material</th>{matrixColumns.map(([key, label], index) => <th key={key} className={`${index === 2 ? "gs " : ""}${exploration.sortKey === key ? "on" : ""}`}>{label}</th>)}</tr></thead>
        <tbody>{exploration.materials.map((material) => <tr key={material.id}><td>{material.id}</td>{matrixColumns.map(([key, , getValue], index) => {
          const level = getValue(material);
          return <td key={key} className={`cell c${level}${index === 2 ? " gs" : ""}`}>{MATRIX_RATINGS[level]}</td>;
        })}</tr>)}</tbody>
      </table></div>
    </div>
  </section>;
}
