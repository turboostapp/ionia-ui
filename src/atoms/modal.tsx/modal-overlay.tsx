import * as DialogPrimitive from "@radix-ui/react-dialog";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";

export const modalOverlay = tv({
  base: "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
});

export const ModalOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={modalOverlay({ className })}
    ref={ref}
    {...props}
  />
));
