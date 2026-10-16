import { useEffect, useRef, type FocusEvent, type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { APPS, CHEM, LOADS, REFS } from "../domain/data.ts";
import { peakTemperatureWarning, stepDescription, stepTitle, type StepId } from "../domain/filamentSelectionFlow.ts";
import type { ChemicalKey, RawAnswers } from "../domain/types.ts";
import { SegmentedControl } from "./SegmentedControl.tsx";

const HEAT_OPTIONS = [{ value: "amb", label: "No" }, { value: "sol", label: "Sol directo" }, { value: "rad", label: "Radiante" }, { value: "cont", label: "Por contacto" }] as const;
const COLOR_OPTIONS = [{ value: "claro", label: "Claro" }, { value: "oscuro", label: "Oscuro" }] as const;
const YES_NO_UNKNOWN = [{ value: "si", label: "Sí" }, { value: "no", label: "No" }, { value: "ns", label: "No sé" }] as const;
const UV_OPTIONS = [{ value: "1", label: "Parte del día" }, { value: "2", label: "Todo el día" }] as const;
const HUMIDITY_OPTIONS = [{ value: "1", label: "Normal" }, { value: "2", label: "Lluvia o condensación" }] as const;
const ABRASION_OPTIONS = [{ value: "0", label: "No" }, { value: "1", label: "Polvo" }, { value: "2", label: "Arena con roce" }] as const;
const RIGIDITY_OPTIONS = [{ value: "rig", label: "Rígida" }, { value: "flex", label: "Flexible o elástica" }] as const;
const FABRICATION_OPTIONS = [{ value: "solvo", label: "La encargo" }, { value: "yo", label: "La imprimo yo" }] as const;
const PRIORITY_OPTIONS = [{ value: "eq", label: "Equilibrado" }, { value: "cost", label: "Menor costo" }, { value: "perf", label: "Desempeño" }] as const;
const BOOLEAN_OPTIONS = [{ value: "si", label: "Sí" }, { value: "no", label: "No" }] as const;
const CHEMICAL_LEVELS = [{ value: "0", label: "No" }, { value: "1", label: "Salpica" }, { value: "2", label: "Sumergida" }] as const;
const ENCLOSURE_OPTIONS = [{ value: "0", label: "Abierta" }, { value: "1", label: "Cerrada" }, { value: "2", label: "Cámara calefaccionada" }] as const;

interface SelectorFormProps {
  stepId: StepId;
  progress: { current: number; total: number };
  answers: RawAnswers;
  selectedApplication: string | null;
  errors: Record<string, string>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onAnswerChange: (key: keyof RawAnswers, value: RawAnswers[keyof RawAnswers]) => void;
  onApplicationSelect: (id: string) => void;
  onContinue: () => void;
}

function errorId(field: string): string { return "wizard-error-" + field.replace(/[^a-zA-Z0-9_-]/g, "-"); }

function FieldError({ field, errors }: { field: string; errors: Record<string, string> }) {
  return errors[field] ? <p className="vmsg" id={errorId(field)} role="alert">{errors[field]}</p> : null;
}

function FieldLabel({ id, children }: { id: string; children: ReactNode }) {
  return <label className="field-label" htmlFor={id}>{children}</label>;
}

function GroupLabel({ id, children }: { id: string; children: ReactNode }) {
  return <span className="sublabel" id={id}>{children}</span>;
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return <div className="sub"><h3 className="sublabel">{title}</h3>{children}</div>;
}

export default function SelectorForm({ stepId, progress, answers, selectedApplication, errors, headingRef, onAnswerChange, onApplicationSelect, onContinue }: SelectorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const visualViewport = window.visualViewport;
    const revealFocusedField = () => {
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && formRef.current?.contains(focused)) requestAnimationFrame(() => focused.scrollIntoView({ behavior: "auto", block: "center" }));
    };
    visualViewport?.addEventListener("resize", revealFocusedField);
    return () => visualViewport?.removeEventListener("resize", revealFocusedField);
  }, []);
  const helpId = "question-description";
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onContinue(); };
  const handleEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && (event.target as HTMLElement).closest("input[type=number]")) { event.preventDefault(); onContinue(); }
  };
  const keepFocusedFieldVisible = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches("input, select, button")) return;
    requestAnimationFrame(() => target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }));
  };
  const describedBy = (field: string) => errors[field] ? errorId(field) : undefined;
  const invalid = (field: string) => Boolean(errors[field]);
  const setAnswer = (key: keyof RawAnswers, value: RawAnswers[keyof RawAnswers]) => onAnswerChange(key, value);
  const renderTemperature = () => {
    const warning = peakTemperatureWarning(answers);
    return <>
      <Subsection title="Temperatura de trabajo">
        <div className="question-fields"><div className="refs">{REFS.map(([label, value]) => <button key={label} type="button" aria-pressed={!answers.customTemperature && !answers.unknownTemperature && answers.tw === String(value)} onClick={() => { setAnswer("customTemperature", false); setAnswer("unknownTemperature", false); setAnswer("tw", String(value)); }}>{label} <b>{value} °C</b></button>)}<label className="unknown-temp-option"><input type="checkbox" id="twns" checked={answers.unknownTemperature} onChange={(event) => { setAnswer("customTemperature", false); setAnswer("unknownTemperature", event.currentTarget.checked); }} /><span><b>No sé la temperatura exacta</b><small>Se usará un valor conservador</small></span></label><button key="other" type="button" aria-pressed={answers.customTemperature && !answers.unknownTemperature} onClick={() => { setAnswer("customTemperature", true); setAnswer("unknownTemperature", false); }}><span>Otro</span><small>Ingresar manualmente</small></button></div>{answers.customTemperature && <div className="temprow"><div className="numu"><input type="number" id="tw" aria-label="Temperatura de trabajo en grados Celsius" value={answers.tw} min="-40" max="200" disabled={answers.unknownTemperature} aria-invalid={invalid("tw")} aria-describedby={describedBy("tw")} onChange={(event) => setAnswer("tw", event.currentTarget.value)} /><span>°C</span></div><input type="range" min="-20" max="160" value={answers.tw === "" ? "0" : answers.tw} disabled={answers.unknownTemperature} aria-label="Temperatura de trabajo en grados Celsius" aria-invalid={invalid("tw")} aria-describedby={describedBy("tw")} onChange={(event) => setAnswer("tw", event.currentTarget.value)} /></div>}<FieldError field="tw" errors={errors} /></div>
      </Subsection>
      <Subsection title="Calor y extremos térmicos">
        <div className="field"><GroupLabel id="calor-label">Fuente de calor adicional</GroupLabel><SegmentedControl name="calor" value={answers.calor} options={HEAT_OPTIONS} full labelledBy="calor-label" describedBy={describedBy("calor")} invalid={invalid("calor")} onChange={(value) => setAnswer("calor", value as RawAnswers["calor"])} /><FieldError field="calor" errors={errors} /></div>
        {answers.calor === "sol" && <div className="field"><GroupLabel id="color-label">Color de la pieza expuesta al sol</GroupLabel><SegmentedControl name="color" value={answers.color} options={COLOR_OPTIONS} labelledBy="color-label" describedBy={describedBy("color")} invalid={invalid("color")} onChange={(value) => setAnswer("color", value as RawAnswers["color"])} /><FieldError field="color" errors={errors} /></div>}
        <div className="row2">
          <div className="question-fields"><FieldLabel id="tpk">Pico ocasional <span>(°C)</span></FieldLabel><input type="number" id="tpk" value={answers.tpk} aria-invalid={invalid("tpk")} aria-describedby={describedBy("tpk")} onChange={(event) => setAnswer("tpk", event.currentTarget.value)} /><FieldError field="tpk" errors={errors} />{warning && <p className="vmsg advisory" aria-live="polite">{warning}</p>}</div>
          <div className="question-fields"><FieldLabel id="tmin">Temperatura mínima <span>(°C)</span></FieldLabel><input type="number" id="tmin" value={answers.tmin} aria-invalid={invalid("tmin")} aria-describedby={describedBy("tmin")} onChange={(event) => setAnswer("tmin", event.currentTarget.value)} /><FieldError field="tmin" errors={errors} /></div>
        </div>
      </Subsection>
    </>;
  };
  const renderStep = () => {
    if (stepId === "application") return <fieldset className="apps" aria-describedby={describedBy("app")} aria-invalid={invalid("app")}><legend className="sr-only">Elegí el tipo de pieza</legend>{APPS.map((application) => <label key={application.id} htmlFor={"app_" + application.id}><input type="radio" name="app" id={"app_" + application.id} value={application.id} checked={selectedApplication === application.id} onChange={() => onApplicationSelect(application.id)} /><span><b>{application.t}</b><small>{application.d}</small></span></label>)}<FieldError field="app" errors={errors} /></fieldset>;
    if (stepId === "temperature") return renderTemperature();
    if (stepId === "outdoor") return <>
      <div className="field"><GroupLabel id="ext-label">Exposición a la intemperie</GroupLabel><SegmentedControl name="ext" value={answers.ext} options={YES_NO_UNKNOWN} labelledBy="ext-label" describedBy={describedBy("ext")} invalid={invalid("ext")} onChange={(value) => setAnswer("ext", value as RawAnswers["ext"])} /><FieldError field="ext" errors={errors} /></div>
      {answers.ext === "si" && <Subsection title="Condiciones del exterior"><div className="field"><GroupLabel id="uv-label">Sol directo</GroupLabel><SegmentedControl name="uv" value={answers.uv} options={UV_OPTIONS} labelledBy="uv-label" describedBy={describedBy("uv")} invalid={invalid("uv")} onChange={(value) => setAnswer("uv", value)} /><FieldError field="uv" errors={errors} /></div><div className="field"><GroupLabel id="hum-label">Humedad durante el uso</GroupLabel><SegmentedControl name="hum" value={answers.hum} options={HUMIDITY_OPTIONS} labelledBy="hum-label" describedBy={describedBy("hum")} invalid={invalid("hum")} onChange={(value) => setAnswer("hum", value)} /><FieldError field="hum" errors={errors} /></div><div className="field"><GroupLabel id="abrasion-label">Tierra, polvo o arena</GroupLabel><SegmentedControl name="abrasion" value={answers.abrE} options={ABRASION_OPTIONS} labelledBy="abrasion-label" describedBy={describedBy("abrE")} invalid={invalid("abrE")} onChange={(value) => setAnswer("abrE", value)} /><FieldError field="abrE" errors={errors} /></div></Subsection>}
    </>;
    if (stepId === "liquid") return <>
      <div className="field"><GroupLabel id="liq-label">Contacto con líquidos o químicos</GroupLabel><SegmentedControl name="liq" value={answers.liq} options={YES_NO_UNKNOWN} labelledBy="liq-label" describedBy={describedBy("liq")} invalid={invalid("liq")} onChange={(value) => setAnswer("liq", value as RawAnswers["liq"])} /><FieldError field="liq" errors={errors} /></div>
      {answers.liq === "si" && <Subsection title="Nivel de contacto por sustancia"><p className="qd">Elegí sin contacto, salpicaduras o inmersión para cada sustancia.</p><div className="chemical-levels" aria-describedby={describedBy("chemicals")} aria-invalid={invalid("chemicals")}>{CHEM.map(([key, label]) => <div className="chemrow" key={key}><GroupLabel id={"chemical-label-" + key}>{label}</GroupLabel><SegmentedControl name={"ch_" + key} value={answers.ch[key]} options={CHEMICAL_LEVELS} size="small" labelledBy={"chemical-label-" + key} describedBy={describedBy("chemical:" + key)} invalid={invalid("chemical:" + key)} onChange={(value) => setAnswer("ch", { ...answers.ch, [key]: value as RawAnswers["ch"][ChemicalKey] })} /><FieldError field={"chemical:" + key} errors={errors} /></div>)}<FieldError field="chemicals" errors={errors} /></div></Subsection>}
    </>;
    if (stepId === "mechanical") return <>
      <div className="field"><GroupLabel id="mech-label">Esfuerzos mecánicos</GroupLabel><SegmentedControl name="mech" value={answers.mech} options={YES_NO_UNKNOWN} labelledBy="mech-label" describedBy={describedBy("mech")} invalid={invalid("mech")} onChange={(value) => setAnswer("mech", value as RawAnswers["mech"])} /><FieldError field="mech" errors={errors} /></div>
      {answers.mech === "si" && <Subsection title="Carga y movimiento"><fieldset className="loads" aria-describedby={describedBy("carga")} aria-invalid={invalid("carga")}><legend className="sublabel">Tipo de esfuerzo</legend>{LOADS.map(([value, label, description]) => <label key={value} htmlFor={"carga_" + value}><input type="radio" name="carga" id={"carga_" + value} value={value} checked={answers.carga === value} onChange={() => setAnswer("carga", value)} /><span>{label}<small>{description}</small></span></label>)}<FieldError field="carga" errors={errors} /></fieldset><div className="field"><label className="check"><input type="checkbox" id="roce" checked={answers.roce} aria-invalid={invalid("roce")} aria-describedby={describedBy("roce")} onChange={(event) => setAnswer("roce", event.currentTarget.checked)} /> Sí, rozará o deslizará contra otra pieza</label><FieldError field="roce" errors={errors} /></div></Subsection>}
      <div className="field"><GroupLabel id="rig-label">La pieza tiene que ser</GroupLabel><SegmentedControl name="rig" value={answers.rig} options={RIGIDITY_OPTIONS} labelledBy="rig-label" describedBy={describedBy("rig")} invalid={invalid("rig")} onChange={(value) => setAnswer("rig", value as RawAnswers["rig"])} /><FieldError field="rig" errors={errors} /></div>
    </>;
    if (stepId === "special") return <Subsection title="Requisitos de uso"><div className="field"><GroupLabel id="food-label">Contacto con alimentos</GroupLabel><SegmentedControl name="food" value={answers.food ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="food-label" onChange={(value) => setAnswer("food", value === "si")} /></div><div className="field"><GroupLabel id="flame-label">Resistencia a la llama</GroupLabel><SegmentedControl name="flame" value={answers.flame ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="flame-label" onChange={(value) => setAnswer("flame", value === "si")} /></div></Subsection>;
    return <>
      <div className="field"><GroupLabel id="fab-label">Fabricación</GroupLabel><SegmentedControl name="fab" value={answers.fab} options={FABRICATION_OPTIONS} labelledBy="fab-label" describedBy={describedBy("fab")} invalid={invalid("fab")} onChange={(value) => setAnswer("fab", value as RawAnswers["fab"])} /><FieldError field="fab" errors={errors} /></div>
      {answers.fab === "yo" && <Subsection title="Capacidades de tu impresora"><div className="equipment-grid"><div className="question-fields"><FieldLabel id="noz">Temperatura máxima de boquilla <span>(°C)</span></FieldLabel><input type="number" id="noz" value={answers.noz} aria-invalid={invalid("noz")} aria-describedby={describedBy("noz")} onChange={(event) => setAnswer("noz", event.currentTarget.value)} /><FieldError field="noz" errors={errors} /></div><div className="question-fields"><FieldLabel id="bed">Temperatura máxima de cama <span>(°C)</span></FieldLabel><input type="number" id="bed" value={answers.bed} aria-invalid={invalid("bed")} aria-describedby={describedBy("bed")} onChange={(event) => setAnswer("bed", event.currentTarget.value)} /><FieldError field="bed" errors={errors} /></div><div className="field"><GroupLabel id="enc-label">Cerramiento disponible</GroupLabel><SegmentedControl name="enc" value={answers.enc} options={ENCLOSURE_OPTIONS} labelledBy="enc-label" describedBy={describedBy("enc")} invalid={invalid("enc")} onChange={(value) => setAnswer("enc", value)} /><FieldError field="enc" errors={errors} /></div><div className="field"><GroupLabel id="hard-label">Boquilla endurecida (acero o rubí)</GroupLabel><SegmentedControl name="hard" value={answers.hard ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="hard-label" onChange={(value) => setAnswer("hard", value === "si")} /></div><div className="field"><GroupLabel id="dryer-label">Secador de filamento</GroupLabel><SegmentedControl name="dryer" value={answers.dryer ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="dryer-label" onChange={(value) => setAnswer("dryer", value === "si")} /></div></div></Subsection>}
      <div className="field"><GroupLabel id="prio-label">Prioridad al elegir</GroupLabel><SegmentedControl name="prio" value={answers.prio} options={PRIORITY_OPTIONS} labelledBy="prio-label" describedBy={describedBy("prio")} invalid={invalid("prio")} onChange={(value) => setAnswer("prio", value as RawAnswers["prio"])} /><FieldError field="prio" errors={errors} /></div>
    </>;
  };
  return <form ref={formRef} className="form wizard-form" id="selector-form" onSubmit={handleSubmit} onKeyDown={handleEnter} onFocusCapture={keepFocusedFieldVisible}>
    <div className="progress" role="status" aria-live="polite" aria-label={"Paso " + progress.current + " de " + progress.total}><span aria-current="step">Paso {progress.current} de {progress.total}</span></div>
    <section className="q" aria-labelledby="question-title" aria-describedby={helpId}>
      <div className="qh"><h2 className="qt" id="question-title" ref={headingRef} tabIndex={-1}>{stepTitle(stepId)}</h2></div>
      <p className="qd" id={helpId}>{stepDescription(stepId)}</p>
      <div className="step-content">{renderStep()}</div>
    </section>
  </form>;
}
