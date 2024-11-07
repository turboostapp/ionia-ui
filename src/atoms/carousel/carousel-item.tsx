import * as React from "react";
import { twMerge } from "tailwind-merge";

import { useCarousel } from "./carousel-context";

export const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      aria-roledescription="slide"
      className={twMerge(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      ref={ref}
      role="group"
      {...props}
    />
  );
});

CarouselItem.displayName = "CarouselItem";
