import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> { showIndicator?: boolean; }

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(({ className, children, showIndicator = true, ...props }, ref) => <CheckboxPrimitive.Root ref={ref} className={cn("peer p-0 font-sans inline-grid size-4 shrink-0 place-items-center rounded-[3px] border border-input bg-card text-background focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground", className)} {...props}>{showIndicator && <CheckboxPrimitive.Indicator className="grid place-items-center"><svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none"><path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></CheckboxPrimitive.Indicator>}{children}</CheckboxPrimitive.Root>);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
