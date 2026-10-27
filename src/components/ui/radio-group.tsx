import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {}
export interface RadioGroupItemProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(({ className, ...props }, ref) => <RadioGroupPrimitive.Root ref={ref} className={cn(className)} {...props} />);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(({ className, ...props }, ref) => <RadioGroupPrimitive.Item ref={ref} className={cn("min-w-0 font-sans leading-[1.45] disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
