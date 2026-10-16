import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import logo from "../logo-solvo.png";
import SelectorForm from "./components/SelectorForm.tsx";
import ResultsPanel from "./components/ResultsPanel.tsx";
import WizardActions from "./components/WizardActions.tsx";
import ExplorerPanel from "./components/ExplorerPanel.tsx";
import CuratorPanel from "./components/CuratorPanel.tsx";
import { deriveConditions } from "./domain/conditions.ts";
import { rankMaterials } from "./domain/evaluation.ts";
import { clearComparisonSelection, updateComparisonSelection } from "./domain/exploration.ts";
import { answersChanged, createInitialWizard, nextStepId, stepDescription, stepProgress, stepTitle, validateAllSteps, wizardReducer, type ScreenId, type StepId, type WizardState } from "./domain/filamentSelectionFlow.ts";
import { cloneMaterials, getBrowserStorage, loadCuratorAccess, loadMaterialDatabase, resetMaterialDatabase, saveCuratorAccess, saveMaterialDatabase, setMaterialField } from "./domain/persistence.ts";
import type { RawAnswers } from "./domain/types.ts";

type TabKey = "sel" | "exp" | "db";

function SiteBar() {
  return <div className="sitebar"><div className="in">
    <a href="https://solvo.ar" aria-label="Ir a solvo.ar"><img src={logo} alt="SOLVO Fabricaciones Digitales" height="36" /></a>
    <div className="links">
      <a className="back" href="https://solvo.ar" target="_blank" rel="noopener">solvo.ar</a>
      <a className="cafe" href="https://cafecito.app/solvo" target="_blank" rel="noopener">☕ <span className="long">¿Te sirvió? Invitanos un </span>cafecito</a>
      <a className="wa" href="https://wa.me/5492645484363?text=Hola%2C%20vengo%20del%20Selector%20de%20Filamentos." target="_blank" rel="noopener">Contactanos</a>
    </div>
  </div></div>;
}

function SiteHeader({ onOpenMethod }: { onOpenMethod: () => void }) {
  return <header>
    <div className="header-title">
      <h1>Selector de <span>Filamentos</span></h1>
    </div>
    <TabNavigation onOpenMethod={onOpenMethod} />
  </header>;
}

function TabNavigation({ onOpenMethod }: { onOpenMethod: () => void }) {
  return <nav className="help-navigation" aria-label="Ayuda">
    <button type="button" aria-label="Cómo funciona" aria-haspopup="dialog" aria-controls="methodology-dialog" title="Cómo funciona" onClick={onOpenMethod}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none">
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.8 9a2.25 2.25 0 1 1 3.84 1.6c-.98.99-1.64 1.25-1.64 2.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.7" r=".9" fill="currentColor" />
      </svg>
      <span className="help-label">Cómo funciona</span>
    </button>
  </nav>;
}

function Methodology({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);
  useEffect(() => () => { if (closeTimer.current !== undefined) window.clearTimeout(closeTimer.current); }, []);
  const requestClose = () => {
    if (closeTimer.current !== undefined) return;
    const dialog = dialogRef.current;
    if (!dialog) { onClose(); return; }
    const duration = window.getComputedStyle(dialog).transitionDuration.split(",").reduce((longest, value) => { const time = value.trim(); const milliseconds = Number.parseFloat(time) * (time.endsWith("ms") ? 1 : 1000); return Math.max(longest, milliseconds); }, 0);
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      dialogRef.current?.close();
      closeTimer.current = undefined;
      setClosing(false);
      onClose();
    }, 200);
  };
  return <dialog id="methodology-dialog" ref={dialogRef} className={`methodology-dialog${closing ? " is-closing" : ""}`} aria-labelledby="methodology-title" onCancel={(event) => { event.preventDefault(); requestClose(); }} onClick={(event) => { if (event.target === event.currentTarget) requestClose(); }}>
    <div className="methodology-dialog-header">
      <h2 id="methodology-title">Cómo funciona</h2>
      <button type="button" className="methodology-close" aria-label="Cerrar" onClick={requestClose}>×</button>
    </div>
    <div className="doc methodology-content">
      <p>Primero descarta los materiales que no pueden cumplir una condición: temperatura por encima de su límite, inmersión en un agente que lo ataca, UV permanente sobre un material que se degrada, o un requisito de equipo que no está disponible. Después ordena los que quedan con un puntaje ponderado de 0 a 100.</p>
      <h2>Casi cumplen</h2>
      <p>Un material descartado por una sola condición que tiene solución práctica aparece como «casi cumple», con la solución indicada: recubrimiento anti-UV, recocido, una temperatura de trabajo apenas menor, contacto ocasional en vez de inmersión, o fabricarla con un equipo mejor.</p>
      <h2>Temperatura de diseño</h2>
      <p>A la temperatura de trabajo se le suma un incremento según la fuente de calor: sol directo +25 °C en piezas oscuras y +10 °C en claras, calor radiante +15 °C, contacto con superficie caliente +10 °C. Si no sabés la temperatura, se usa la típica de la aplicación más 10 °C. Con carga sostenida o cíclica, el límite del material es el menor entre su temperatura de servicio continuo y su HDT menos 10 °C. Los picos ocasionales se comparan contra el HDT más 20 °C.</p>
      <h2>Agentes químicos</h2>
      <p>Una salpicadura descarta solo a los materiales calificados como «no resiste». La inmersión descarta también a los de resistencia limitada. Si respondés «no sé», se supone contacto ocasional con agua y aceites.</p>
      <h2>Alcance</h2>
      <ul>
        <li>Los valores son típicos por familia sobre pieza impresa, no de una marca en particular.</li>
        <li>La impresión agrega anisotropía: la resistencia entre capas puede caer al 50–70 % de la del material inyectado.</li>
        <li>El recocido mejora la temperatura admisible de PLA y poliamidas, pero contrae y puede deformar la pieza.</li>
        <li>Para piezas críticas, el resultado es una preselección que se valida con ensayo.</li>
      </ul>
    </div>
  </dialog>;
}

