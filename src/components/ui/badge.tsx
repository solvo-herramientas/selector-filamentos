import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-sm px-2 py-[3px] text-xs", { variants: { variant: { default: "bg-secondary text-foreground", success: "bg-ok-soft text-ok", warning: "bg-warn-soft text-warn", destructive: "bg-bad-soft text-bad" } }, defaultVariants: { variant: "default" } });
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...props }, ref) => <span ref={ref} data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />);
Badge.displayName = "Badge";
