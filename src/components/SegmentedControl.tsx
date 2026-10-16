import { SelectableCard, SelectableCardGrid, type SelectableCardGridColumnCount } from "@/components/ui/selectable-card";

export interface SegmentedOption<Value extends string = string> {
  value: Value;
  label: string;
}

interface SegmentedControlProps<Value extends string = string> {
  name: string;
  value: Value;
  options: readonly SegmentedOption<Value>[];
  onChange: (value: Value) => void;
  dataAttribute?: boolean;
  ariaLabel?: string;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
  className?: string;
  columns?: SelectableCardGridColumnCount;
  mobileColumns?: SelectableCardGridColumnCount;
}

export function SegmentedControl<Value extends string>({ name, value, options, onChange, dataAttribute = true, ariaLabel, labelledBy, describedBy, invalid = false, className, columns, mobileColumns }: SegmentedControlProps<Value>) {
  const compactColumns = options.length > 0 && options.length <= 3 ? options.length as SelectableCardGridColumnCount : undefined;
  return <SelectableCardGrid className={className} columns={columns ?? compactColumns} mobileColumns={mobileColumns ?? compactColumns} name={name} value={value} onValueChange={(nextValue) => onChange(nextValue as Value)} aria-label={ariaLabel} aria-labelledby={labelledBy} aria-describedby={describedBy} aria-invalid={invalid ? "true" : undefined} data-seg={dataAttribute ? name : undefined} data-opts={dataAttribute ? options.map(({ value: optionValue, label }) => `${optionValue}:${label}`).join("|") : undefined}>
    {options.map((option) => <SelectableCard key={option.value} id={`${name}_${option.value}`} value={option.value}><span>{option.label}</span></SelectableCard>)}
  </SelectableCardGrid>;
}