function CuratorToggle({ curatorAccess, curatorHash, onCuratorClick }: { curatorAccess: boolean; curatorHash: boolean; onCuratorClick: () => void }) {
  if (!curatorAccess && !curatorHash) return null;
  return <button type="button" className="curator-toggle" id="curBtn" onClick={onCuratorClick}>{curatorAccess ? "Salir del modo curador" : "Modo curador"}</button>;
}

function OutgoingScreen({ screen, className }: { screen: ScreenId; className: string }) {
  const progress = screen === "results" ? null : stepProgress(screen as StepId);
  return <div className={className} aria-hidden="true" inert>
    {progress && <div className="progress">Paso {progress.current} de {progress.total}</div>}
    <h2 className="qt">{stepTitle(screen)}</h2>
    <p className="qd">{stepDescription(screen)}</p>
  </div>;
}

function activeMotionClass(state: WizardState): string {
  if (!state.transition) return "wizard-panel";
  return "wizard-panel wizard-" + state.transition.direction + " is-" + state.transition.phase;
}

function outgoingMotionClass(state: WizardState): string {
  if (!state.transition) return "wizard-outgoing";
  return "wizard-outgoing wizard-" + state.transition.direction + " is-" + state.transition.phase;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("sel");
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [database, setDatabase] = useState(() => loadMaterialDatabase(getBrowserStorage));
  const [curatorHash] = useState(() => typeof window !== "undefined" && window.location.hash === "#curador");
  const [curatorAccess, setCuratorAccess] = useState(() => loadCuratorAccess(getBrowserStorage, typeof window === "undefined" ? "" : window.location.hash));
  const [curatorToast, setCuratorToast] = useState("");
  const [wizard, dispatchWizard] = useReducer(wizardReducer, undefined, createInitialWizard);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonHint, setComparisonHint] = useState<string>();
  const [actionsHeight, setActionsHeight] = useState(0);
  const curatorToastTimer = useRef<number | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousFocusTarget = useRef<string>("questions:application");
  const submittedAnswers = useRef<RawAnswers | null>(null);
  const nextStep = nextStepId(wizard.activeStep);
  const conditions = useMemo(() => wizard.phase === "results" ? deriveConditions(wizard.answers) : null, [wizard.phase, wizard.answers]);
  const ranked = useMemo(() => conditions ? rankMaterials(database, conditions) : null, [database, conditions]);
  useEffect(() => { saveCuratorAccess(getBrowserStorage, curatorAccess); }, [curatorAccess]);
  useEffect(() => () => { if (curatorToastTimer.current !== undefined) window.clearTimeout(curatorToastTimer.current); }, []);
  useEffect(() => {
    if (wizard.phase !== "results") return;
    if (answersChanged(submittedAnswers.current, wizard.answers)) {
      setSelectedIds(clearComparisonSelection());
      setComparisonHint(undefined);
    }
    submittedAnswers.current = wizard.answers;
  }, [wizard.phase, wizard.answers]);
  useEffect(() => {
    const target = wizard.phase + ":" + wizard.activeStep;
    if (target === previousFocusTarget.current) return;
    previousFocusTarget.current = target;
    if (wizard.phase === "results") resultsHeadingRef.current?.focus();
    else questionHeadingRef.current?.focus();
  }, [wizard.phase, wizard.activeStep]);
  useEffect(() => {
    const transition = wizard.transition;
    if (!transition) return;
    const id = transition.id;
    if (transition.phase === "preparing") {
      const frame = window.requestAnimationFrame(() => dispatchWizard({ type: "transition-start", id }));
      return () => window.cancelAnimationFrame(frame);
    }
    const timer = window.setTimeout(() => dispatchWizard({ type: "transition-complete", id }), 240);
    return () => window.clearTimeout(timer);
  }, [wizard.transition]);
  const showCuratorToast = (message: string) => {
    if (curatorToastTimer.current !== undefined) window.clearTimeout(curatorToastTimer.current);
    setCuratorToast(message);
    curatorToastTimer.current = window.setTimeout(() => setCuratorToast(""), 2500);
  };
  const handleContinue = (source: "pointer" | "keyboard") => {
    if (nextStep === null && !validateAllSteps(wizard) && answersChanged(submittedAnswers.current, wizard.answers)) {
      setSelectedIds(clearComparisonSelection());
      setComparisonHint(undefined);
    }
    dispatchWizard({ type: "continue", source });
  };
  const toggleComparison = (id: string, checked: boolean) => {
    const selection = updateComparisonSelection(selectedIds, id, checked);
    setSelectedIds(selection.selectedIds);
    setComparisonHint(selection.limitExceeded ? "Máximo 3: quitá uno para agregar otro" : undefined);
  };
  const clearComparison = () => {
    setSelectedIds(clearComparisonSelection());
    setComparisonHint(undefined);
  };
  const updateMaterial = (index: number, key: string, value: number) => {
    const next = cloneMaterials(database);
    setMaterialField(next[index], key, value);
    setDatabase(next);
    saveMaterialDatabase(getBrowserStorage, next);
  };
  const resetDatabase = () => {
    setDatabase(resetMaterialDatabase(getBrowserStorage));
    showCuratorToast("Valores restablecidos");
  };
  const copyDatabase = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(database, null, 1)).then(() => showCuratorToast("Datos copiados al portapapeles"), () => showCuratorToast("El navegador bloqueó la copia"));
    } catch {
      showCuratorToast("El navegador bloqueó la copia");
    }
  };
  const toggleCurator = () => {
    const next = !curatorAccess;
    setCuratorAccess(next);
    if (next) setActiveTab("db");
    else if (activeTab === "db") setActiveTab("sel");
  };
  const panelTransition = wizard.transition?.source === "pointer" ? wizard.transition : null;
  const outgoingScreen = panelTransition?.outgoing ?? null;
  const actionsStyle = { "--wizard-actions-height": actionsHeight + "px" } as CSSProperties;
  return <>
    <SiteBar />
    <div className="wrap">
      <SiteHeader onOpenMethod={() => setMethodologyOpen(true)} />
      <section id="tab-sel" className="selector-tab" style={actionsStyle} hidden={activeTab !== "sel"}>
        <div className="wizard-stack">
          {outgoingScreen && <OutgoingScreen className={outgoingMotionClass(wizard)} screen={outgoingScreen} />}
          <div key={wizard.phase + ":" + wizard.activeStep} className={activeMotionClass(wizard)}>
            {wizard.phase === "questions" ? <SelectorForm stepId={wizard.activeStep} progress={stepProgress(wizard.activeStep)} answers={wizard.answers} selectedApplication={wizard.selectedApplication} errors={wizard.errors} headingRef={questionHeadingRef} onAnswerChange={(key, value) => dispatchWizard({ type: "update-answer", key, value })} onApplicationSelect={(id) => dispatchWizard({ type: "select-application", id })} onContinue={() => handleContinue("keyboard")} /> : conditions && ranked ? <ResultsPanel rootRef={resultsRef} headingRef={resultsHeadingRef} conditions={conditions} ranked={ranked} selectedIds={selectedIds} comparisonHint={comparisonHint} onComparisonToggle={toggleComparison} onComparisonClear={clearComparison} /> : null}
          </div>
        </div>
        {activeTab === "sel" && <WizardActions phase={wizard.phase} firstStep={wizard.activeStep === "application"} finalStep={wizard.phase === "questions" && nextStep === null} applicationSelected={wizard.selectedApplication !== null} onHeightChange={setActionsHeight} onBack={(source) => dispatchWizard({ type: "back", source })} onContinue={handleContinue} onEdit={(source) => dispatchWizard({ type: "edit", source })} onRestart={(source) => { clearComparison(); dispatchWizard({ type: "restart", source }); }} />}
      </section>
      <ExplorerPanel materials={database} hidden={activeTab !== "exp"} />
      <Methodology open={methodologyOpen} onClose={() => setMethodologyOpen(false)} />
      <CuratorPanel materials={database} hidden={activeTab !== "db"} toast={curatorToast} onCopy={copyDatabase} onReset={resetDatabase} onCommit={updateMaterial} />
      <CuratorToggle curatorAccess={curatorAccess} curatorHash={curatorHash} onCuratorClick={toggleCurator} />
    </div>
  </>;
}
