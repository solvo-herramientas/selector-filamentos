import { useEffect, useRef, type MouseEvent } from "react";
import type { ActivationSource } from "../domain/filamentSelectionFlow.ts";
import { visualViewportBottomOffset } from "./visualViewport.ts";

interface WizardActionsProps {
  phase: "questions" | "results";
  firstStep: boolean;
  finalStep: boolean;
  applicationSelected: boolean;
  onHeightChange: (height: number) => void;
  onBack: (source: ActivationSource) => void;
  onContinue: (source: ActivationSource) => void;
  onEdit: (source: ActivationSource) => void;
  onRestart: (source: ActivationSource) => void;
}

function activationSource(event: MouseEvent<HTMLButtonElement>): ActivationSource { return event.detail === 0 ? "keyboard" : "pointer"; }

export default function WizardActions({ phase, firstStep, finalStep, applicationSelected, onHeightChange, onBack, onContinue, onEdit, onRestart }: WizardActionsProps) {
  const actionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = actionsRef.current;
    if (!element) return;
    const measure = () => onHeightChange(element.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [onHeightChange]);
  useEffect(() => {
    const visualViewport = window.visualViewport;
    const updateOffset = () => {
      const offset = visualViewportBottomOffset(window.innerHeight, visualViewport?.height ?? null, visualViewport?.offsetTop ?? 0);
      actionsRef.current?.style.setProperty("--wizard-viewport-offset", offset + "px");
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    visualViewport?.addEventListener("resize", updateOffset);
    visualViewport?.addEventListener("scroll", updateOffset);
    return () => { window.removeEventListener("resize", updateOffset); visualViewport?.removeEventListener("resize", updateOffset); visualViewport?.removeEventListener("scroll", updateOffset); };
  }, []);
  return <div className="wizard-actions" ref={actionsRef} role="group" aria-label={phase === "results" ? "Acciones de resultados" : "Navegación de preguntas"}>
    {phase === "results" ? <>
      <button type="button" className="btn ghost" onClick={(event) => onEdit(activationSource(event))}>Editar respuestas</button>
      <button type="button" className="btn hot" onClick={(event) => onRestart(activationSource(event))}>Empezar de nuevo</button>
    </> : <>
      <button type="button" className="btn ghost" disabled={firstStep} onClick={(event) => onBack(activationSource(event))}>Atrás</button>
      <button type="button" className="btn hot" disabled={firstStep && !applicationSelected} onClick={(event) => onContinue(activationSource(event))}>{finalStep ? "Ver resultados" : "Continuar"}</button>
    </>}
  </div>;
}
