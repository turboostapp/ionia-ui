import { type FC, type ReactNode } from "react";
import { tv } from "tailwind-variants";

const frame = tv({
  base: "flex h-screen w-full flex-col",
});

const frameContent = tv({
  base: "w-ful flex",
});

export interface FrameProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  navigation?: ReactNode;
}

export const Frame: FC<FrameProps> = (props) => {
  return (
    <div {...props} className={frame(props)}>
      {typeof props.header !== "undefined" && <div>{props.header}</div>}
      <div className={frameContent()}>
        <div className="w-full">{props.children}</div>
      </div>
    </div>
  );
};
