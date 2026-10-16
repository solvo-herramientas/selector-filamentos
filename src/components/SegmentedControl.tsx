export interface SegmentedOption<Value extends string = string> {
  value: Value;
  label: string;
}

interface SegmentedControlProps<Value extends string = string> {
  name: string;
  value: Value;
  options: readonly SegmentedOption<Value>[];
  onChange: (value: Value) => void;
  size?: "normal" | "small";
  full?: boolean;
  dataAttribute?: boolean;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
}

export function SegmentedControl<Value extends string>({ name, value, options, onChange, size = "normal", full = false, dataAttribute = true, labelledBy, describedBy, invalid = false }: SegmentedControlProps<Value>) {
  const className = `seg${size === "small" ? " sm" : ""}${full ? " full" : ""}`;
  return <div className={className} role="radiogroup" aria-labelledby={labelledBy} aria-describedby={describedBy} aria-invalid={invalid ? "true" : undefined} data-seg={dataAttribute ? name : undefined} data-opts={dataAttribute ? options.map(({ value: optionValue, label }) => `${optionValue}:${label}`).join("|") : undefined}>
    {options.map((option) => <label key={option.value}>
      <input type="radio" name={name} id={`${name}_${option.value}`} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      <span>{option.label}</span>
    </label>)}
  </div>;
}
