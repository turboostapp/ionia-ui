import type { Meta } from "@storybook/react";
import { type FC } from "react";

import { Card } from "../Card";
import { Page } from "./Page";
import page from "./Page.mdx";

export default {
  title: "Layout 布局/Page 页面",
  component: Page,
  parameters: {
    backgrounds: {
      default: "gray",
      values: [{ name: "gray", value: "rgb(249, 250, 251)" }],
    },
    docs: {
      page,
    },
  },
} satisfies Meta<typeof Page>;

export const Default: FC = (args) => {
  return (
    <div className="bg-gray-100">
      <Page
        primaryAction={{ content: "创建" }}
        secondaryActions={[{ content: "设置" }]}
        title="标题"
        {...args}
      >
        <Card className="h-72">页面内容</Card>
      </Page>
    </div>
  );
};

export const FullWidth: FC = (args) => {
  return (
    <div className="bg-gray-100">
      <Page
        fullWidth
        primaryAction={{ content: "创建" }}
        secondaryActions={[{ content: "设置" }]}
        title="标题"
        {...args}
      >
        <Card className="h-72">页面内容</Card>
      </Page>
    </div>
  );
};
