import { useState } from "react";
import { BASE, CHEM, COLS } from "../domain/data.ts";
import { materialFieldValue } from "../domain/persistence.ts";
import type { Material } from "../domain/types.ts";

const TABLE_GROUPS = [["Térmica °C", 2], ["Ambiente", 4], ["Química", CHEM.length], ["Mecánica / normas", 6], ["Impresión", 7]] as const;
const SCALE_FIELDS = new Set(["cold", "uv", "hum", "abr", "str", "stf", "tgh", "crp", "flame", "food", "dry", "ease", "conf"]);
const COLUMN_GROUPS = TABLE_GROUPS.flatMap(([, count], group) => Array.from({ length: count }, () => group));

interface CuratorPanelProps {
  materials: readonly Material[];
  hidden: boolean;
  toast: string;
  onCopy: () => void;
  onReset: () => void;
  onCommit: (index: number, key: string, value: number) => void;
}

export default function CuratorPanel({ materials, hidden, toast, onCopy, onReset, onCommit }: CuratorPanelProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const classForColumn = (index: number) => `${index === 0 || COLUMN_GROUPS[index] !== COLUMN_GROUPS[index - 1] ? "gs " : ""}${COLUMN_GROUPS[index] % 2 ? "alt" : ""}`;
  const commit = (cell: string, index: number, key: string, raw: string) => {
    const parsed = Number.parseFloat(raw) || 0;
    if (parsed !== materialFieldValue(materials[index], key)) onCommit(index, key, parsed);
    setDrafts((current) => {
      const next = { ...current };
      delete next[cell];
      return next;
    });
  };

  return <section id="tab-db" hidden={hidden}>
    <div className="tools" style={{ marginTop: 14 }}>
      <button className="btn" id="copyJson" type="button" onClick={onCopy}>Copiar datos (JSON)</button>
      <button className="btn ghost" id="resetDb" type="button" onClick={onReset}>Restablecer valores originales</button>
      <span className="toast" id="toast">{toast}</span>
    </div>
    <div className="legend"><span>Escalas 0–3:</span><span className="v0">0 no resiste / malo</span><span className="v1">1 limitado</span><span>2 bueno</span><span className="v3">3 excelente</span><span>· Temperaturas en °C sobre pieza impresa · Costo 1–5 · Cerramiento: 0 abierta, 1 recomendado, 2 obligatorio, 3 cámara calefaccionada · Confianza 1–3</span></div>
    <div className="tablewrap"><table id="dbt">
      <thead>
        <tr><th>Material</th>{TABLE_GROUPS.map(([label, count], index) => <th key={label} className={`grp gs${index % 2 ? " alt" : ""}`} colSpan={count}>{label}</th>)}</tr>
        <tr><th />{COLS.map(([key, label], index) => <th key={key} className={classForColumn(index)}>{label}</th>)}</tr>
      </thead>
      <tbody>{materials.map((material, materialIndex) => <tr key={material.id}>
        <td><b>{material.id}</b></td>
        {COLS.map(([key], columnIndex) => {
          const value = materialFieldValue(material, key);
          const edited = value !== materialFieldValue(BASE[materialIndex], key);
          const cell = `${materialIndex}_${key}`;
          const classes = [edited ? "edited" : "", SCALE_FIELDS.has(key) || key.startsWith("c.") ? `v${value}` : ""].filter(Boolean).join(" ");
          return <td key={key} className={classForColumn(columnIndex)}><input id={`db_${materialIndex}_${key.replace(".", "_")}`} data-i={materialIndex} data-k={key} className={classes} type="number" value={drafts[cell] ?? String(value)} aria-label={`${material.id} ${key}`} onChange={(event) => setDrafts((current) => ({ ...current, [cell]: event.currentTarget.value }))} onBlur={(event) => commit(cell, materialIndex, key, event.currentTarget.value)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></td>;
        })}
      </tr>)}</tbody>
    </table></div>
    <p className="hint" style={{ marginTop: 10 }}>Los cambios se guardan en este navegador y recalculan el selector al instante. Las celdas modificadas quedan resaltadas.</p>
  </section>;
}
