import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import logo from "../logo-solvo.png";
import SelectorForm from "./components/SelectorForm.tsx";
import ResultsPanel from "./components/ResultsPanel.tsx";
import WizardActions from "./components/WizardActions.tsx";
import ExplorerPanel from "./components/ExplorerPanel.tsx";
import CuratorPanel from "./components/CuratorPanel.tsx";
import { deriveConditions } from "./domain/conditions.ts";
import { rankMaterials } from "./domain/evaluation.ts";
import { clearComparisonSelection, quotationText, updateComparisonSelection } from "./domain/exploration.ts";
import { answersChanged, createInitialWizard, nextStepId, stepDescription, stepProgress, stepTitle, validateAllSteps, wizardReducer, type StepId, type WizardState } from "./domain/filamentSelectionFlow.ts";
import { cloneMaterials, getBrowserStorage, loadCuratorAccess, loadMaterialDatabase, resetMaterialDatabase, saveCuratorAccess, saveMaterialDatabase, setMaterialField } from "./domain/persistence.ts";
import type { RawAnswers } from "./domain/types.ts";

type TabKey = "sel" | "exp" | "db";

function SiteBar() {
  return <div className="bg-white text-[#222] shadow-[0_2px_10px_rgba(0,0,0,.08)] ml-[calc(-1*max(16px,env(safe-area-inset-left,0px)))] mr-[calc(-1*max(16px,env(safe-area-inset-right,0px)))] py-3 pl-[max(16px,env(safe-area-inset-left,0px))] pr-[max(16px,env(safe-area-inset-right,0px))] [&_a]:font-medium [&_a]:no-underline [&_a:hover]:text-[#b8860b] [&_img]:block [&_img]:h-9 [&_img]:w-auto [@media(max-width:560px)]:[&_img]:h-[30px]"><div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3">
    <a href="https://solvo.ar" aria-label="Ir a solvo.ar"><img src={logo} alt="SOLVO Fabricaciones Digitales" height="36" /></a>
    <div className="flex flex-wrap items-center gap-x-[18px] gap-y-1.5 text-[13px]">
      <a className="[@media(max-width:560px)]:hidden" href="https://solvo.ar" target="_blank" rel="noopener">solvo.ar</a>
      <a className="border-0 border-b border-dotted border-[#c4c9cf] text-[12.5px] text-[#6b7280]! font-normal! hover:text-[#222]!" href="https://cafecito.app/solvo" target="_blank" rel="noopener">☕ <span className="[@media(max-width:560px)]:hidden">¿Te sirvió? Invitanos un </span>cafecito</a>
      <a className="rounded-lg bg-[#febf2c] px-3.5 py-[7px] font-bold! hover:bg-[#e8ac25] hover:text-[#222]!" href="https://wa.me/5492645484363?text=Hola%2C%20vengo%20del%20Selector%20de%20Filamentos." target="_blank" rel="noopener">Contactanos</a>
    </div>
  </div></div>;
}

function SiteHeader({ onOpenMethod, progress }: { onOpenMethod: () => void; progress: { current: number; total: number } }) {
  const progressRatio = progress.current / progress.total;
  return <header className="grid gap-3 pt-[22px]">
    <div className="flex flex-wrap items-end justify-between gap-3 [@media(max-width:800px)]:items-start">
      <div className="min-w-0">
        <h1 className="m-0 font-display [font-stretch:72%] text-[clamp(28px,4.5vw,44px)] font-extrabold uppercase leading-[.95] tracking-[-.01em] text-balance">Selector de <span className="bg-primary px-[.12em] text-primary-foreground box-decoration-clone">Filamentos</span></h1>
      </div>
      <TabNavigation onOpenMethod={onOpenMethod} />
    </div>
    <div role="progressbar" aria-label="Progreso del selector" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.current} aria-valuetext={`Paso ${progress.current} de ${progress.total}`} className="h-1 w-full overflow-hidden rounded-full bg-secondary">
      <div aria-hidden="true" className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-(--motion-duration) ease-linear motion-reduce:duration-100" style={{ transform: `scaleX(${progressRatio})` }} />
    </div>
  </header>;
}

