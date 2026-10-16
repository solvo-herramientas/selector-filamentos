import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  const classForColumn = (index: number) => cn((index === 0 || COLUMN_GROUPS[index] !== COLUMN_GROUPS[index - 1]) && "border-l-2 border-l-separator", COLUMN_GROUPS[index] % 2 && "bg-band");
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
    <div className="mt-3.5 flex flex-wrap items-center gap-2">
      <Button id="copyJson" type="button" onClick={onCopy}>Copiar datos (JSON)</Button>
      <Button variant="ghost" id="resetDb" type="button" onClick={onReset}>Restablecer valores originales</Button>
      <span className="text-[12.5px] text-ok" id="toast">{toast}</span>
    </div>
    <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground"><span>Escalas 0–3:</span><span className="text-bad">0 no resiste / malo</span><span className="text-warn">1 limitado</span><span>2 bueno</span><span className="text-ok">3 excelente</span><span>· Temperaturas en °C sobre pieza impresa · Costo 1–5 · Cerramiento: 0 abierta, 1 recomendado, 2 obligatorio, 3 cámara calefaccionada · Confianza 1–3</span></div>
    <div className="mt-[18px] overflow-x-auto rounded-md border border-input bg-card"><Table id="dbt" className="min-w-[1700px] text-xs [&_:is(th,td)]:px-[3px] [&_:is(th,td)]:py-1 [&_th]:sticky [&_th]:top-0 [&_th]:bg-secondary [&_th]:font-mono [&_th]:text-[10.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[.03em] [&_th]:text-muted-foreground [&_:is(th,td):first-child]:sticky [&_:is(th,td):first-child]:left-0 [&_:is(th,td):first-child]:z-1 [&_:is(th,td):first-child]:bg-card [&_:is(th,td):first-child]:px-2.5 [&_:is(th,td):first-child]:text-left [&_:is(th,td):first-child]:text-[13px] [&_th:first-child]:bg-secondary [&_th.bg-band]:bg-band [&_th.text-hot-ink]:text-hot-ink">
      <TableHeader>
        <TableRow><TableHead>Material</TableHead>{TABLE_GROUPS.map(([label, count], index) => <TableHead key={label} className={cn("text-hot-ink border-l-2 border-l-separator", index % 2 && "bg-band")} colSpan={count}>{label}</TableHead>)}</TableRow>
        <TableRow><TableHead />{COLS.map(([key, label], index) => <TableHead key={key} className={classForColumn(index)}>{label}</TableHead>)}</TableRow>
      </TableHeader>
      <TableBody>{materials.map((material, materialIndex) => <TableRow key={material.id}>
        <TableCell><b>{material.id}</b></TableCell>
        {COLS.map(([key], columnIndex) => {
          const value = materialFieldValue(material, key);
          const edited = value !== materialFieldValue(BASE[materialIndex], key);
          const cell = `${materialIndex}_${key}`;
          const classes = cn(edited && "bg-hot-soft border-primary", (SCALE_FIELDS.has(key) || key.startsWith("c.")) && (value === 0 ? "font-semibold text-bad" : value === 1 ? "font-semibold text-warn" : value === 3 ? "font-semibold text-ok" : ""));
          return <TableCell key={key} className={classForColumn(columnIndex)}><Input id={`db_${materialIndex}_${key.replace(".", "_")}`} data-i={materialIndex} data-k={key} className={cn("h-auto min-w-[54px] rounded-sm bg-background px-1 py-1.5 text-center text-sm tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 hover:border-muted-foreground", classes)} type="number" value={drafts[cell] ?? String(value)} aria-label={`${material.id} ${key}`} onChange={(event) => setDrafts((current) => ({ ...current, [cell]: event.currentTarget.value }))} onBlur={(event) => commit(cell, materialIndex, key, event.currentTarget.value)} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} /></TableCell>;
        })}
      </TableRow>)}</TableBody>
    </Table></div>
    <p className="mt-2.5 text-xs text-muted-foreground">Los cambios se guardan en este navegador y recalculan el selector al instante. Las celdas modificadas quedan resaltadas.</p>
  </section>;
}
