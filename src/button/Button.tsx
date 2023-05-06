import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from "react";
import clsx from "clsx";
import { Spinner } from "../spinner";

export interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  /**
   * Provides extra visual weight and identifies the primary action in a set of buttons.
   */
  primary?: boolean;

  /**
   * Indicates a dangerous or potentially negative action.
   */
  destructive?: boolean;

  /**
   * 是否为圆角按钮
   */
  rounded?: boolean;

  disabled?: boolean;

  loading?: boolean;

  size?: "xs" | "sm" | "md" | "lg";
}

const sizeMap = {
  xs: clsx(`px-2 py-0.5 text-xs`),
  sm: clsx(`px-3 py-1 text-xs`),
  md: clsx(`px-4 py-2 text-sm`),
  lg: clsx(`px-6 py-3 text-sm`),
};

/**
 * 按钮组件
 */
export const Button: FC<ButtonProps> = ({
  children,
  primary = false,
  destructive = false,
  rounded = false,
  disabled = false,
  loading = false,
  size = "md",
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={clsx(
        `relative font-semibold shadow-sm`,
        !destructive &&
          !primary &&
          `bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400`,
        !destructive &&
          primary &&
          `bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`,
        destructive &&
          !primary &&
          `bg-red-600 text-white shadow-sm hover:bg-red-500 disabled:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600`,
        rounded ? `rounded-full` : `rounded-md`,
        sizeMap[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
          <Spinner size={size} />
        </span>
      )}

      <span className={clsx(loading && `text-transparent`)}>{children}</span>
    </button>
  );
};
