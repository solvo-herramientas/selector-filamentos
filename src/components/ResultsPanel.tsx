import { useEffect, useRef, useState, type Ref, type RefObject } from "react";
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
  const className = `card${top ? " top" : ""}${kind === "casi" ? " casi" : ""}`;
  return <article className={className}>
    <div className="rank">{kind === "casi" ? "casi" : index + 1}</div><div className="cbody">
      <div className="chead"><span className="sw" style={{ background: SW[material.id] || "#999" }} /><h3>{material.id}</h3><span className="fam">{material.fam}</span><span className="score">{result.score}/100</span>
        <label className="cmp" htmlFor={`cmp_${index}_${kind}`}><input type="checkbox" id={`cmp_${index}_${kind}`} data-cmp={material.id} checked={selected} onChange={(event) => onComparisonToggle(material.id, event.currentTarget.checked)} /> Comparar</label></div>
      <div className="bar"><i style={{ width: `${result.score}%` }} /></div>
      {kind === "casi" && <div className="fix"><b>Falla:</b> {result.ex.map((entry) => entry.t).join(" · ")}<br /><b>Solución:</b> {result.fix}</div>}
      <div className="temps"><span>Límite {result.lim} °C · HDT {material.hdt} °C · diseño {result.Td} °C</span><span className="conf">{CONF[material.conf] || ""}</span></div>
      {(result.pro.length > 0 || result.con.length > 0) && <div className="chips">{result.pro.map((text) => <span key={`pro-${text}`} className="chip pro">{text}</span>)}{result.con.map((text) => <span key={`con-${text}`} className="chip con">{text}</span>)}</div>}
      <div className="note">{material.note}</div>
      {top && <div className="recs"><h4>Cómo fabricarla</h4><ul>{manufacturingRecommendations(result, conditions).map((text) => <li key={text}>{text}</li>)}</ul></div>}
      <div className="print"><span>Boquilla <b>{material.noz} °C</b></span><span>Cama <b>{material.bed} °C</b></span><span>Cerramiento <b>{ENC[material.enc]}</b></span><span>Secado <b>{material.dryp}</b></span>{material.hard ? <span><b>Boquilla endurecida</b></span> : null}<span>Costo <b>{"$".repeat(material.cost)}</b></span></div>
    </div>
  </article>;
}

export default function ResultsPanel({ conditions, ranked, selectedIds, comparisonHint, onComparisonToggle, onComparisonClear, rootRef, headingRef }: ResultsPanelProps) {
  const [quoteToast, setQuoteToast] = useState("");
  const quoteRef = useRef<HTMLPreElement>(null);
  const quoteToastTimer = useRef<number | undefined>(undefined);
  const delta = ranked.results[0]?.delta ?? 0;
  const designTemperature = conditions.tw + delta;
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
  return <div className="results" id="results" ref={rootRef}>
    <h2 className="results-heading" id="results-heading" ref={headingRef} tabIndex={-1}>Resultados de la selección</h2>
    <div className="summary" id="summary">
      <div className="kpis"><div><span className="k">Temp. de diseño</span><b>{designTemperature} °C</b></div><div><span className="k">Cumplen</span><b>{ranked.ok.length}</b></div><div><span className="k">Casi</span><b>{ranked.casi.length}</b></div><div><span className="k">Descartados</span><b>{ranked.no.length}</b></div></div>
      <div className="why">{delta ? `${conditions.tw} °C de trabajo + ${delta} °C por ${conditions.calor === "sol" ? "sol directo" : conditions.calor === "rad" ? "calor radiante" : "contacto con superficie caliente"}${conditions.calor === "sol" ? ` sobre pieza ${conditions.color === "oscuro" ? "oscura" : "clara"}` : ""}.` : `${conditions.tw} °C de trabajo, sin aporte de calor adicional.`}{conditions.fab === "solvo" ? " Fabricación por encargo: no hay restricciones de equipo." : ""}</div>
      {conditions.assume.length > 0 && <div className="assume">Supuestos por respuestas «no sé»: {conditions.assume.join("; ")}.</div>}
    </div>
    {ranked.limits.length > 0 && <div className="limit" id="limit">Lo que más restringe tu selección es <b>{ranked.limits[0].label}</b>: deja afuera {ranked.limits[0].count} de {ranked.results.length} materiales.{ranked.limits[1] ? ` Le sigue ${ranked.limits[1].label} (${ranked.limits[1].count}).` : ""}</div>}
    <ComparisonPanel results={selectedResults} conditions={conditions} onClear={onComparisonClear} />
    <div className="sect"><span>Cumplen todas las condiciones</span><span id="cmpHint">{compareHint}</span></div>
    <div className="cards" id="cards">{ranked.ok.length ? ranked.ok.map((result, index) => <MaterialCard key={result.m.id} result={result} index={index} kind="ok" conditions={conditions} selected={selectedIds.includes(result.m.id)} onComparisonToggle={onComparisonToggle} />) : <div className="empty">Ningún material cumple todas las condiciones. Mirá los que «casi cumplen» y la condición que más restringe: suele bastar con un recubrimiento, un recocido o aflojar una exigencia.</div>}</div>
    <div className="sect" id="casiHead" hidden={!ranked.casi.length}><span>Casi cumplen</span></div>
    <div className="cards" id="casi">{ranked.casi.map((result, index) => <MaterialCard key={result.m.id} result={result} index={index} kind="casi" conditions={conditions} selected={selectedIds.includes(result.m.id)} onComparisonToggle={onComparisonToggle} />)}</div>
    <details className="excl"><summary id="exclsum">Descartados ({ranked.no.length}) y motivo</summary><div className="exlist" id="exlist">{ranked.no.map((result) => <div className="ex" key={result.m.id}><b>{result.m.id}</b><span>{result.ex.map((entry) => entry.t).join(" · ")}</span></div>)}</div></details>
    <div className="cta">
      <h4>¿Necesitás esta pieza?</h4>
      <p>Enviá la consulta con tus condiciones y los materiales sugeridos a SOLVO para validar el diseño y cotizar: por WhatsApp, o copiala y pegala en un mail.</p>
      <pre id="quote" ref={quoteRef}>{quotation}</pre>
      <div className="tools">
        <a className="btn hot" id="waBtn" href={`https://wa.me/5492645484363?text=${encodeURIComponent(quotation)}`} target="_blank" rel="noopener">Enviar por WhatsApp</a>
        <button className="btn" type="button" id="copyQuote" onClick={copyQuote}>Copiar consulta</button>
        <button className="btn ghost" type="button" id="printBtn" hidden={isFramed()} onClick={() => window.print()}>Imprimir informe</button>
        <span className="toast" id="qtoast">{quoteToast}</span>
      </div>
      <div className="contact"><span>WhatsApp <b>+54 9 264 548-4363</b></span><span>Mail <b>contacto@solvo.ar</b></span><span>Web <b>solvo.ar</b></span><span>Instagram <b>@solvo.fabricacionesdigitales</b></span></div>
    </div>
  </div>;
}
