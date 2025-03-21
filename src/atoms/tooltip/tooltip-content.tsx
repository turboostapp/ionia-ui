import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";
import { tv } from "tailwind-variants";

export const tooltipContent = tv({
  base: "z-50 overflow-hidden rounded-md border bg-surface px-3 py-1.5 text-xs text-default shadow-sm",
  variants: {
    animation: {
      default:
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    },
  },
  defaultVariants: {
    animation: "default",
  },
});

export interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {}

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    {...props}
    className={tooltipContent({ className })}
    ref={ref}
    sideOffset={sideOffset}
  />
));

TooltipContent.displayName = TooltipPrimitive.Content.displayName;
