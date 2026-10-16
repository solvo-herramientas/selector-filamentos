import { type FormEvent, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { APPS, CHEM, LOADS, REFS } from "../domain/data.ts";
import { peakTemperatureWarning, stepDescription, stepTitle, type StepId } from "../domain/filamentSelectionFlow.ts";
import type { ChemicalKey, RawAnswers } from "../domain/types.ts";
import { SelectableCard, SelectableCardGrid, SelectableCheckboxCard } from "@/components/ui/selectable-card";
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
  return errors[field] ? <p className="m-0 rounded-sm bg-warn-soft px-2.5 py-[7px] text-[12.5px] text-warn" id={errorId(field)} role="alert">{errors[field]}</p> : null;
}

function FieldLabel({ id, children }: { id: string; children: ReactNode }) {
  return <Label className="grid gap-1.5 text-[13px] font-semibold [&_span]:font-normal [&_span]:text-muted-foreground has-[+input[aria-invalid=true]]:text-warn" htmlFor={id}>{children}</Label>;
}

function GroupLabel({ id, children }: { id: string; children: ReactNode }) {
  return <span className="text-[13px] font-semibold" id={id}>{children}</span>;
}

function TemperatureSliderField({ id, label, value, min, max, invalid = false, describedBy, disabled = false, onValueChange }: { id: string; label: string; value: string; min: number; max: number; invalid?: boolean; describedBy?: string; disabled?: boolean; onValueChange: (value: string) => void }) {
  const numericValue = Number(value);
  const sliderValue = Math.min(max, Math.max(min, Number.isFinite(numericValue) ? numericValue : 0));
  const labelId = id + "-label";
  return <div data-slot="temperature-slider-field" className="grid w-full gap-1.5"><div className="flex items-center justify-between gap-3"><span id={labelId} className="text-[13px] font-semibold">{label}</span><output className="w-24 text-right font-mono text-sm tabular-nums text-foreground">{value === "" ? "—" : value} °C</output></div><Slider value={[sliderValue]} onValueChange={(nextValue) => onValueChange(String(nextValue[0]))} min={min} max={max} step={1} disabled={disabled} aria-labelledby={labelId} aria-invalid={invalid ? "true" : undefined} aria-describedby={describedBy} getAriaValueText={(_formattedValue, nextValue) => `${nextValue} °C`} /></div>;
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return <div className="grid gap-2.5 rounded-md bg-background p-0 [&>h3]:m-0"><h3 className="font-display [font-stretch:85%] text-base font-[750] leading-tight">{title}</h3>{children}</div>;
}

