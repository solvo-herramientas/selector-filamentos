import { APPS, CHEM, LOADS } from "./data.ts";
import { answersForPreset, applyApplicationPreset } from "./conditions.ts";
import type { RawAnswers } from "./types.ts";

export const STEP_IDS = ["application", "temperature", "outdoor", "liquid", "mechanical", "special", "manufacturing"] as const;
export type StepId = typeof STEP_IDS[number];
export type ScreenId = StepId | "results";
export type ActivationSource = "pointer" | "keyboard";
export type NavigationDirection = "forward" | "backward";

export interface WizardTransition {
  id: number;
  direction: NavigationDirection;
  source: ActivationSource;
  phase: "preparing" | "animating";
}

export interface WizardState {
  answers: RawAnswers;
  selectedApplication: string | null;
  activeStep: StepId;
  completedSteps: StepId[];
  phase: "questions" | "results";
  errors: Record<string, string>;
  transition: WizardTransition | null;
  transitionSequence: number;
}

export type WizardAction =
  | { type: "select-application"; id: string }
  | { type: "update-answer"; key: keyof RawAnswers; value: RawAnswers[keyof RawAnswers] }
  | { type: "continue"; source: ActivationSource }
  | { type: "back"; source: ActivationSource }
  | { type: "edit"; source: ActivationSource }
  | { type: "restart"; source: ActivationSource }
  | { type: "transition-start"; id: number }
  | { type: "transition-complete"; id: number };

export const STEP_ANSWER_FIELDS: Readonly<Record<StepId, readonly (keyof RawAnswers)[]>> = {
  application: ["app"],
  temperature: ["tw", "unknownTemperature", "customTemperature", "appTw", "calor", "color", "tpk", "tmin"],
  outdoor: ["ext", "uv", "hum", "abrE"],
  liquid: ["liq", "ch"],
  mechanical: ["mech", "carga", "roce", "rig"],
  special: ["food", "flame"],
  manufacturing: ["fab", "noz", "bed", "enc", "hard", "dryer", "prio"]
};

export function stepRoute(): readonly StepId[] {
  return STEP_IDS;
}

export function previousStepId(current: StepId): StepId | null {
  const index = STEP_IDS.indexOf(current);
  return index > 0 ? STEP_IDS[index - 1] : null;
}

export function nextStepId(current: StepId): StepId | null {
  const index = STEP_IDS.indexOf(current);
  return index >= 0 && index < STEP_IDS.length - 1 ? STEP_IDS[index + 1] : null;
}

export function stepProgress(current: StepId): { current: number; total: number } {
  const index = STEP_IDS.indexOf(current);
  return { current: index < 0 ? 1 : index + 1, total: STEP_IDS.length };
}

export function stepTitle(id: ScreenId): string {
  if (id === "results") return "Resultados de la selección";
  return ({ application: "¿Qué es tu pieza?", temperature: "¿Qué temperaturas y fuentes de calor enfrenta?", outdoor: "¿Estará expuesta al exterior?", liquid: "¿Qué líquidos o químicos tocará?", mechanical: "¿Qué esfuerzos mecánicos soportará?", special: "¿Tiene requisitos especiales?", manufacturing: "¿Cómo se fabricará?" } as Record<StepId, string>)[id];
}

export function stepDescription(id: ScreenId): string {
  if (id === "results") return "Materiales ordenados según las condiciones y prioridades que indicaste.";
  return ({ application: "Elegí el caso más parecido. Sus valores de partida quedan como sugerencias que podés ajustar.", temperature: "Completá en este paso la temperatura de trabajo, el calor adicional, el color si recibe sol y los extremos térmicos.", outdoor: "Si no estás seguro, se aplican supuestos conservadores para exterior.", liquid: "Indicá si habrá contacto con líquidos. Si respondés sí, definí el nivel para cada sustancia.", mechanical: "Incluí el peso propio, las cargas, los golpes y el movimiento. La rigidez se pregunta siempre.", special: "Marcá los requisitos de contacto con alimentos y resistencia a la llama.", manufacturing: "Elegí quién fabrica la pieza. Si la imprimís, indicá las capacidades de tu equipo." } as Record<StepId, string>)[id];
}

function isOneOf(value: unknown, values: readonly string[]): boolean {
  return typeof value === "string" && values.includes(value);
}

function parseRequiredNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function effectiveWorkingTemperature(answers: RawAnswers): number | null {
  if (answers.unknownTemperature) return Number.isFinite(answers.appTw) ? answers.appTw + 10 : null;
  return parseRequiredNumber(answers.tw);
}