function TabNavigation({ onOpenMethod }: { onOpenMethod: () => void }) {
  return <nav className="m-0 flex flex-wrap justify-end gap-1 print:hidden!" aria-label="Ayuda">
    <Button id="methodology-trigger" type="button" variant="ghost" className="h-[38px] rounded-sm px-3 py-[7px] text-[13px] text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground [@media(max-width:800px)]:size-[38px] [@media(max-width:800px)]:rounded-full [@media(max-width:800px)]:p-0" aria-label="Cómo funciona" aria-haspopup="dialog" aria-controls="methodology-dialog" title="Cómo funciona" onClick={onOpenMethod}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" fill="none">
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.8 9a2.25 2.25 0 1 1 3.84 1.6c-.98.99-1.64 1.25-1.64 2.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.7" r=".9" fill="currentColor" />
      </svg>
      <span className="whitespace-nowrap [@media(max-width:800px)]:hidden">Cómo funciona</span>
    </Button>
  </nav>;
}

function Methodology({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Drawer open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }} swipeDirection="down" triggerId="methodology-trigger">
    <DrawerContent id="methodology-dialog">
      <DrawerHeader className="flex-row items-center justify-between gap-4 border-b border-solid border-input bg-card px-4 py-3">
        <DrawerTitle className="m-0 font-display [font-stretch:80%] text-[22px] font-[750]">Cómo funciona</DrawerTitle>
        <DrawerClose render={<Button type="button" variant="ghost" className="size-9 flex-none rounded-full border border-input bg-transparent p-0 text-2xl font-normal leading-none text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground" aria-label="Cerrar" />}>×</DrawerClose>
      </DrawerHeader>
      <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overscroll-contain">
        <div className="grid min-w-0 w-full content-start gap-3.5 px-4 pt-[18px] pb-7 text-[14.5px] [&_h2]:mb-0 [&_h2]:mt-2.5 [&_h2]:font-display [&_h2]:[font-stretch:80%] [&_h2]:text-[22px] [&_h2]:font-[750] [&_p]:m-0 [&_ul]:m-0 [&_li]:mb-1">
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
      </div>
    </DrawerContent>
  </Drawer>;
}

function CuratorToggle({ curatorAccess, curatorHash, onCuratorClick }: { curatorAccess: boolean; curatorHash: boolean; onCuratorClick: () => void }) {
  if (!curatorAccess && !curatorHash) return null;
  return <Button type="button" variant="ghost" className="mt-3 ml-auto print:hidden! h-auto min-h-0 w-fit rounded-none border-0 bg-transparent p-0 text-xs font-medium text-muted-foreground underline hover:bg-transparent" id="curBtn" onClick={onCuratorClick}>{curatorAccess ? "Salir del modo curador" : "Modo curador"}</Button>;
}

