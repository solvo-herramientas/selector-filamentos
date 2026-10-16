import { useEffect, useRef, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { IconBrandWhatsapp, IconChartBar } from "@tabler/icons-react";
import type { ActivationSource } from "../domain/filamentSelectionFlow.ts";
import { visualViewportBottomOffset } from "./visualViewport.ts";

interface WizardActionsProps {
  phase: "questions" | "results";
  firstStep: boolean;
  finalStep: boolean;
  applicationSelected: boolean;
  whatsAppHref: string;
  comparisonCount: number;
  comparisonOpen: boolean;
  onOpenComparison: () => void;
  onHeightChange: (height: number) => void;
  onBack: (source: ActivationSource) => void;
  onContinue: (source: ActivationSource) => void;
  onRestart: (source: ActivationSource) => void;
}

function activationSource(event: MouseEvent<HTMLButtonElement>): ActivationSource { return event.detail === 0 ? "keyboard" : "pointer"; }

export default function WizardActions({ phase, firstStep, finalStep, applicationSelected, whatsAppHref, comparisonCount, comparisonOpen, onOpenComparison, onHeightChange, onBack, onContinue, onRestart }: WizardActionsProps) {
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
    {phase === "results" && comparisonCount >= 2 && <div className="pointer-events-none absolute inset-x-0 bottom-[calc(100%+12px)] z-10 flex justify-center px-4 opacity-100 [transform:translateY(0)] transition-[transform,opacity] duration-(--motion-duration) [transition-timing-function:var(--ease-out)] [@starting-style]:opacity-0 [@starting-style]:[transform:translateY(8px)] motion-reduce:duration-100">
      <Button type="button" id="comparison-trigger" variant="hot" className="pointer-events-auto min-h-11 gap-2 rounded-full px-4 shadow-[0_4px_16px_rgba(0,0,0,.32)]" aria-haspopup="dialog" aria-expanded={comparisonOpen} aria-controls="comparison-dialog" aria-label={`Ver comparación de ${comparisonCount} materiales`} onClick={onOpenComparison}><IconChartBar aria-hidden="true" className="size-4" />Ver comparación <span aria-hidden="true" className="font-mono tabular-nums">{comparisonCount}</span></Button>
    </div>}
    <div className="mx-auto flex w-full max-w-[1352px] justify-end gap-2 pl-[max(16px,env(safe-area-inset-left,0px))] pr-[max(16px,env(safe-area-inset-right,0px))]">
      {phase === "results" ? <>
        <Button type="button" variant="ghost" className="min-h-[44px] min-w-[120px] [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal" onClick={(event) => onRestart(activationSource(event))}>Empezar de nuevo</Button>
        <Button asChild variant="hot" className="min-h-[44px] min-w-[120px] gap-2 [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal"><a href={whatsAppHref} target="_blank" rel="noopener"><IconBrandWhatsapp aria-hidden="true" className="size-5" />Enviar consulta</a></Button>
      </> : <>
        {!firstStep && <Button type="button" variant="ghost" className="min-h-[44px] min-w-[120px] [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal" onClick={(event) => onBack(activationSource(event))}>Atrás</Button>}
        <Button type="button" variant="hot" className="min-h-[44px] min-w-[120px] [@media(max-width:700px)]:min-w-0 [@media(max-width:700px)]:flex-1 [@media(max-width:700px)]:px-3 [@media(max-width:700px)]:py-2.5 [@media(max-width:700px)]:whitespace-normal" disabled={firstStep && !applicationSelected} onClick={(event) => onContinue(activationSource(event))}>{finalStep ? "Ver resultados" : "Continuar"}</Button>
      </>}
    </div>
  </div>;
}
