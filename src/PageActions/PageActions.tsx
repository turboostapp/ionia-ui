import { type FC } from "react";

import { Action, type ActionProps } from "../Action";
import { ButtonGroup } from "../ButtonGroup";

export interface PageActionsProps {
  primaryAction?: ActionProps;
  secondaryActions?: ActionProps[];
}

export const PageActions: FC<PageActionsProps> = ({
  primaryAction,
  secondaryActions = [],
}) => {
  return (
    <div className="mx-auto flex h-16 w-full items-center justify-end">
      <ButtonGroup>
        {secondaryActions?.map((action, index) => (
          <Action key={index} {...action} />
        ))}
        <Action primary {...primaryAction} />
      </ButtonGroup>
    </div>
  );
};
