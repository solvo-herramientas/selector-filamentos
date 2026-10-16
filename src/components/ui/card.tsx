import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> { asChild?: boolean; }

export const Card = forwardRef<HTMLDivElement, CardProps>(({ asChild = false, className, ...props }, ref) => {
  const Component = asChild ? Slot : "div";
  return <Component ref={ref} data-slot="card" className={cn("rounded-md border border-input bg-card text-card-foreground", className)} {...props} />;
});
Card.displayName = "Card";
