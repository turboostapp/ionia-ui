import type { Meta } from "@storybook/react";
import { type FC } from "react";

import { DateRangePicker } from "./date-range-picker";

const meta = {
  title: "Form 表单/DateRangePicker 日期范围选择器",
  component: DateRangePicker,
} satisfies Meta<typeof DateRangePicker>;

export default meta;

const today = new Date(new Date().setHours(0, 0, 0, 0));
const yesterday = new Date(
  new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0),
);

export const Controlled: FC = () => {
  return (
    <DateRangePicker
      range={[yesterday, today]}
      onChange={(res) => {
        console.log(res);
      }}
    />
  );
};
