import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@/lib/utils";

type DrawerContextValue = { modal: React.ComponentProps<typeof DrawerPrimitive.Root>["modal"]; swipeDirection: NonNullable<React.ComponentProps<typeof DrawerPrimitive.Root>["swipeDirection"]> };

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function Drawer({ modal = true, swipeDirection = "down", ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  const context = React.useMemo(() => ({ modal, swipeDirection }), [modal, swipeDirection]);
  return <DrawerContext.Provider value={context}><DrawerPrimitive.Root data-slot="drawer" modal={modal} swipeDirection={swipeDirection} {...props} /></DrawerContext.Provider>;
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) { return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />; }

function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) { return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />; }

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) { return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />; }

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) { return <DrawerPrimitive.Backdrop data-slot="drawer-overlay" className={cn("fixed inset-0 z-50 bg-black/58 transition-opacity duration-(--motion-duration) ease-wizard data-[ending-style]:pointer-events-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute motion-reduce:duration-160", className)} {...props} />; }

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Popup>) {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error("DrawerContent must be used within Drawer.");
  const swipeAxis = context.swipeDirection === "down" || context.swipeDirection === "up" ? "y" : "x";
  return <DrawerPortal>
    {context.modal === true && <DrawerOverlay />}
    <DrawerPrimitive.Viewport data-slot="drawer-viewport" data-modal={context.modal} className="pointer-events-none fixed inset-0 z-50 select-none data-[modal=true]:pointer-events-auto">
      <DrawerPrimitive.Popup data-slot="drawer-popup" data-swipe-axis={swipeAxis} className={cn("group/drawer-popup pointer-events-auto fixed z-50 m-(--drawer-inset,0px) mx-auto flex h-auto max-h-[min(88dvh,860px)] min-h-0 w-auto max-w-[900px] flex-col overflow-hidden rounded-t-xl rounded-b-none border border-b-0 border-input bg-background text-foreground shadow-[0_-12px_48px_rgba(0,0,0,.28)] outline-none transition-[transform,height,opacity] duration-(--motion-duration) ease-wizard will-change-transform [--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-axis=y]:inset-x-[max(16px,env(safe-area-inset-left,0px))] data-[swipe-axis=y]:right-[max(16px,env(safe-area-inset-right,0px))] data-[swipe-axis=x]:inset-y-0 data-[swipe-axis=x]:flex-row data-[swipe-axis=x]:w-3/4 data-[swipe-axis=x]:sm:max-w-sm data-[swipe-direction=down]:bottom-[max(0px,env(safe-area-inset-bottom,0px))] data-[swipe-direction=down]:origin-bottom data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+var(--drawer-inset,0px)+2px),0)] data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:origin-top data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-var(--drawer-inset,0px)-2px),0)] data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:origin-left data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-var(--drawer-inset,0px)-2px),0,0)] data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:origin-right data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+var(--drawer-inset,0px)+2px),0,0)] data-[ending-style]:transform-(--closed-transform) data-[starting-style]:transform-(--closed-transform) data-[swiping]:duration-0 motion-reduce:transform-none! motion-reduce:duration-160", className)} {...props}>
        <DrawerPrimitive.Content data-slot="drawer-content" className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden overscroll-contain">{children}</DrawerPrimitive.Content>
      </DrawerPrimitive.Popup>
    </DrawerPrimitive.Viewport>
  </DrawerPortal>;
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="drawer-header" className={cn("flex shrink-0 flex-col", className)} {...props} />; }

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="drawer-footer" className={cn("mt-auto flex shrink-0 flex-col", className)} {...props} />; }

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) { return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("font-semibold text-foreground", className)} {...props} />; }

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) { return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-sm text-muted-foreground", className)} {...props} />; }

export { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger };
