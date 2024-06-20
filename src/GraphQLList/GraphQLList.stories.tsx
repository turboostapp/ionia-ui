import { type Meta } from "@storybook/react";
import { type FC, useRef } from "react";

import { Badge } from "../Badge";
import { Button } from "../Button";
import { CheckboxGroup } from "../CheckboxGroup";
import { DateRangePicker } from "../DateRangePicker";
import { DateTimeInput } from "../DateTimeInput";
import { type ActionType } from "../GraphQLTable";
import { Input } from "../Input";
import { GraphQLList } from "./GraphQLList";
import { type TableColumnProps } from "./ListTable";

const meta = {
  title: "Layout 布局/GraphQLList 列表",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof GraphQLList>;

export default meta;

export const Base: FC = () => {
  const actionRef = useRef<ActionType>(null);

  const columns: Array<TableColumnProps<any>> = [
    {
      accessorKey: "name",
      cell: ({ row: { original } }) => {
        return (
          <div className="flex flex-1 items-center justify-between">
            <div>
              <div className="flex gap-x-4">
                <Badge color="red">已完成</Badge>
                <div className="text-sm font-semibold leading-6 text-gray-900">
                  {original.name}
                </div>
              </div>
              <div className="mt-1 truncate text-xs leading-5 text-gray-500">
                {original.description}
              </div>
            </div>
            <Button
              link
              onClick={() => {
                console.log("查看");
              }}
            >
              查看
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <GraphQLList
        actionRef={actionRef}
        columns={columns}
        edges={[
          { node: { name: "1", description: "详情" }, cursor: "1" },
          { node: { name: "2", description: "详情" }, cursor: "2" },
          { node: { name: "3", description: "详情" }, cursor: "3" },
          { node: { name: "4", description: "详情" }, cursor: "4" },
        ]}
        emptyStateDescription="没有找到相关记录"
        emptyStateTitle="暂无数据"
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
            pinned: true,
            render: ({ field: { value, onChange } }) => {
              return <DateTimeInput value={value} onChange={onChange} />;
            },
          },
          {
            label: "创建时间",
            field: "createdAt",
            pinned: true,
            render: ({ field: { value, onChange } }) => {
              return <DateRangePicker range={value} onChange={onChange} />;
            },
          },
        ]}
        footer={
          <div className="flex h-10 items-center px-3 py-2 leading-10">
            4 items
          </div>
        }
        rowSelection={{
          allowSelectAll: true,
          // single: false,
          bulkActions: (rows, isSelectedAll) => [
            {
              content: "编辑",
              onClick: () => {
                console.log(111, rows, isSelectedAll);
              },
            },
            { content: "删除" },
          ],
          onSelectionChange: (rows) => {
            console.log(rows);
          },
        }}
        search={{ queryPlaceholder: "search" }}
        toolBarRender={() => <div>toolbar</div>}
        onChange={(variables) => {
          console.log(variables);
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              console.log(record);
            },
          };
        }}
      />
    </div>
  );
};
