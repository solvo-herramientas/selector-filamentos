import { Checkbox, type CheckboxProps } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RadioGroupProps } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";

export type SelectableCardGridColumnCount = 1 | 2 | 3 | 4;
export interface SelectableCardGridProps extends RadioGroupProps { columns?: SelectableCardGridColumnCount; mobileColumns?: SelectableCardGridColumnCount; }
const GRID_COLUMN_CLASSES: Record<SelectableCardGridColumnCount, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
const MOBILE_GRID_COLUMN_CLASSES: Record<SelectableCardGridColumnCount, string> = { 1: "[@media(max-width:700px)]:grid-cols-1", 2: "[@media(max-width:700px)]:grid-cols-2", 3: "[@media(max-width:700px)]:grid-cols-3", 4: "[@media(max-width:700px)]:grid-cols-4" };
const SELECTABLE_CARD_CLASS = "group/choice grid min-h-[58px] w-full grid-cols-[minmax(0,1fr)_20px] cursor-pointer items-center gap-2 whitespace-normal rounded-md border border-input bg-background px-2.5 py-[9px] text-left font-sans text-[13px] font-normal leading-[1.45] text-foreground transition-colors hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-transparent data-[state=checked]:hover:border-foreground data-[state=checked]:bg-hot-soft [&_small]:text-[11.5px] [&_small]:font-normal [&_small]:leading-[1.3] [&_small]:text-muted-foreground";

export function SelectableCardGrid({ className, columns = 2, mobileColumns = 1, ...props }: SelectableCardGridProps) { return <RadioGroup className={cn("grid w-full gap-1.5 [&_[role=alert]]:col-span-full", GRID_COLUMN_CLASSES[columns], MOBILE_GRID_COLUMN_CLASSES[mobileColumns], className)} {...props} />; }

function SelectableIndicator() { return <span aria-hidden="true" className="relative size-5 shrink-0 text-muted-foreground"><IconCircle className="absolute inset-0 size-5 transition-opacity group-data-[state=checked]/choice:opacity-0" /><IconCircleCheckFilled className="absolute inset-0 size-5 text-primary opacity-0 transition-opacity group-data-[state=checked]/choice:opacity-100" /></span>; }

export function SelectableCard({ className, children, ...props }: RadioGroupItemProps) { return <RadioGroupItem className={cn(SELECTABLE_CARD_CLASS, className)} {...props}><span className="grid min-w-0 gap-0.5">{children}</span><SelectableIndicator /></RadioGroupItem>; }

export function SelectableCheckboxCard({ className, children, ...props }: Omit<CheckboxProps, "showIndicator">) { return <Checkbox showIndicator={false} className={cn(SELECTABLE_CARD_CLASS, className)} {...props}><span className="grid min-w-0 gap-0.5">{children}</span><SelectableIndicator /></Checkbox>; }