function activeMotionClass(state: WizardState): string {
  return cn("min-w-0 opacity-100 [transform:translateX(0)] transition-[transform,opacity] duration-(--motion-duration) ease-wizard motion-reduce:transform-none! motion-reduce:transition-opacity print:transform-none! print:opacity-100!", state.transition?.phase === "preparing" && (state.transition.direction === "forward" ? "opacity-0 [transform:translateX(8px)]" : "opacity-0 [transform:translateX(-8px)]"));
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
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonHint, setComparisonHint] = useState<string>();
  const [actionsHeight, setActionsHeight] = useState(0);
  const curatorToastTimer = useRef<number | undefined>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousFocusTarget = useRef<string>("questions:application");
  const submittedAnswers = useRef<RawAnswers | null>(null);
  const nextStep = nextStepId(wizard.activeStep);
  const progress = stepProgress(wizard.activeStep);
  const conditions = useMemo(() => wizard.phase === "results" ? deriveConditions(wizard.answers) : null, [wizard.phase, wizard.answers]);
  const ranked = useMemo(() => conditions ? rankMaterials(database, conditions) : null, [database, conditions]);
  const whatsAppHref = useMemo(() => conditions && ranked ? `https://wa.me/5492645484363?text=${encodeURIComponent(quotationText(conditions, ranked))}` : "", [conditions, ranked]);
  useEffect(() => { saveCuratorAccess(getBrowserStorage, curatorAccess); }, [curatorAccess]);
  useEffect(() => () => { if (curatorToastTimer.current !== undefined) window.clearTimeout(curatorToastTimer.current); }, []);
  useEffect(() => {
    if (wizard.phase !== "results") return;
    if (answersChanged(submittedAnswers.current, wizard.answers)) {
      setSelectedIds(clearComparisonSelection());
      setComparisonOpen(false);
      setComparisonHint(undefined);
    }
    submittedAnswers.current = wizard.answers;
  }, [wizard.phase, wizard.answers]);
  useEffect(() => {
    const target = wizard.phase + ":" + wizard.activeStep;
    if (target === previousFocusTarget.current) return;
    previousFocusTarget.current = target;
    if (wizard.phase === "results") resultsHeadingRef.current?.focus({ preventScroll: true });
    else questionHeadingRef.current?.focus({ preventScroll: true });
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
      setComparisonOpen(false);
      setComparisonHint(undefined);
    }
    dispatchWizard({ type: "continue", source });
  };
  const toggleComparison = (id: string, checked: boolean) => {
    const selection = updateComparisonSelection(selectedIds, id, checked);
    setSelectedIds(selection.selectedIds);
    if (selection.selectedIds.length < 2) setComparisonOpen(false);
    setComparisonHint(selection.limitExceeded ? "Máximo 3: quitá uno para agregar otro" : undefined);
  };
  const clearComparison = () => {
    setSelectedIds(clearComparisonSelection());
    setComparisonOpen(false);
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
  const actionsStyle = { "--wizard-actions-height": actionsHeight + "px" } as CSSProperties;
  return <>
    <SiteBar />
    <div className="mx-auto max-w-[1320px]">
      <SiteHeader onOpenMethod={() => setMethodologyOpen(true)} progress={progress} />
      <section id="tab-sel" className="mt-[18px] pb-[calc(var(--wizard-actions-height,0px)+16px)] print:pb-0!" style={actionsStyle} hidden={activeTab !== "sel"}>
        <div className="-mx-2 min-w-0 overflow-x-clip px-2 print:static print:overflow-visible">
          <div key={wizard.phase + ":" + wizard.activeStep} className={activeMotionClass(wizard)}>
            {wizard.phase === "questions" ? <SelectorForm stepId={wizard.activeStep} progress={stepProgress(wizard.activeStep)} answers={wizard.answers} selectedApplication={wizard.selectedApplication} errors={wizard.errors} headingRef={questionHeadingRef} onAnswerChange={(key, value) => dispatchWizard({ type: "update-answer", key, value })} onApplicationSelect={(id) => dispatchWizard({ type: "select-application", id })} onContinue={() => handleContinue("keyboard")} /> : conditions && ranked ? <ResultsPanel rootRef={resultsRef} headingRef={resultsHeadingRef} conditions={conditions} ranked={ranked} selectedIds={selectedIds} comparisonHint={comparisonHint} comparisonOpen={comparisonOpen} onComparisonOpenChange={setComparisonOpen} onComparisonToggle={toggleComparison} onComparisonClear={clearComparison} /> : null}
          </div>
        </div>
        {activeTab === "sel" && <WizardActions phase={wizard.phase} firstStep={wizard.activeStep === "application"} finalStep={wizard.phase === "questions" && nextStep === null} applicationSelected={wizard.selectedApplication !== null} whatsAppHref={whatsAppHref} comparisonCount={wizard.phase === "results" ? selectedIds.length : 0} comparisonOpen={comparisonOpen} onOpenComparison={() => setComparisonOpen(true)} onHeightChange={setActionsHeight} onBack={(source) => dispatchWizard({ type: "back", source })} onContinue={handleContinue} onRestart={(source) => { clearComparison(); dispatchWizard({ type: "restart", source }); }} />}
      </section>
      <ExplorerPanel materials={database} hidden={activeTab !== "exp"} />
      <Methodology open={methodologyOpen} onClose={() => setMethodologyOpen(false)} />
      <CuratorPanel materials={database} hidden={activeTab !== "db"} toast={curatorToast} onCopy={copyDatabase} onReset={resetDatabase} onCommit={updateMaterial} />
      <CuratorToggle curatorAccess={curatorAccess} curatorHash={curatorHash} onCuratorClick={toggleCurator} />
    </div>
  </>;
}
