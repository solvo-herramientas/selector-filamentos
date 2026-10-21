import * as LabelPrimitive from "@radix-ui/react-label";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => <LabelPrimitive.Root ref={ref} className={cn("text-[13px] font-semibold leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />);
Label.displayName = LabelPrimitive.Root.displayName;
