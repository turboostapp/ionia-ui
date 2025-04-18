import {
  type AccessorKeyColumnDef,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { cloneDeep } from "lodash-es";
import {
  type ReactElement,
  type RefObject,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

import { Action, type ActionProps } from "../action";
import { Checkbox } from "../checkbox";
import { Radio } from "../radio";
import { Spinner } from "../spinner";

export interface TableActionType {
  resetRowSelection: () => void;
}

export type TableColumnProps<T> = ColumnDef<T> & {
  align?: "left" | "center" | "right";
  wordWrap?: boolean;
};

export interface ListTableProps<T> {
  tableActionRef?: RefObject<TableActionType>;
  columns: Array<TableColumnProps<T>>;
  rowSelection?: {
    single?: boolean;
    allowSelectAll?: boolean;
    onSelectionChange?: (rows: T[]) => void;
    bulkActions?: (rows: T[], isSelectedAll: boolean) => ActionProps[];
  };
  rowDraggable?: {
    id?: string;
    onRowDragEndChange?: (rows: T[]) => void;
  };
  data: T[];
  rowKey?: keyof T;
  bodyHeight?: number;
  loading?: boolean;
  onRow?: (record: T) => {
    onClick?: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
  };
}

export function ListTable<T>({
  tableActionRef,
  columns,
  data,
  rowKey,
  rowSelection,
  loading = false,
  bodyHeight,
  onRow,
}: ListTableProps<T>): ReactElement {
  const tableHeaderRef = useRef<HTMLTableElement>(null);
  const tableFooterRef = useRef<HTMLTableElement>(null);

  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  // 不是当前页的选中全部
  const [isRowSelectedAll, setIsRowSelectedAll] = useState(false);

  const hasBulkActions = useMemo(() => {
    return (
      typeof rowSelection?.bulkActions !== "undefined" &&
      rowSelection.bulkActions([], false).length !== 0
    );
  }, [rowSelection]);

  const memoColumns = useMemo(() => {
    const cloneColumns = cloneDeep(columns);

    if (typeof rowSelection !== "undefined") {
      cloneColumns.unshift({
        id: "row-select",
        maxSize: 16,
        header: !(rowSelection.single ?? false)
          ? ({ table }) => {
              return (
                <Checkbox
                  checked={table.getIsAllRowsSelected()}
                  indeterminate={table.getIsSomeRowsSelected()}
                  label=""
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              );
            }
          : undefined,
        cell: ({ row, table }) =>
          typeof rowSelection.single !== "undefined" && rowSelection.single ? (
            <Radio
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              label=""
              onChange={() => {
                table.setRowSelection({ [row.id]: true });
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          ) : (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              label=""
              onChange={row.getToggleSelectedHandler()}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          ),
      });
    }

    return cloneColumns.map((column) =>
      typeof column.id === "undefined"
        ? {
            ...column,
            id: (column as AccessorKeyColumnDef<T>).accessorKey,
          }
        : column,
    );
  }, [columns, rowSelection]);

  const table = useReactTable({
    data,
    columns: memoColumns as Array<ColumnDef<T>>,
    state: {
      rowSelection: internalRowSelection,
    },
    enableRowSelection: typeof rowSelection !== "undefined",
    getCoreRowModel: getCoreRowModel(),
    getRowId:
      typeof rowKey !== "undefined"
        ? (row) => row[rowKey] as string
        : undefined,
    onRowSelectionChange: (updater) => {
      setInternalRowSelection((old) => {
        const newRowSelection =
          updater instanceof Function ? updater(old) : updater;

        rowSelection?.onSelectionChange?.(
          Object.keys(newRowSelection).map((key) => table.getRow(key).original),
        );

        setIsRowSelectedAll(false);

        return newRowSelection;
      });
    },
  });

  // 一些可以手动触发的特殊操作
  useImperativeHandle(
    tableActionRef,
    () => ({
      resetRowSelection: () => {
        table.resetRowSelection();
      },
    }),
    [table],
  );

  return (
    <div
      className={twMerge(
        "relative min-w-full",
        loading && "pointer-events-none select-none overflow-hidden",
      )}
    >
      <div
        className={twMerge(
          "relative min-w-full",
          loading && "pointer-events-none select-none overflow-hidden",
        )}
      >
        <div className="overflow-hidden" ref={tableHeaderRef}>
          {Object.keys(internalRowSelection).length > 0 && (
            <table className="w-full table-fixed">
              <thead className="relative h-14 border-b">
                {/* batch actions */}
                {!(rowSelection?.single ?? false) && hasBulkActions && (
                  <tr className="absolute z-[3] flex h-14 w-full items-center space-x-2 px-3 py-3.5">
                    <td>
                      <Checkbox
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={
                          Object.keys(internalRowSelection).length > 0
                        }
                        label=""
                        onChange={table.getToggleAllRowsSelectedHandler()}
                      />
                    </td>
                    {Object.keys(internalRowSelection).length > 0 && (
                      <td className="text-sm text-gray-500">
                        {isRowSelectedAll
                          ? "Selected all"
                          : `Selected ${
                              Object.keys(internalRowSelection).length
                            } rows`}
                      </td>
                    )}

                    {typeof rowSelection?.allowSelectAll !== "undefined" &&
                      Object.keys(internalRowSelection).length > 0 &&
                      rowSelection.allowSelectAll && (
                        <td
                          className="cursor-pointer text-sm text-link hover:text-link-hover"
                          onClick={() => {
                            if (isRowSelectedAll) {
                              setIsRowSelectedAll(false);
                              table.toggleAllRowsSelected(false);
                            } else {
                              table.toggleAllRowsSelected(true);

                              setTimeout(() => {
                                setIsRowSelectedAll(true);
                              });
                            }
                          }}
                        >
                          {isRowSelectedAll ? "Cancel" : "Select all"}
                        </td>
                      )}

                    {Object.keys(internalRowSelection).length > 0 && (
                      <td
                        className="flex space-x-2"
                        style={{ marginLeft: "auto" }}
                      >
                        {rowSelection
                          ?.bulkActions?.(
                            Object.keys(internalRowSelection).map(
                              (key) => table.getRow(key).original,
                            ),
                            isRowSelectedAll,
                          )
                          ?.map((action, index) => (
                            <div key={index}>
                              <Action {...action} size="sm" />
                            </div>
                          ))}
                      </td>
                    )}
                  </tr>
                )}
              </thead>
            </table>
          )}
        </div>

        <div
          className={twMerge(
            typeof bodyHeight !== "undefined"
              ? "overflow-auto"
              : "overflow-y-hidden",
          )}
          style={{
            height:
              typeof bodyHeight !== "undefined" ? `${bodyHeight}px` : undefined,
          }}
          onScroll={(e) => {
            const scrollLeft = (e.target as HTMLElement).scrollLeft;

            if (tableHeaderRef.current != null) {
              tableHeaderRef.current.scrollLeft = scrollLeft;
            }

            if (tableFooterRef.current != null) {
              tableFooterRef.current.scrollLeft = scrollLeft;
            }
          }}
        >
          <table className="w-full table-fixed">
            <tbody className="relative divide-y border-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  className={twMerge(
                    "group relative flex flex-1 items-center bg-white px-3 hover:bg-gray-50",
                    onRow != null && "cursor-pointer",
                  )}
                  key={row.id}
                  onClick={(e) => {
                    onRow?.(row.original)?.onClick?.(e);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className={twMerge(
                        "break-words bg-surface py-3 text-sm text-default group-hover:bg-gray-50",
                        cell.column.id !== "row-select" && "w-full",
                      )}
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <Spinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}
