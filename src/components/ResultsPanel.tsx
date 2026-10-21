import { useState, type Ref, type RefObject } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconChevronDown } from "@tabler/icons-react";
import { CONF, ENC, SW } from "../domain/data.ts";
import { manufacturingRecommendations } from "../domain/evaluation.ts";
import type { Conditions, EvaluationResult, RankedMaterials } from "../domain/types.ts";
import ComparisonPanel from "./ComparisonPanel.tsx";

interface ResultsPanelProps {
  conditions: Conditions;
  ranked: RankedMaterials;
  selectedIds: readonly string[];
  comparisonHint?: string;
  comparisonOpen: boolean;
  onComparisonOpenChange: (open: boolean) => void;
  onComparisonToggle: (id: string, checked: boolean) => void;
  onComparisonClear: () => void;
  rootRef: Ref<HTMLDivElement>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

function MaterialCard({ result, index, kind, conditions, selected, onComparisonToggle }: { result: EvaluationResult; index: number; kind: "ok" | "casi"; conditions: Conditions; selected: boolean; onComparisonToggle: (id: string, checked: boolean) => void }) {
  const material = result.m;
  const top = kind === "ok" && index === 0;
  const collapsible = kind === "ok" && !top;
  const [expanded, setExpanded] = useState(false);
  const showDetails = !collapsible || expanded;
  const detailsId = `material-details-${kind}-${material.id.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}`;
  const headingClassName = "flex flex-wrap items-center gap-x-3 gap-y-1.5 [&_h3]:m-0 [&_h3]:font-display [&_h3]:[font-stretch:85%] [&_h3]:text-xl [&_h3]:font-[750]";
  const cardTitle = <><span className="size-3.5 flex-none rounded-full border border-separator" style={{ background: SW[material.id] || "#999" }} /><h3>{material.id}</h3><span className="text-[12.5px] text-muted-foreground">{material.fam}</span></>;
  const rankScore = <span className="flex items-center gap-2 font-mono text-[15px] font-semibold tabular-nums">{kind === "ok" && <span className="text-sm font-bold text-primary">#{index + 1}</span>}<span>{result.score}/100</span></span>;
  const compareControl = <Button type="button" size="sm" variant={selected ? "hot" : "ghost"} className="w-full print:hidden!" aria-pressed={selected} aria-label={`Comparar ${material.id}`} data-cmp={material.id} onClick={() => onComparisonToggle(material.id, !selected)}>Comparar</Button>;
  const thermalSummary = <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground"><span>Límite {result.lim} °C · HDT {material.hdt} °C · diseño {result.Td} °C</span><span className="rounded-[10px] border border-input px-[7px] py-px font-sans text-[11.5px]">{CONF[material.conf] || ""}</span></div>;
  const className = cn("group/material grid min-w-0 overflow-hidden", kind === "ok" ? "grid-cols-1" : "grid-cols-[52px_minmax(0,1fr)]", top && "border-primary shadow-[0_0_0_1px_var(--hot)]", kind === "casi" && "border-dashed border-warn");
  return <Card asChild className={className}><article data-kind={kind} data-top={top}>
    {kind === "casi" && <div className="grid place-items-center bg-warn-soft font-display [font-stretch:80%] text-[15px] uppercase tracking-[.08em] text-warn [writing-mode:vertical-rl]">casi</div>}<div className="grid min-w-0 gap-2 px-3.5 py-3">
      {collapsible ? <button type="button" aria-expanded={showDetails} aria-controls={detailsId} onClick={() => setExpanded((value) => !value)} className="grid w-full min-w-0 cursor-pointer gap-2 rounded-sm border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><div className={headingClassName}>{cardTitle}<span className="ml-auto">{rankScore}</span><IconChevronDown aria-hidden="true" className={cn("size-4 flex-none text-muted-foreground transition-transform duration-[var(--motion-duration)] [transition-timing-function:var(--ease-out)] motion-reduce:transition-none", showDetails && "rotate-180")} /></div>{thermalSummary}</button> : <><div className={headingClassName}>{cardTitle}<span className="ml-auto">{rankScore}</span></div>{thermalSummary}</>}
      {kind === "casi" && <div className="rounded-sm bg-warn-soft px-2.5 py-[7px] text-[13px] text-foreground [&_b]:text-warn"><b>Falla:</b> {result.ex.map((entry) => entry.t).join(" · ")}<br /><b>Solución:</b> {result.fix}</div>}
      <div id={detailsId} aria-hidden={!showDetails} inert={!showDetails} className={cn("grid min-h-0 overflow-hidden transition-[grid-template-rows,opacity] [transition-duration:var(--motion-duration)] [transition-timing-function:var(--ease-out)] motion-reduce:transition-opacity motion-reduce:duration-100", showDetails ? "opacity-100" : "opacity-0")} style={{ gridTemplateRows: showDetails ? "1fr" : "0fr" }}><div className="grid min-h-0 gap-2 overflow-hidden">{(result.pro.length > 0 || result.con.length > 0) && <div className="flex flex-wrap gap-[5px]">{result.pro.map((text) => <Badge key={`pro-${text}`} variant="success">{text}</Badge>)}{result.con.map((text) => <Badge key={`con-${text}`} variant="warning">{text}</Badge>)}</div>}<div className="text-[12.5px] text-muted-foreground">{material.note}</div>{top && <div className="rounded-md bg-hot-soft px-3 py-2.5 [&_h4]:m-0 [&_h4]:mb-1.5 [&_h4]:font-mono [&_h4]:text-[11px] [&_h4]:uppercase [&_h4]:tracking-[.08em] [&_h4]:text-hot-ink [&_ul]:m-0 [&_ul]:grid [&_ul]:gap-[3px] [&_ul]:pl-[18px] [&_ul]:text-[13px]"><h4>Cómo fabricarla</h4><ul>{manufacturingRecommendations(result, conditions).map((text) => <li key={text}>{text}</li>)}</ul></div>}<div className="flex flex-wrap gap-1.5"><Badge className="gap-1.5 border border-input px-2 py-1 font-mono text-[11.5px] font-normal text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">Boquilla <b>{material.noz} °C</b></Badge><Badge className="gap-1.5 border border-input px-2 py-1 font-mono text-[11.5px] font-normal text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">Cama <b>{material.bed} °C</b></Badge><Badge className="gap-1.5 border border-input px-2 py-1 font-mono text-[11.5px] font-normal text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">Cerramiento <b>{ENC[material.enc]}</b></Badge><Badge className="gap-1.5 border border-input px-2 py-1 font-mono text-[11.5px] font-normal text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">Secado <b>{material.dryp}</b></Badge>{material.hard ? <Badge className="border border-input px-2 py-1 font-mono text-[11.5px] font-semibold">Boquilla endurecida</Badge> : null}<Badge className="gap-1.5 border border-input px-2 py-1 font-mono text-[11.5px] font-normal text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">Costo <b>{"$".repeat(material.cost)}</b></Badge></div>{compareControl}</div></div>
    </div>
  </article></Card>;
}

export default function ResultsPanel({ conditions, ranked, selectedIds, comparisonHint, comparisonOpen, onComparisonOpenChange, onComparisonToggle, onComparisonClear, rootRef, headingRef }: ResultsPanelProps) {
  const selectedResults = selectedIds.map((id) => ranked.results.find((result) => result.m.id === id)).filter((result): result is EvaluationResult => result !== undefined);
  const compareHint = comparisonHint ?? (selectedIds.length ? `Comparando ${selectedIds.length} de 3` : "Marcá hasta 3 para comparar");
  return <div className={cn("grid min-w-0 gap-3 print:static print:max-h-none print:overflow-visible", selectedResults.length >= 2 && "pb-14")} id="results" ref={rootRef}>
    <h2 className="m-0 font-display [font-stretch:85%] text-2xl font-[750] focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" id="results-heading" ref={headingRef} tabIndex={-1}>Resultados de la selección</h2>
    {ranked.limits.length > 0 && <div className="rounded-md border border-input border-l-4 border-l-primary bg-card px-3.5 py-2.5 text-[13px] [&_b]:font-[650]" id="limit">Lo que más restringe tu selección es <b>{ranked.limits[0].label}</b>: deja afuera {ranked.limits[0].count} de {ranked.results.length} materiales.{ranked.limits[1] ? ` Le sigue ${ranked.limits[1].label} (${ranked.limits[1].count}).` : ""}</div>}
    <ComparisonPanel results={selectedResults} conditions={conditions} open={comparisonOpen} onOpenChange={onComparisonOpenChange} onClear={onComparisonClear} />
    <div className="-mb-1 mt-1.5 flex flex-wrap justify-between gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-muted-foreground"><span>Cumplen todas las condiciones</span><span id="cmpHint">{compareHint}</span></div>
    <div className="grid gap-2.5" id="cards">{ranked.ok.length ? ranked.ok.map((result, index) => <MaterialCard key={result.m.id} result={result} index={index} kind="ok" conditions={conditions} selected={selectedIds.includes(result.m.id)} onComparisonToggle={onComparisonToggle} />) : <div className="rounded-md bg-bad-soft p-3.5 text-bad">Ningún material cumple todas las condiciones. Mirá los que «casi cumplen» y la condición que más restringe: suele bastar con un recubrimiento, un recocido o aflojar una exigencia.</div>}</div>
    <div className="-mb-1 mt-1.5 flex flex-wrap justify-between gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-muted-foreground" id="casiHead" hidden={!ranked.casi.length}><span>Casi cumplen</span></div>
    <div className="grid gap-2.5" id="casi">{ranked.casi.map((result, index) => <MaterialCard key={result.m.id} result={result} index={index} kind="casi" conditions={conditions} selected={selectedIds.includes(result.m.id)} onComparisonToggle={onComparisonToggle} />)}</div>
    <details className="rounded-md border border-input bg-card print:hidden [&_summary]:cursor-pointer [&_summary]:px-3.5 [&_summary]:py-[11px] [&_summary]:font-semibold"><summary id="exclsum">Descartados ({ranked.no.length}) y motivo</summary><div className="grid px-3.5 pb-2.5" id="exlist">{ranked.no.map((result) => <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-2.5 border-0 border-t border-solid border-input py-[7px] text-[12.5px] [&_b]:font-display [&_b]:[font-stretch:85%] [&_b]:text-sm [&_span]:text-bad" key={result.m.id}><b>{result.m.id}</b><span>{result.ex.map((entry) => entry.t).join(" · ")}</span></div>)}</div></details>
  </div>;
}
