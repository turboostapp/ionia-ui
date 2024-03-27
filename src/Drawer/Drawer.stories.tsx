import type { Meta } from "@storybook/react";
import { type FC, useState } from "react";

import { Button } from "../Button";
import { Drawer } from "./Drawer";
import page from "./Drawer.mdx";

export default {
  title: "Layout 布局//Drawer 抽屉",
  component: Drawer,
  parameters: {
    docs: {
      page,
    },
  },
} satisfies Meta<typeof Drawer>;

export const Default: FC = (args) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        打开抽屉
      </Button>
      <Drawer
        open={open}
        title="抽屉标题"
        onClose={() => {
          setOpen(false);
        }}
        {...args}
      >
        抽屉
      </Drawer>
    </div>
  );
};
