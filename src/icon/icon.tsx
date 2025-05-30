import { type ElementType } from "react";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { forwardRef } from "../utils";

export interface IconProps {
  as: ElementType;
  className?: string;
  size?: keyof typeof IconStyle.variants.size;
}

const IconStyle = tv({
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-7 w-7",
      "2xl": "h-8 w-8",
      "3xl": "h-9 w-9",
      "4xl": "h-10 w-10",
      "5xl": "h-11 w-11",
    },
  },
});

export const Icon = forwardRef<IconProps, "svg">(
  ({ as: Component = "svg", className, size = "md", ...props }, ref) => {
    return (
      <Component
        className={twMerge(
          IconStyle({
            size,
          }),
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