export default function SelectorForm({ stepId, progress, answers, selectedApplication, errors, headingRef, onAnswerChange, onApplicationSelect, onContinue }: SelectorFormProps) {
  const helpId = "question-description";
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onContinue(); };
  const handleEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter" && (event.target as HTMLElement).closest("input[type=number]")) { event.preventDefault(); onContinue(); }
  };
  const describedBy = (field: string) => errors[field] ? errorId(field) : undefined;
  const invalid = (field: string) => Boolean(errors[field]);
  const setAnswer = (key: keyof RawAnswers, value: RawAnswers[keyof RawAnswers]) => onAnswerChange(key, value);
  const renderTemperature = () => {
    const warning = peakTemperatureWarning(answers);
    const temperatureChoice = answers.unknownTemperature ? "unknown" : answers.customTemperature ? "other" : String(REFS.find(([, value]) => answers.tw === String(value))?.[1] ?? "");
    const handleTemperatureChoice = (value: string) => { if (value === "unknown") { setAnswer("customTemperature", false); setAnswer("unknownTemperature", true); } else if (value === "other") { setAnswer("customTemperature", true); setAnswer("unknownTemperature", false); } else { setAnswer("customTemperature", false); setAnswer("unknownTemperature", false); setAnswer("tw", value); } };
    return <>
      <Subsection title="Temperatura de trabajo">
        <div className="grid w-full gap-2.5"><SelectableCardGrid name="twPreset" value={temperatureChoice} onValueChange={handleTemperatureChoice} aria-label="Temperatura de trabajo" aria-invalid={invalid("tw")} aria-describedby={describedBy("tw")}>{REFS.map(([label, value]) => <SelectableCard key={label} id={"twPreset_" + value} value={String(value)}><span>{label}</span><small>{value} °C</small></SelectableCard>)}<SelectableCard id="twPreset_unknown" value="unknown"><span>No sé la temperatura exacta</span><small>Se usará un valor conservador</small></SelectableCard><SelectableCard id="twPreset_other" value="other"><span>Otro</span><small>Ingresar manualmente</small></SelectableCard></SelectableCardGrid>{answers.customTemperature && <TemperatureSliderField id="tw" label="Temperatura" value={answers.tw} min={-20} max={160} disabled={answers.unknownTemperature} invalid={invalid("tw")} describedBy={describedBy("tw")} onValueChange={(value) => setAnswer("tw", value)} />}<FieldError field="tw" errors={errors} /></div>
      </Subsection>
      <Subsection title="Calor y extremos térmicos">
        <div className="grid justify-items-start gap-2"><GroupLabel id="calor-label">Fuente de calor adicional</GroupLabel><SegmentedControl name="calor" value={answers.calor} options={HEAT_OPTIONS} columns={4} labelledBy="calor-label" describedBy={describedBy("calor")} invalid={invalid("calor")} onChange={(value) => setAnswer("calor", value as RawAnswers["calor"])} /><FieldError field="calor" errors={errors} /></div>
        {answers.calor === "sol" && <div className="grid justify-items-start gap-2"><GroupLabel id="color-label">Color de la pieza expuesta al sol</GroupLabel><SegmentedControl name="color" value={answers.color} options={COLOR_OPTIONS} labelledBy="color-label" describedBy={describedBy("color")} invalid={invalid("color")} onChange={(value) => setAnswer("color", value as RawAnswers["color"])} /><FieldError field="color" errors={errors} /></div>}
        <div className="grid grid-cols-2 gap-3 [@media(max-width:560px)]:grid-cols-1">
          <div className="grid w-full gap-2.5"><TemperatureSliderField id="tpk" label="Pico ocasional" value={answers.tpk} min={-40} max={200} invalid={invalid("tpk")} describedBy={describedBy("tpk")} onValueChange={(value) => setAnswer("tpk", value)} /><FieldError field="tpk" errors={errors} />{warning && <p className="m-0 rounded-sm bg-warn-soft px-2.5 py-[7px] text-[12.5px] text-warn border-0 border-s-[3px] border-solid border-warn" aria-live="polite">{warning}</p>}</div>
          <div className="grid w-full gap-2.5"><TemperatureSliderField id="tmin" label="Temperatura mínima" value={answers.tmin} min={-40} max={200} invalid={invalid("tmin")} describedBy={describedBy("tmin")} onValueChange={(value) => setAnswer("tmin", value)} /><FieldError field="tmin" errors={errors} /></div>
        </div>
      </Subsection>
    </>;
  };
  const renderStep = () => {
    if (stepId === "application") return <SelectableCardGrid name="app" value={selectedApplication ?? ""} onValueChange={onApplicationSelect} aria-label="Elegí el tipo de pieza" aria-describedby={describedBy("app")} aria-invalid={invalid("app")} data-invalid={invalid("app") ? "true" : undefined}>{APPS.map((application) => <SelectableCard key={application.id} id={"app_" + application.id} value={application.id}><span>{application.t}</span><small>{application.d}</small></SelectableCard>)}<FieldError field="app" errors={errors} /></SelectableCardGrid>;
    if (stepId === "temperature") return renderTemperature();
    if (stepId === "outdoor") return <>
      <div className="grid justify-items-start gap-2"><GroupLabel id="ext-label">Exposición a la intemperie</GroupLabel><SegmentedControl name="ext" value={answers.ext} options={YES_NO_UNKNOWN} labelledBy="ext-label" describedBy={describedBy("ext")} invalid={invalid("ext")} onChange={(value) => setAnswer("ext", value as RawAnswers["ext"])} /><FieldError field="ext" errors={errors} /></div>
      {answers.ext === "si" && <Subsection title="Condiciones del exterior"><div className="grid justify-items-start gap-2"><GroupLabel id="uv-label">Sol directo</GroupLabel><SegmentedControl name="uv" value={answers.uv} options={UV_OPTIONS} labelledBy="uv-label" describedBy={describedBy("uv")} invalid={invalid("uv")} onChange={(value) => setAnswer("uv", value)} /><FieldError field="uv" errors={errors} /></div><div className="grid justify-items-start gap-2"><GroupLabel id="hum-label">Humedad durante el uso</GroupLabel><SegmentedControl name="hum" value={answers.hum} options={HUMIDITY_OPTIONS} labelledBy="hum-label" describedBy={describedBy("hum")} invalid={invalid("hum")} onChange={(value) => setAnswer("hum", value)} /><FieldError field="hum" errors={errors} /></div><div className="grid justify-items-start gap-2"><GroupLabel id="abrasion-label">Tierra, polvo o arena</GroupLabel><SegmentedControl name="abrasion" value={answers.abrE} options={ABRASION_OPTIONS} labelledBy="abrasion-label" describedBy={describedBy("abrE")} invalid={invalid("abrE")} onChange={(value) => setAnswer("abrE", value)} /><FieldError field="abrE" errors={errors} /></div></Subsection>}
    </>;
    if (stepId === "liquid") return <>
      <div className="grid justify-items-start gap-2"><GroupLabel id="liq-label">Contacto con líquidos o químicos</GroupLabel><SegmentedControl name="liq" value={answers.liq} options={YES_NO_UNKNOWN} labelledBy="liq-label" describedBy={describedBy("liq")} invalid={invalid("liq")} onChange={(value) => setAnswer("liq", value as RawAnswers["liq"])} /><FieldError field="liq" errors={errors} /></div>
      {answers.liq === "si" && <Subsection title="Nivel de contacto por sustancia"><p className="m-0 text-[13px] text-muted-foreground">Elegí sin contacto, salpicaduras o inmersión para cada sustancia.</p><div className="grid gap-2" aria-describedby={describedBy("chemicals")} aria-invalid={invalid("chemicals")}>{CHEM.map(([key, label]) => <div className="grid grid-cols-[minmax(140px,.6fr)_minmax(0,1fr)] items-center gap-2 text-[13px] [&_[role=radiogroup]]:w-full [&_[role=alert]]:col-span-full [@media(max-width:440px)]:grid-cols-1" key={key}><GroupLabel id={"chemical-label-" + key}>{label}</GroupLabel><SegmentedControl name={"ch_" + key} value={answers.ch[key]} options={CHEMICAL_LEVELS} labelledBy={"chemical-label-" + key} describedBy={describedBy("chemical:" + key)} invalid={invalid("chemical:" + key)} onChange={(value) => setAnswer("ch", { ...answers.ch, [key]: value as RawAnswers["ch"][ChemicalKey] })} /><FieldError field={"chemical:" + key} errors={errors} /></div>)}<FieldError field="chemicals" errors={errors} /></div></Subsection>}
    </>;
    if (stepId === "mechanical") return <>
      <div className="grid justify-items-start gap-2"><GroupLabel id="mech-label">Esfuerzos mecánicos</GroupLabel><SegmentedControl name="mech" value={answers.mech} options={YES_NO_UNKNOWN} labelledBy="mech-label" describedBy={describedBy("mech")} invalid={invalid("mech")} onChange={(value) => setAnswer("mech", value as RawAnswers["mech"])} /><FieldError field="mech" errors={errors} /></div>
      {answers.mech === "si" && <Subsection title="Carga y movimiento"><p className="text-[13px] font-semibold">Tipo de esfuerzo</p><SelectableCardGrid name="carga" value={answers.carga} onValueChange={(value) => setAnswer("carga", value as RawAnswers["carga"])} aria-label="Tipo de esfuerzo" aria-describedby={describedBy("carga")} aria-invalid={invalid("carga")}>{LOADS.map(([value, label, description]) => <SelectableCard key={value} id={"carga_" + value} value={value}><span>{label}</span><small>{description}</small></SelectableCard>)}<FieldError field="carga" errors={errors} /></SelectableCardGrid><div className="grid gap-2"><SelectableCheckboxCard id="roce" checked={answers.roce} aria-labelledby="roce-label" aria-invalid={invalid("roce")} aria-describedby={describedBy("roce")} onCheckedChange={(checked) => setAnswer("roce", checked === true)}><span id="roce-label">Sí, rozará o deslizará contra otra pieza</span></SelectableCheckboxCard><FieldError field="roce" errors={errors} /></div></Subsection>}
      <div className="grid justify-items-start gap-2"><GroupLabel id="rig-label">La pieza tiene que ser</GroupLabel><SegmentedControl name="rig" value={answers.rig} options={RIGIDITY_OPTIONS} labelledBy="rig-label" describedBy={describedBy("rig")} invalid={invalid("rig")} onChange={(value) => setAnswer("rig", value as RawAnswers["rig"])} /><FieldError field="rig" errors={errors} /></div>
    </>;
    if (stepId === "special") return <Subsection title="Requisitos de uso"><div className="grid justify-items-start gap-2"><GroupLabel id="food-label">Contacto con alimentos</GroupLabel><SegmentedControl name="food" value={answers.food ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="food-label" onChange={(value) => setAnswer("food", value === "si")} /></div><div className="grid justify-items-start gap-2"><GroupLabel id="flame-label">Resistencia a la llama</GroupLabel><SegmentedControl name="flame" value={answers.flame ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="flame-label" onChange={(value) => setAnswer("flame", value === "si")} /></div></Subsection>;
    return <>
      <div className="grid justify-items-start gap-2"><GroupLabel id="fab-label">Fabricación</GroupLabel><SegmentedControl name="fab" value={answers.fab} options={FABRICATION_OPTIONS} labelledBy="fab-label" describedBy={describedBy("fab")} invalid={invalid("fab")} onChange={(value) => setAnswer("fab", value as RawAnswers["fab"])} /><FieldError field="fab" errors={errors} /></div>
      {answers.fab === "yo" && <Subsection title="Capacidades de tu impresora"><div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3"><div className="grid max-w-[560px] gap-2.5"><FieldLabel id="noz">Temperatura máxima de boquilla <span>(°C)</span></FieldLabel><Input type="number" id="noz" value={answers.noz} aria-invalid={invalid("noz")} aria-describedby={describedBy("noz")} onChange={(event) => setAnswer("noz", event.currentTarget.value)} /><FieldError field="noz" errors={errors} /></div><div className="grid max-w-[560px] gap-2.5"><FieldLabel id="bed">Temperatura máxima de cama <span>(°C)</span></FieldLabel><Input type="number" id="bed" value={answers.bed} aria-invalid={invalid("bed")} aria-describedby={describedBy("bed")} onChange={(event) => setAnswer("bed", event.currentTarget.value)} /><FieldError field="bed" errors={errors} /></div><div className="grid justify-items-start gap-2"><GroupLabel id="enc-label">Cerramiento disponible</GroupLabel><SegmentedControl name="enc" value={answers.enc} options={ENCLOSURE_OPTIONS} labelledBy="enc-label" describedBy={describedBy("enc")} invalid={invalid("enc")} onChange={(value) => setAnswer("enc", value)} /><FieldError field="enc" errors={errors} /></div><div className="grid justify-items-start gap-2"><GroupLabel id="hard-label">Boquilla endurecida (acero o rubí)</GroupLabel><SegmentedControl name="hard" value={answers.hard ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="hard-label" onChange={(value) => setAnswer("hard", value === "si")} /></div><div className="grid justify-items-start gap-2"><GroupLabel id="dryer-label">Secador de filamento</GroupLabel><SegmentedControl name="dryer" value={answers.dryer ? "si" : "no"} options={BOOLEAN_OPTIONS} labelledBy="dryer-label" onChange={(value) => setAnswer("dryer", value === "si")} /></div></div></Subsection>}
      <div className="grid justify-items-start gap-2"><GroupLabel id="prio-label">Prioridad al elegir</GroupLabel><SegmentedControl name="prio" value={answers.prio} options={PRIORITY_OPTIONS} labelledBy="prio-label" describedBy={describedBy("prio")} invalid={invalid("prio")} onChange={(value) => setAnswer("prio", value as RawAnswers["prio"])} /><FieldError field="prio" errors={errors} /></div>
    </>;
  };
  return <form className="print:hidden! border-0 bg-transparent [border-radius:0] [&_[aria-invalid=true]]:outline-warn" id="selector-form" onSubmit={handleSubmit} onKeyDown={handleEnter}>
    <div className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-[.04em] text-muted-foreground" role="status" aria-live="polite" aria-label={"Paso " + progress.current + " de " + progress.total}><span aria-current="step">Paso {progress.current} de {progress.total}</span></div>
    <section className="grid gap-2.5 p-0" aria-labelledby="question-title" aria-describedby={helpId}>
      <div className="flex items-baseline gap-2.5"><h2 className="m-0 font-display [font-stretch:90%] text-xl font-bold leading-[1.2] focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" id="question-title" ref={headingRef} tabIndex={-1}>{stepTitle(stepId)}</h2></div>
      <p className="m-0 text-[13px] text-muted-foreground" id={helpId}>{stepDescription(stepId)}</p>
      <div className="grid gap-3">{renderStep()}</div>
    </section>
  </form>;
}
