import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex border-0 border-solid font-sans leading-[normal] no-underline items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45", { variants: { variant: { default: "bg-foreground text-background hover:opacity-85", hot: "bg-primary text-primary-foreground hover:brightness-95", ghost: "border border-input bg-transparent text-foreground hover:bg-secondary" }, size: { default: "min-h-[38px] px-3.5 py-[9px]", sm: "min-h-8 px-3 py-1.5 text-xs", icon: "size-9 p-0" } }, defaultVariants: { variant: "default", size: "default" } });

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, className, size, variant, ...props }, ref) => {
  const Component = asChild ? Slot : "button";
  return <Component ref={ref} className={cn(buttonVariants({ className, size, variant }))} {...props} />;
});
Button.displayName = "Button";
