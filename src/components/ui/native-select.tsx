import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const NativeSelect = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(({ className, ...props }, ref) => <select ref={ref} data-slot="native-select" className={cn("w-full rounded-sm border border-input bg-card px-2 py-[7px] font-sans text-[13px] font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />);
NativeSelect.displayName = "NativeSelect";
