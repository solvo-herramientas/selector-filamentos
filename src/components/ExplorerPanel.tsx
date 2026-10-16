import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { CHA, CHEM, CHS, CONF, ENC, SW } from "../domain/data.ts";
import { CARD_PROPERTIES, exploreMaterials, isExplorerHit, MATRIX_PROPERTIES, PROPS } from "../domain/exploration.ts";
import type { ExplorerView, Material } from "../domain/types.ts";
import { SegmentedControl } from "./SegmentedControl.tsx";

const VIEW_OPTIONS = [{ value: "cards", label: "Fichas" }, { value: "mx", label: "Matriz química" }] as const;
const RATINGS = ["No", "Limitado", "Bueno", "Excelente"] as const;
const RATING_VARIANTS = ["destructive", "warning", "default", "success"] as const;
const RATING_CLASSES = ["bg-bad-soft text-bad", "bg-warn-soft text-warn", "bg-secondary text-foreground", "bg-ok-soft text-ok"] as const;
const MATRIX_RATINGS = ["No", "Limit.", "Bueno", "Exc."] as const;

function ExplorerMessage({ message }: { message: ReturnType<typeof exploreMaterials>["message"] }) {
  if (message.kind === "temperature") return <>Materiales con temperatura de servicio de <b>{message.value} °C</b> o más, primero.</>;
  if (message.kind === "keyword" || message.kind === "manual") return <>Ordenado por <b>{message.label}</b>.</>;
  if (message.kind === "matches") return <>{message.count} material{message.count > 1 ? "es" : ""} con «{message.query}».</>;
  if (message.kind === "empty") return <>No hay materiales con «{message.query}». Probá con una necesidad: nafta, sol, desgaste, impacto, 100 °C.</>;
  return null;
}

function Dots({ value }: { value: number }) {
  return <span className="flex gap-[3px] [&_i]:size-[9px] [&_i]:rounded-full [&_i]:border [&_i]:border-input [&_i]:bg-secondary">{[1, 2, 3].map((level) => <i key={level} className={value >= level ? "border-foreground! bg-foreground! group-data-[active=true]/property:border-hot-ink! group-data-[active=true]/property:bg-hot-ink!" : ""} />)}</span>;
}

