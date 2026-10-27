export type ChemicalKey = "agua" | "aguaCal" | "aceites" | "comb" | "alc" | "solv" | "acid" | "base" | "cl";

export type HeatSource = "amb" | "sol" | "rad" | "cont";
export type PartColor = "claro" | "oscuro";
export type OutdoorAnswer = "si" | "no" | "ns";
export type LiquidAnswer = "si" | "no" | "ns";
export type MechanicalAnswer = "si" | "no" | "ns";
export type LoadKind = "static" | "sust" | "cyc" | "imp" | "none";
export type RigidityKind = "rig" | "flex";
export type FabricationKind = "solvo" | "yo";
export type PriorityKind = "eq" | "cost" | "perf";
export type ExplorerView = "cards" | "mx";

export interface Material {
  id: string;
  fam: string;
  tc: number;
  hdt: number;
  cold: number;
  uv: number;
  hum: number;
  abr: number;
  c: Record<ChemicalKey, number>;
  str: number;
  stf: number;
  tgh: number;
  crp: number;
  flex: number;
  food: number;
  flame: number;
  noz: number;
  bed: number;
  enc: number;
  hard: number;
  dry: number;
  ease: number;
  cost: number;
  conf: number;
  dryp: string;
  apps: string;
  note: string;
}

export interface EquipmentSettings {
  noz: number;
  bed: number;
  enc: number;
  hard: boolean;
  dryer: boolean;
}

export interface PresetValues {
  tw: number;
  tpk: number;
  tmin: number;
  calor: HeatSource;
  color: PartColor;
  ext: OutdoorAnswer;
  uv?: string;
  hum?: string;
  abr?: string;
  liq: LiquidAnswer;
  ch?: Partial<Record<ChemicalKey, number>>;
  mech: MechanicalAnswer;
  carga?: LoadKind;
  roce?: boolean;
  rig: RigidityKind;
  food?: boolean;
}

export interface ApplicationPreset {
  id: string;
  t: string;
  d: string;
  v: PresetValues;
}

export interface RawAnswers {
  app: string;
  tw: string;
  tpk: string;
  tmin: string;
  unknownTemperature: boolean;
  customTemperature: boolean;
  appTw: number;
  calor: HeatSource;
  color: PartColor;
  ext: OutdoorAnswer;
  uv: string;
  hum: string;
  abrE: string;
  liq: LiquidAnswer;
  ch: Record<ChemicalKey, string>;
  mech: MechanicalAnswer;
  carga: LoadKind;
  roce: boolean;
  rig: RigidityKind;
  food: boolean;
  flame: boolean;
  fab: FabricationKind;
  noz: string;
  bed: string;
  enc: string;
  hard: boolean;
  dryer: boolean;
  prio: PriorityKind;
}

export interface Conditions {
  app: string;
  tw: number;
  tpk: number;
  tmin: number;
  calor: HeatSource;
  color: PartColor;
  ext: OutdoorAnswer;
  uv: number;
  hum: number;
  abrE: number;
  liq: LiquidAnswer;
  ch: Record<ChemicalKey, number>;
  mech: MechanicalAnswer;
  carga: LoadKind;
  roce: boolean;
  abr: number;
  rig: RigidityKind;
  food: boolean;
  flame: boolean;
  fab: FabricationKind;
  noz: number;
  bed: number;
  enc: number;
  hard: boolean;
  dryer: boolean;
  pcost: number;
  pease: number;
  assume: string[];
}

export interface Exclusion {
  k: string;
  t: string;
  fix?: string | null;
}

export interface EvaluationResult {
  m: Material;
  ex: Exclusion[];
  pro: string[];
  con: string[];
  score: number;
  lim: number;
  Td: number;
  delta: number;
  casi: boolean;
  fix: string | null;
}

export interface LimitingCondition {
  key: string;
  label: string;
  count: number;
}

export interface RankedMaterials {
  results: EvaluationResult[];
  ok: EvaluationResult[];
  casi: EvaluationResult[];
  no: EvaluationResult[];
  limits: LimitingCondition[];
}
