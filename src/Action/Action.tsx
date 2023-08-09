import { type FC, type ReactNode } from "react";

import { Button, type ButtonProps } from "../Button";
import { type As } from "../types";
import { forwardRef } from "../utils";

export interface ActionProps extends Omit<ButtonProps, "children" | "onClick"> {
  as?: As;
  content: ReactNode;
  onAction?: () => Promise<void> | void;
}

export const Action: FC<ActionProps> = forwardRef<ActionProps, "div">(
  ({ content, onAction, ...props }, ref) => (
    <Button ref={ref} onClick={onAction} {...props}>
      {content}
    </Button>
  ),
);