export default function ExplorerPanel({ materials, hidden }: { materials: readonly Material[]; hidden: boolean }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [view, setView] = useState<ExplorerView>("cards");
  const exploration = useMemo(() => exploreMaterials(materials, query, sortKey), [materials, query, sortKey]);
  const matrixColumns = MATRIX_PROPERTIES;

  return <section id="tab-exp" hidden={hidden}>
    <div className="mt-[18px] grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2.5 [@media(max-width:700px)]:grid-cols-1">
      <Input className="h-auto rounded-sm bg-card px-3 py-2.5 font-sans text-[15px]" type="search" id="xq" value={query} placeholder="Buscá por material o necesidad: nafta, sol, desgaste, impacto, 100 °C…" aria-label="Buscar materiales" onChange={(event) => setQuery(event.currentTarget.value)} />
      <NativeSelect id="xsort" value={sortKey} aria-label="Ordenar por" onChange={(event) => setSortKey(event.currentTarget.value)}>
        <option value="">Orden: por nombre</option>
        {PROPS.map((property) => <option key={property.key} value={property.key}>{property.label}</option>)}
      </NativeSelect>
      <SegmentedControl name="xview" value={view} options={VIEW_OPTIONS} ariaLabel="Vista de exploración" onChange={(value) => setView(value as ExplorerView)} />
    </div>
    <div className="mt-2.5 min-h-[1.4em] text-[13px] text-muted-foreground [&_b]:text-foreground" id="xinfo"><ExplorerMessage message={exploration.message} /></div>
    <div id="xcards" className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3" hidden={view !== "cards"}>
      {exploration.materials.map((material) => {
        const property = exploration.property;
        const value = property ? property.value(material) : null;
        const hit = isExplorerHit(material, exploration);
        let badge = null;
        if (property) {
          if (property.key === "tc") badge = <Badge className="px-2.5 py-1.5 text-[13px] [&_b]:font-bold" variant={exploration.hitTemperature != null ? (material.tc >= exploration.hitTemperature ? "success" : "destructive") : "default"}>{property.label}: <b>{material.tc} °C</b></Badge>;
          else if (property.key === "cheap") badge = <Badge className="px-2.5 py-1.5 text-[13px] [&_b]:font-bold">Costo: <b>{"$".repeat(material.cost)}</b></Badge>;
          else badge = <Badge className="px-2.5 py-1.5 text-[13px] [&_b]:font-bold" variant={RATING_VARIANTS[Math.max(0, Math.min(3, value ?? 0))]}>{property.label}: <b>{RATINGS[Math.max(0, Math.min(3, value ?? 0))]}</b></Badge>;
        }
        return <Card asChild key={material.id} className={cn("grid content-start gap-2.5 p-3.5", hit && "border-foreground shadow-[inset_0_0_0_1px_var(--ink)]")}><article>
          {badge}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 [&_h3]:m-0 [&_h3]:font-display [&_h3]:[font-stretch:85%] [&_h3]:text-xl [&_h3]:font-[750]"><span className="size-3.5 flex-none rounded-full border border-separator" style={{ background: SW[material.id] || "#999" }} /><h3>{material.id}</h3><span className="text-[12.5px] text-muted-foreground">{material.fam}</span><span className="ml-auto rounded-[10px] border border-input px-[7px] py-px font-sans text-[11.5px]">{CONF[material.conf] || ""}</span></div>
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-xs text-muted-foreground [&_b]:font-mono [&_b]:font-semibold [&_b]:text-foreground"><span>Servicio</span><div className="h-1.5 overflow-hidden rounded-sm bg-secondary [&>i]:block [&>i]:h-full [&>i]:bg-primary motion-safe:[&>i]:transition-[width] motion-safe:[&>i]:duration-300"><i style={{ width: `${Math.min(100, material.tc / 1.5)}%` }} /></div><b>{material.tc} °C</b></div>
          <div className="text-[12.5px] text-muted-foreground">{material.note}</div>
          <div className="text-[12.5px] [&_b]:font-semibold"><b>Usos típicos:</b> {material.apps}</div>
          <div className="grid grid-cols-2 gap-x-3.5 gap-y-1">{CARD_PROPERTIES.map(([key, label]) => <div key={key} data-active={exploration.sortKey === key} className="group/property grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 text-xs text-muted-foreground data-[active=true]:font-semibold data-[active=true]:text-foreground"><span>{label}</span><Dots value={material[key as keyof Material] as number} /></div>)}</div>
          <div className="grid grid-cols-9 gap-0.5 [&_span]:rounded-[2px] [&_span]:py-1 [&_span]:text-center [&_span]:font-mono [&_span]:text-[9.5px] [&_span]:font-semibold" title="Resistencia química">{CHEM.map(([key]) => <span key={key} className={RATING_CLASSES[material.c[key]]} title={CHS[key]}>{CHA[key]}</span>)}</div>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 border-0 border-t border-dashed border-input pt-[7px] font-mono text-[11.5px] text-muted-foreground [&_b]:font-medium [&_b]:text-foreground"><span>Boquilla <b>{material.noz} °C</b></span><span>Cama <b>{material.bed} °C</b></span><span>Cerramiento <b>{ENC[material.enc]}</b></span>{material.hard ? <span><b>Boquilla endurecida</b></span> : null}<span>Costo <b>{"$".repeat(material.cost)}</b></span></div>
        </article></Card>;
      })}
    </div>
    <div id="xmx" hidden={view !== "mx"}>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground"><span className="rounded-[2px] px-2 py-0.5 font-semibold bg-ok-soft text-ok">Excelente</span><span className="rounded-[2px] px-2 py-0.5 font-semibold bg-secondary text-foreground">Bueno</span><span className="rounded-[2px] px-2 py-0.5 font-semibold bg-warn-soft text-warn">Limitado</span><span className="rounded-[2px] px-2 py-0.5 font-semibold bg-bad-soft text-bad">No resiste</span><span>Valores orientativos: dependen de concentración, tiempo y temperatura.</span></div>
      <div className="mt-2 overflow-x-auto rounded-md border border-input bg-card"><Table className="min-w-[900px] [&_th]:bg-secondary [&_th]:font-mono [&_th]:text-[10.5px] [&_th]:uppercase [&_th]:tracking-[.03em] [&_:is(th,td)]:px-1.5 [&_:is(th,td)]:py-[7px] [&_:is(th,td):first-child]:sticky [&_:is(th,td):first-child]:left-0 [&_:is(th,td):first-child]:bg-card [&_:is(th,td):first-child]:px-3 [&_:is(th,td):first-child]:text-left [&_:is(th,td):first-child]:font-[650] [&_th:first-child]:bg-secondary" id="mxt">
        <TableHeader><TableRow><TableHead>Material</TableHead>{matrixColumns.map(([key, label], index) => <TableHead key={key} className={cn(index === 2 && "border-l-2 border-l-separator", exploration.sortKey === key && "text-hot-ink")}>{label}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{exploration.materials.map((material) => <TableRow key={material.id}><TableCell>{material.id}</TableCell>{matrixColumns.map(([key, , getValue], index) => {
          const level = getValue(material);
          return <TableCell key={key} className={cn("text-xs font-semibold", RATING_CLASSES[level], index === 2 && "border-l-2 border-l-separator")}>{MATRIX_RATINGS[level]}</TableCell>;
        })}</TableRow>)}</TableBody>
      </Table></div>
    </div>
  </section>;
}
