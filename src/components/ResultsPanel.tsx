import { useEffect, useRef, useState, type Ref, type RefObject } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CONF, ENC, SW } from "../domain/data.ts";
import { manufacturingRecommendations } from "../domain/evaluation.ts";
import { quotationText } from "../domain/exploration.ts";
import type { Conditions, EvaluationResult, RankedMaterials } from "../domain/types.ts";
import ComparisonPanel from "./ComparisonPanel.tsx";

interface ResultsPanelProps {
  conditions: Conditions;
  ranked: RankedMaterials;
  selectedIds: readonly string[];
  comparisonHint?: string;
  onComparisonToggle: (id: string, checked: boolean) => void;
  onComparisonClear: () => void;
  rootRef: Ref<HTMLDivElement>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

function isFramed(): boolean {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return true;
  }
}

function MaterialCard({ result, index, kind, conditions, selected, onComparisonToggle }: { result: EvaluationResult; index: number; kind: "ok" | "casi"; conditions: Conditions; selected: boolean; onComparisonToggle: (id: string, checked: boolean) => void }) {
  const material = result.m;
  const top = kind === "ok" && index === 0;
  const className = cn("group/material grid grid-cols-[52px_minmax(0,1fr)] overflow-hidden", top && "border-primary shadow-[0_0_0_1px_var(--hot)]", kind === "casi" && "border-dashed border-warn");
  return <Card asChild className={className}><article data-kind={kind} data-top={top}>
    <div className="grid place-items-center bg-secondary font-display [font-stretch:62%] text-[32px] font-extrabold text-muted-foreground group-data-[top=true]/material:bg-primary group-data-[top=true]/material:text-primary-foreground group-data-[kind=casi]/material:rotate-180 group-data-[kind=casi]/material:bg-warn-soft group-data-[kind=casi]/material:text-[15px] group-data-[kind=casi]/material:[font-stretch:80%] group-data-[kind=casi]/material:uppercase group-data-[kind=casi]/material:tracking-[.08em] group-data-[kind=casi]/material:text-warn group-data-[kind=casi]/material:[writing-mode:vertical-rl]">{kind === "casi" ? "casi" : index + 1}</div><div className="grid min-w-0 gap-2 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 [&_h3]:m-0 [&_h3]:font-display [&_h3]:[font-stretch:85%] [&_h3]:text-xl [&_h3]:font-[750]"><span className="size-3.5 flex-none rounded-full border border-separator" style={{ background: SW[material.id] || "#999" }} /><h3>{material.id}</h3><span className="text-[12.5px] text-muted-foreground">{material.fam}</span><span className="ml-auto font-mono text-[15px] font-semibold tabular-nums">{result.score}/100</span>
        <div className="flex cursor-pointer items-center gap-[5px] text-xs text-muted-foreground print:hidden!"><Checkbox id={`cmp_${index}_${kind}`} data-cmp={material.id} aria-label={`Comparar ${material.id}`} className="relative before:absolute before:left-0 before:top-1/2 before:size-3.5 before:-translate-y-1/2 before:rounded-[2px] before:border before:border-input before:bg-card before:content-[''] data-[state=checked]:before:border-foreground data-[state=checked]:before:bg-foreground [&>[data-state=checked]]:absolute [&>[data-state=checked]]:left-0 [&>[data-state=checked]]:top-1/2 [&>[data-state=checked]]:-translate-y-1/2 [&>[data-state=checked]]:text-background [&>span:last-child]:pl-5 inline-flex size-auto min-h-4 w-auto gap-0 rounded-none border-0 bg-transparent p-0 text-muted-foreground data-[state=checked]:bg-transparent" checked={selected} onCheckedChange={(checked) => onComparisonToggle(material.id, checked === true)}><span>Comparar</span></Checkbox></div></div>
      <div className="h-[5px] overflow-hidden rounded-sm bg-secondary [&>i]:block [&>i]:h-full [&>i]:bg-primary motion-safe:[&>i]:transition-[width] motion-safe:[&>i]:duration-300"><i style={{ width: `${result.score}%` }} /></div>
      {kind === "casi" && <div className="rounded-sm bg-warn-soft px-2.5 py-[7px] text-[13px] text-foreground [&_b]:text-warn"><b>Falla:</b> {result.ex.map((entry) => entry.t).join(" · ")}<br /><b>Solución:</b> {result.fix}</div>}
      <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground"><span>Límite {result.lim} °C · HDT {material.hdt} °C · diseño {result.Td} °C</span><span className="rounded-[10px] border border-input px-[7px] py-px font-sans text-[11.5px]">{CONF[material.conf] || ""}</span></div>
      {(result.pro.length > 0 || result.con.length > 0) && <div className="flex flex-wrap gap-[5px]">{result.pro.map((text) => <Badge key={`pro-${text}`} variant="success">{text}</Badge>)}{result.con.map((text) => <Badge key={`con-${text}`} variant="warning">{text}</Badge>)}</div>}
      <div className="text-[12.5px] text-muted-foreground">{material.note}</div>
      {top && <div className="rounded-md bg-hot-soft px-3 py-2.5 [&_h4]:m-0 [&_h4]:mb-1.5 [&_h4]:font-mono [&_h4]:text-[11px] [&_h4]:uppercase [&_h4]:tracking-[.08em] [&_h4]:text-hot-ink [&_ul]:m-0 [&_ul]:grid [&_ul]:gap-[3px] [&_ul]:pl-[18px] [&_ul]:text-[13px]"><h4>Cómo fabricarla</h4><ul>{manufacturingRecommendations(result, conditions).map((text) => <li key={text}>{text}</li>)}</ul></div>}
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 border-0 border-t border-dashed border-input pt-[7px] font-mono text-[11.5px] text-muted-foreground [&_b]:font-medium [&_b]:text-foreground"><span>Boquilla <b>{material.noz} °C</b></span><span>Cama <b>{material.bed} °C</b></span><span>Cerramiento <b>{ENC[material.enc]}</b></span><span>Secado <b>{material.dryp}</b></span>{material.hard ? <span><b>Boquilla endurecida</b></span> : null}<span>Costo <b>{"$".repeat(material.cost)}</b></span></div>
    </div>
  </article></Card>;
}