export function validateStep(stepId: StepId, state: Pick<WizardState, "answers" | "selectedApplication">): Record<string, string> {
  const { answers, selectedApplication } = state;
  const errors: Record<string, string> = {};
  const requireNumber = (field: string, value: string, label: string) => { if (parseRequiredNumber(value) === null) errors[field] = "Ingresá un número válido para " + label + "."; };
  if (stepId === "application" && (!selectedApplication || !APPS.some(({ id }) => id === selectedApplication))) errors.app = "Elegí el tipo de pieza para continuar.";
  if (stepId === "temperature") {
    if (!isOneOf(answers.calor, ["amb", "sol", "rad", "cont"])) errors.calor = "Elegí una fuente de calor.";
    if (!answers.unknownTemperature) {
      requireNumber("tw", answers.tw, "la temperatura de trabajo");
      const temperature = parseRequiredNumber(answers.tw);
      if (temperature !== null && (temperature < -40 || temperature > 200)) errors.tw = "Usá un valor entre −40 y 200 °C.";
    }
    if (answers.calor === "sol" && !isOneOf(answers.color, ["claro", "oscuro"])) errors.color = "Elegí el color de la pieza.";
    requireNumber("tpk", answers.tpk, "el pico ocasional");
    requireNumber("tmin", answers.tmin, "la temperatura mínima");
    const minimum = parseRequiredNumber(answers.tmin);
    const working = effectiveWorkingTemperature(answers);
    if (minimum !== null && working !== null && minimum > working) errors.tmin = "La mínima no puede superar la temperatura efectiva de trabajo (" + working + " °C).";
  }
  if (stepId === "outdoor") {
    if (!isOneOf(answers.ext, ["si", "no", "ns"])) errors.ext = "Elegí sí, no o no sé.";
    if (answers.ext === "si" && !isOneOf(answers.uv, ["1", "2"])) errors.uv = "Elegí cuánto sol recibe.";
    if (answers.ext === "si" && !isOneOf(answers.hum, ["1", "2"])) errors.hum = "Elegí el nivel de humedad.";
    if (answers.ext === "si" && !isOneOf(answers.abrE, ["0", "1", "2"])) errors.abrE = "Elegí el nivel de tierra o abrasión.";
  }
  if (stepId === "liquid") {
    if (!isOneOf(answers.liq, ["si", "no", "ns"])) errors.liq = "Elegí sí, no o no sé.";
    if (answers.liq === "si") {
      const selected = CHEM.filter(([key]) => isOneOf(answers.ch[key], ["1", "2"]));
      if (!selected.length) errors.chemicals = "Indicá al menos una sustancia en contacto o cambiá la respuesta sobre líquidos.";
      CHEM.forEach(([key]) => { if (!isOneOf(answers.ch[key], ["0", "1", "2"])) errors["chemical:" + key] = "Elegí sin contacto, salpicadura o inmersión."; });
    }
  }
  if (stepId === "mechanical") {
    if (!isOneOf(answers.mech, ["si", "no", "ns"])) errors.mech = "Elegí sí, no o no sé.";
    if (answers.mech === "si" && !LOADS.some(([value]) => value === answers.carga)) errors.carga = "Elegí el tipo de carga.";
    if (answers.mech === "si" && typeof answers.roce !== "boolean") errors.roce = "Indicá si habrá roce.";
    if (!isOneOf(answers.rig, ["rig", "flex"])) errors.rig = "Elegí si la pieza será rígida o flexible.";
  }
  if (stepId === "manufacturing") {
    if (!isOneOf(answers.fab, ["solvo", "yo"])) errors.fab = "Elegí quién fabricará la pieza.";
    if (answers.fab === "yo") {
      requireNumber("noz", answers.noz, "la temperatura máxima de boquilla");
      const nozzle = parseRequiredNumber(answers.noz);
      if (nozzle !== null && nozzle <= 0) errors.noz = "La temperatura máxima debe ser mayor que 0 °C.";
      requireNumber("bed", answers.bed, "la temperatura máxima de cama");
      const bed = parseRequiredNumber(answers.bed);
      if (bed !== null && bed <= 0) errors.bed = "La temperatura máxima debe ser mayor que 0 °C.";
      if (!isOneOf(answers.enc, ["0", "1", "2"])) errors.enc = "Elegí el cerramiento de la impresora.";
    }
    if (!isOneOf(answers.prio, ["eq", "cost", "perf"])) errors.prio = "Elegí una prioridad.";
  }
  return errors;
}

