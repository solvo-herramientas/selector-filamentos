import { useEffect, useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
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
  return <div className="fixed inset-x-0 bottom-[var(--wizard-viewport-offset,0px)] z-5 border-t border-solid border-input bg-card pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_16px_rgba(0,0,0,.08)] print:hidden!" ref={actionsRef} role="group" aria-label={phase === "results" ? "Acciones de resultados" : "Navegación de preguntas"}>
    <div className="mx-auto flex w-full max-w-[1352px] justify-end gap-2 pl-[max(16px,env(safe-area-inset-left,0px))] pr-[max(16px,env(safe-area-inset-right,0px))]">
      {phase === "results" ? <>
        <Button type="button" variant="ghost" className="min-h-[44px] min-w-[120px] [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal" onClick={(event) => onEdit(activationSource(event))}>Editar respuestas</Button>
        <Button type="button" variant="hot" className="min-h-[44px] min-w-[120px] [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal" onClick={(event) => onRestart(activationSource(event))}>Empezar de nuevo</Button>
      </> : <>
        {!firstStep && <Button type="button" variant="ghost" className="min-h-[44px] min-w-[120px] [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal" onClick={(event) => onBack(activationSource(event))}>Atrás</Button>}
        <Button type="button" variant="hot" className="min-h-[44px] min-w-[120px] [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal" disabled={firstStep && !applicationSelected} onClick={(event) => onContinue(activationSource(event))}>{finalStep ? "Ver resultados" : "Continuar"}</Button>
      </>}
    </div>
  </div>;
}