export default function ResultsPanel({ conditions, ranked, selectedIds, comparisonHint, onComparisonToggle, onComparisonClear, rootRef, headingRef }: ResultsPanelProps) {
  const [quoteToast, setQuoteToast] = useState("");
  const quoteRef = useRef<HTMLPreElement>(null);
  const quoteToastTimer = useRef<number | undefined>(undefined);
  const quotation = quotationText(conditions, ranked);
  const selectedResults = selectedIds.map((id) => ranked.results.find((result) => result.m.id === id)).filter((result): result is EvaluationResult => result !== undefined);
  const compareHint = comparisonHint ?? (selectedIds.length ? `Comparando ${selectedIds.length} de 3` : "Marcá hasta 3 para comparar");
  useEffect(() => () => { if (quoteToastTimer.current !== undefined) window.clearTimeout(quoteToastTimer.current); }, []);
  const showQuoteToast = (message: string) => {
    if (quoteToastTimer.current !== undefined) window.clearTimeout(quoteToastTimer.current);
    setQuoteToast(message);
    quoteToastTimer.current = window.setTimeout(() => setQuoteToast(""), 4000);
  };
  const selectQuoteFallback = () => {
    try {
      const selection = window.getSelection();
      if (!quoteRef.current || !selection) {
        showQuoteToast("El navegador bloqueó la copia");
        return;
      }
      const range = document.createRange();
      range.selectNodeContents(quoteRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
      showQuoteToast("Texto seleccionado: copialo con Ctrl+C");
    } catch {
      showQuoteToast("El navegador bloqueó la copia");
    }
  };
  const copyQuote = () => {
    try {
      navigator.clipboard.writeText(quotation).then(() => showQuoteToast("Consulta copiada. Pegala en un mail a contacto@solvo.ar."), selectQuoteFallback);
    } catch {
      selectQuoteFallback();
    }
  };
  return <div className="grid min-w-0 gap-3 print:static print:max-h-none print:overflow-visible" id="results" ref={rootRef}>
    <h2 className="m-0 font-display [font-stretch:85%] text-2xl font-[750] focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" id="results-heading" ref={headingRef} tabIndex={-1}>Resultados de la selección</h2>
    {ranked.limits.length > 0 && <div className="rounded-md border border-input border-l-4 border-l-primary bg-card px-3.5 py-2.5 text-[13px] [&_b]:font-[650]" id="limit">Lo que más restringe tu selección es <b>{ranked.limits[0].label}</b>: deja afuera {ranked.limits[0].count} de {ranked.results.length} materiales.{ranked.limits[1] ? ` Le sigue ${ranked.limits[1].label} (${ranked.limits[1].count}).` : ""}</div>}
    <ComparisonPanel results={selectedResults} conditions={conditions} onClear={onComparisonClear} />
    <div className="-mb-1 mt-1.5 flex flex-wrap justify-between gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-muted-foreground"><span>Cumplen todas las condiciones</span><span id="cmpHint">{compareHint}</span></div>
    <div className="grid gap-2.5" id="cards">{ranked.ok.length ? ranked.ok.map((result, index) => <MaterialCard key={result.m.id} result={result} index={index} kind="ok" conditions={conditions} selected={selectedIds.includes(result.m.id)} onComparisonToggle={onComparisonToggle} />) : <div className="rounded-md bg-bad-soft p-3.5 text-bad">Ningún material cumple todas las condiciones. Mirá los que «casi cumplen» y la condición que más restringe: suele bastar con un recubrimiento, un recocido o aflojar una exigencia.</div>}</div>
    <div className="-mb-1 mt-1.5 flex flex-wrap justify-between gap-2 font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-muted-foreground" id="casiHead" hidden={!ranked.casi.length}><span>Casi cumplen</span></div>
    <div className="grid gap-2.5" id="casi">{ranked.casi.map((result, index) => <MaterialCard key={result.m.id} result={result} index={index} kind="casi" conditions={conditions} selected={selectedIds.includes(result.m.id)} onComparisonToggle={onComparisonToggle} />)}</div>
    <details className="rounded-md border border-input bg-card print:hidden [&_summary]:cursor-pointer [&_summary]:px-3.5 [&_summary]:py-[11px] [&_summary]:font-semibold"><summary id="exclsum">Descartados ({ranked.no.length}) y motivo</summary><div className="grid px-3.5 pb-2.5" id="exlist">{ranked.no.map((result) => <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-2.5 border-0 border-t border-solid border-input py-[7px] text-[12.5px] [&_b]:font-display [&_b]:[font-stretch:85%] [&_b]:text-sm [&_span]:text-bad" key={result.m.id}><b>{result.m.id}</b><span>{result.ex.map((entry) => entry.t).join(" · ")}</span></div>)}</div></details>
    <div className="grid gap-2.5 rounded-md border border-foreground bg-card px-4 py-3.5 [&_h4]:m-0 [&_h4]:font-display [&_h4]:[font-stretch:85%] [&_h4]:text-lg [&_h4]:font-[750] [&_p]:m-0 [&_p]:text-[13px] [&_p]:text-muted-foreground [&_pre]:m-0 [&_pre]:max-h-[180px] [&_pre]:select-all [&_pre]:overflow-auto [&_pre]:whitespace-pre-wrap [&_pre]:rounded-sm [&_pre]:bg-background [&_pre]:p-2.5 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-normal">
      <h4>¿Necesitás esta pieza?</h4>
      <p>Enviá la consulta con tus condiciones y los materiales sugeridos a SOLVO para validar el diseño y cotizar: por WhatsApp, o copiala y pegala en un mail.</p>
      <pre id="quote" ref={quoteRef}>{quotation}</pre>
      <div data-slot="quote-tools" className="flex flex-wrap items-center gap-2 print:hidden!">
        <Button asChild variant="hot" id="waBtn"><a href={`https://wa.me/5492645484363?text=${encodeURIComponent(quotation)}`} target="_blank" rel="noopener">Enviar por WhatsApp</a></Button>
        <Button type="button" id="copyQuote" onClick={copyQuote}>Copiar consulta</Button>
        <Button type="button" variant="ghost" id="printBtn" hidden={isFramed()} onClick={() => window.print()}>Imprimir informe</Button>
        <span className="text-[12.5px] text-ok" id="qtoast">{quoteToast}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] [&_b]:select-all [&_b]:font-mono [&_b]:font-medium"><span>WhatsApp <b>+54 9 264 548-4363</b></span><span>Mail <b>contacto@solvo.ar</b></span><span>Web <b>solvo.ar</b></span><span>Instagram <b>@solvo.fabricacionesdigitales</b></span></div>
    </div>
  </div>;
}