export function validateAllSteps(state: Pick<WizardState, "answers" | "selectedApplication">): { stepId: StepId; errors: Record<string, string> } | null {
  for (const stepId of STEP_IDS) {
    const errors = validateStep(stepId, state);
    if (Object.keys(errors).length) return { stepId, errors };
  }
  return null;
}

export function peakTemperatureWarning(answers: RawAnswers): string | null {
  const peak = parseRequiredNumber(answers.tpk);
  const working = effectiveWorkingTemperature(answers);
  return peak !== null && working !== null && peak < working ? "El pico queda por debajo de la temperatura de trabajo; se usará " + working + " °C." : null;
}

export function answersChanged(previous: RawAnswers | null, current: RawAnswers): boolean {
  return previous !== null && JSON.stringify(previous) !== JSON.stringify(current);
}

function transitionTo(state: WizardState, direction: NavigationDirection, source: ActivationSource): Pick<WizardState, "transition" | "transitionSequence"> {
  const id = state.transitionSequence + 1;
  return { transitionSequence: id, transition: source === "keyboard" ? null : { id, direction, source, phase: "preparing" } };
}

function invalidateFrom(state: WizardState, stepId: StepId): StepId[] {
  const index = STEP_IDS.indexOf(stepId);
  return state.completedSteps.filter((completed) => STEP_IDS.indexOf(completed) < index);
}

export function createInitialWizard(): WizardState {
  const preset = APPS.find(({ id }) => id === "otra") ?? APPS[0];
  return { answers: answersForPreset(preset), selectedApplication: null, activeStep: "application", completedSteps: [], phase: "questions", errors: {}, transition: null, transitionSequence: 0 };
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  if (action.type === "select-application") {
    if (state.selectedApplication === action.id) return state;
    const preset = APPS.find(({ id }) => id === action.id);
    if (!preset) return state;
    const answers = applyApplicationPreset(state.answers, preset);
    return { ...state, answers, selectedApplication: preset.id, completedSteps: [], errors: {} };
  }
  if (action.type === "update-answer") {
    if (state.phase !== "questions" || state.answers[action.key] === action.value) return state;
    const completedSteps = invalidateFrom(state, state.activeStep);
    const answers = { ...state.answers, [action.key]: action.value } as RawAnswers;
    if (state.activeStep === "temperature" && (action.key === "tw" || action.key === "unknownTemperature")) {
      const workingTemperature = effectiveWorkingTemperature(answers);
      const peakTemperature = parseRequiredNumber(answers.tpk);
      if (workingTemperature !== null && peakTemperature !== null && peakTemperature < workingTemperature) answers.tpk = String(workingTemperature);
    }
    return { ...state, answers, completedSteps, errors: {} };
  }
  if (action.type === "continue") {
    if (state.phase !== "questions") return state;
    const errors = validateStep(state.activeStep, state);
    if (Object.keys(errors).length) return { ...state, errors };
    const next = nextStepId(state.activeStep);
    const completedSteps = [...new Set([...state.completedSteps, state.activeStep])];
    if (!next) {
      const issue = validateAllSteps(state);
      if (issue) return { ...state, activeStep: issue.stepId, errors: issue.errors, completedSteps: completedSteps.filter((stepId) => stepId !== issue.stepId) };
      return { ...state, phase: "results", completedSteps, errors: {}, ...transitionTo(state, "forward", action.source) };
    }
    return { ...state, activeStep: next, completedSteps, errors: {}, ...transitionTo(state, "forward", action.source) };
  }
  if (action.type === "back") {
    if (state.phase !== "questions") return state;
    const previous = previousStepId(state.activeStep);
    if (!previous) return state;
    return { ...state, activeStep: previous, errors: {}, ...transitionTo(state, "backward", action.source) };
  }
  if (action.type === "edit") {
    if (state.phase !== "results") return state;
    return { ...state, phase: "questions", activeStep: "application", errors: {}, ...transitionTo(state, "backward", action.source) };
  }
  if (action.type === "restart") {
    const initial = createInitialWizard();
    return { ...initial, ...transitionTo(state, "backward", action.source) };
  }
  if (action.type === "transition-start") return state.transition?.id === action.id && state.transition.phase === "preparing" ? { ...state, transition: { ...state.transition, phase: "animating" } } : state;
  if (action.type === "transition-complete") return state.transition?.id === action.id ? { ...state, transition: null } : state;
  return state;
}
