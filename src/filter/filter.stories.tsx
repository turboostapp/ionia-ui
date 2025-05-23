import { type Meta } from "@storybook/react";
import { type FC, useState } from "react";

import { CheckboxGroup } from "../checkbox-group";
import { DateRangePicker } from "../date-range-picker";
import { DateTimeInput } from "../date-time-input";
import { Input } from "../input";
import { Filter } from "./filter";

const meta = {
  title: "Advanced 高级/Filter 过滤器",
  component: Filter,
  tags: ["autodocs"],
} satisfies Meta<typeof Filter>;

export default meta;

interface Task {
  status: string;
  user: { id: string };
  commentedAt: Date;
  createdAt: Date;
}

export const Controlled: FC = () => {
  const [values, setValues] = useState({
    "user.id": "123",
    status: ["waiting"],
    commentedAt: undefined,
    createdAt: undefined,
  });

  return (
    <Filter<Task>
      filters={[
        {
          label: "编号",
          field: "user.id",
          pinned: true,
          render: ({ field }) => <Input {...field} value={field.value} />,
        },
        {
          label: "状态",
          field: "status",
          pinned: true,
          renderValue: ({ value }) => {
            return value.map((v: string) => {
              switch (v) {
                case "waiting":
                  return "等待中";
                case "progress":
                  return "进行中";
                case "completed":
                  return "已完成";
                case "failed":
                  return "已失败";
                default:
                  return v;
              }
            });
          },
          render: ({ field: { value, onChange } }) => (
            <CheckboxGroup
              options={[
                {
                  label: "等待中",
                  value: "waiting",
                },
                {
                  label: "进行中",
                  value: "progress",
                },
                {
                  label: "已完成",
                  value: "completed",
                },
                {
                  label: "已失败",
                  value: "failed",
                },
              ]}
              value={value}
              onChange={onChange}
            />
          ),
        },
        {
          label: "评论时间",
          field: "commentedAt",
          render: ({ field: { value, onChange } }) => {
            return <DateTimeInput value={value} onChange={onChange} />;
          },
        },
        {
          label: "创建时间",
          field: "createdAt",
          render: ({ field: { value, onChange } }) => {
            return <DateRangePicker range={value} onChange={onChange} />;
          },
        },
      ]}
      search={{
        queryPlaceholder: "搜索",
      }}
      values={values}
      onChange={(newValues) => {
        console.log("newValues:", newValues);
        setValues(newValues);
      }}
    />
  );
};
