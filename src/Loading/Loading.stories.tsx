import type { Meta } from "@storybook/react";
import React, { type FC } from "react";

import { Loading } from "./Loading";
import page from "./Loading.mdx";

export default {
  title: "Layout 布局/Loading 加载",
  component: Loading,
  parameters: {
    backgrounds: {
      default: "gray",
      values: [{ name: "gray", value: "rgb(249, 250, 251)" }],
    },
    docs: {
      page,
    },
  },
} satisfies Meta<typeof Loading>;

export const Default: FC = () => {
  return (
    <div className="h-72">
      <Loading />
    </div>
  );
};
