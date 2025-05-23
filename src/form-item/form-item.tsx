import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

import { forwardRef } from "../utils";

export interface FormItemProps {
  children?: ReactNode;
  className?: string;
  label?: string;
  helpText?: string;
  error?: string;
}

export const FormItem = forwardRef<FormItemProps, "div">(
  ({ children, className, label, helpText, error }, ref) => {
    return (
      <div className="w-full" ref={ref}>
        {typeof label !== "undefined" && (
          <label
            className={twMerge(
              "block text-sm font-medium leading-6 text-default",
            )}
            htmlFor={label}
          >
            {label}
          </label>
        )}

        <div
          className={twMerge(typeof label !== "undefined" && "mt-2", className)}
        >
          {children}
        </div>

        {(typeof error !== "undefined" || typeof helpText !== "undefined") && (
          <p
            className={twMerge(
              `mt-2 text-sm`,
              typeof error !== "undefined" && `text-destructive`,
              typeof error === "undefined" &&
                typeof helpText !== "undefined" &&
                `text-description`,
            )}
          >
            {error ?? helpText}
          </p>
        )}
      </div>
    );
  },
);
