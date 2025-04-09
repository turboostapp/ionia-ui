import {
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { compact, get, isEmpty, isEqual, omit, pick, trim } from "lodash-es";
import {
  type ReactElement,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

import { type ActionProps } from "../action";
import { Button } from "../button";
import { ButtonGroup } from "../button-group";
import { EmptyState, type EmptyStateProps } from "../empty-state";
import {
  Filter,
  type FilterItemProps,
  type FilterSearchConfig,
} from "../filter";
import { useUrlSearchParams } from "../hooks";
import { type ActionType, type SaveViewConfig } from "../index-table";
import { OrderDirection } from "../index-table/order-direction";
import { OrderDirectionList } from "../index-table/order-direction-list";
import { Input } from "../input";
import { useModal } from "../modal";
import { Popover } from "../popover";
import { RadioGroup, type RadioGroupOption } from "../radio-group";
import {
  type TableActionType,
  type TableColumnProps,
  type TableProps,
} from "../table";
import { Tooltip } from "../tooltip";
import { type Field } from "../types";
import { transformTypeValue } from "../utils";
import { View, type ViewProps } from "../view";
import { ListTable } from "./list-table";
import {
  type IndexTableEdge,
  type IndexTablePageInfo,
  type IndexTablePagination,
  type IndexTableValue,
} from "./types";

export interface IndexListProps<Node, OrderField> {
  emptyStateIcon?: EmptyStateProps["icon"];
  emptyStateTitle?: EmptyStateProps["title"];
  rowSelection?: {
    single?: boolean;
    allowSelectAll?: boolean;
    onSelectionChange?: (rows: Node[]) => void;
    bulkActions?: (rows: Node[], isSelectedAll: boolean) => ActionProps[];
  };
  emptyStateDescription?: EmptyStateProps["description"];
  actionRef?: RefObject<ActionType>;
  edges?: Array<IndexTableEdge<Node>>;
  filters?: Array<FilterItemProps<Node>>;
  search?: false | FilterSearchConfig;
  footer?: ReactNode;
  orderOptions?: RadioGroupOption[];
  columns: Array<TableColumnProps<Node>>;
  pageSize?: number;
  pageInfo?: IndexTablePageInfo;
  loading?: boolean;
  value?: IndexTableValue<OrderField>;
  defaultFilterValue?: Record<Field<Node>, any>;
  viewConfig?: ViewProps & {
    saveViewLoading?: boolean;
    onSaveView?: (viewKey: string, config: SaveViewConfig) => void;
  };
  toolBarRender?: () => ReactNode;
  onChange?: (value: IndexTableValue<OrderField>) => void;
  onRow?: TableProps<Node>["onRow"];
}

export function IndexList<Node, OrderField extends string>({
  emptyStateIcon,
  emptyStateTitle,
  actionRef,
  emptyStateDescription,
  defaultFilterValue,
  footer,
  filters = [],
  columns = [],
  search,
  edges,
  orderOptions,
  pageSize = 10,
  pageInfo,
  loading = false,
  value = {},
  rowSelection,
  viewConfig,
  toolBarRender,
  onChange,
  onRow,
}: IndexListProps<Node, OrderField>): ReactElement {
  const modal = useModal();
  const { control, getValues, trigger } = useForm();

  // 在视图模式下，是否显示过滤组件
  const [showFilterComponent, setShowFilterComponent] = useState(false);

  // 当前进行过滤操作时选中的视图 key
  const currentSelectedViewKeyRef = useRef<string | undefined>();

  const [filterValues, setFilterValues] = useState<
    Record<Field<Node>, any> | undefined
  >(defaultFilterValue);

  /* eslint-disable @typescript-eslint/restrict-template-expressions */
  const query = useMemo(() => {
    return compact([
      trim((filterValues as any)?.query),
      trim(
        filters.reduce((result, filter) => {
          const filterValue: any = get(filterValues ?? {}, filter.field);

          if (typeof filterValue !== "undefined") {
            if (typeof filterValue === "string") {
              return `${result} ${filter.field}: "${filterValue}"`;
            }

            if (filterValue instanceof Array) {
              if (filterValue.length === 0) {
                return result;
              }

              if (
                filterValue[0] instanceof Date &&
                filterValue[1] instanceof Date
              ) {
                return `${result} (${filterValue
                  .map((item: Date, index) => {
                    return `${filter.field}:${index === 0 ? ">=" : "<="}${
                      index === 0
                        ? dayjs(item).toISOString()
                        : dayjs(item).endOf("day").toISOString()
                    }`;
                  })
                  .join(" ")})`;
              }

              return `${result} (${filterValue
                .map((item) => {
                  if (typeof item === "string") {
                    return `${filter.field}: "${item}"`;
                  }

                  return `${filter.field}: "${item}"`;
                })
                .join(" OR ")})`;
            }

            return `${result} ${filter.field}: ${
              filterValue instanceof Date
                ? filterValue.toISOString()
                : filterValue
            }`;
          }

          return result;
        }, ""),
      ),
    ])
      .map((item) => `(${item})`)
      .join(" ");
  }, [filterValues, filters]);

  const [pagination, setPagination] = useState<IndexTablePagination>(
    pick(value, ["first", "after", "last", "before"]),
  );

  const [orderField, setOrderField] = useState(value?.orderBy?.field);
  const [orderDirection, setOrderDirection] = useState(
    value?.orderBy?.direction,
  );

  // 是否启用视图
  const enabledView = useMemo(
    () => Boolean(viewConfig?.items?.length),
    [viewConfig],
  );

  const [searchParams, setSearchParams] = useUrlSearchParams(
    ["selectedView", "query", ...filters.map((item) => item.field)],
    !enabledView,
  );

  const tableActionRef = useRef<TableActionType>(null);

  // 一些可以手动触发的特殊操作
  useImperativeHandle(
    actionRef,
    () => ({
      reloadAndRest: () => {
        setPagination({});
      },
      setFilterValues: (
        filterValues: Record<Field<Node>, any>,
        syncToUrl = false,
      ) => {
        syncToUrl
          ? setSearchParams(filterValues)
          : setFilterValues(filterValues);
      },
    }),
    [setFilterValues, setSearchParams],
  );

  const handlePrevClick = useCallback(() => {
    setPagination({ last: pageSize, before: pageInfo?.startCursor });
  }, [pageSize, pageInfo?.startCursor]);

  const handleNextClick = useCallback(() => {
    setPagination({ first: pageSize, after: pageInfo?.endCursor });
  }, [pageSize, pageInfo?.endCursor]);

  // 处理视图保存
  const handleViewSave = useCallback(() => {
    const config: SaveViewConfig = {};

    const omitQueryFilters = omit(filterValues, "query");

    if (typeof (filterValues as Record<string, any>)?.query !== "undefined") {
      config.query = (filterValues as Record<string, any>).query;
    }

    if (typeof omitQueryFilters !== "undefined" && !isEmpty(omitQueryFilters)) {
      config.filters = omitQueryFilters;
    }

    const generateNewView = (): void => {
      const viewNameInputMarker = "new_view_name";

      const close = modal({
        title: "Create new View",
        content: (
          <Controller
            control={control}
            name={viewNameInputMarker}
            render={({ field, fieldState: { error } }) => (
              <Input
                label="Name"
                maxLength={40}
                {...field}
                error={error?.message}
                onChange={(e) => {
                  field.onChange(e);

                  // 如果存在错误，输入的时候触发验证
                  if (typeof error !== "undefined") {
                    trigger(viewNameInputMarker).catch(() => {});
                  }
                }}
              />
            )}
            rules={{
              required: "view name is required",
            }}
          />
        ),
        primaryAction: {
          content: "Save",
          onClick: async () => {
            const validatedPass = await trigger(viewNameInputMarker);

            if (validatedPass) {
              viewConfig?.onAdd?.(getValues(viewNameInputMarker), config);

              close();

              setShowFilterComponent(false);
            }
          },
        },
      });
    };

    if (typeof currentSelectedViewKeyRef.current !== "undefined") {
      if (
        typeof viewConfig !== "undefined" &&
        typeof viewConfig.items.find(
          (item) =>
            item.key === currentSelectedViewKeyRef.current &&
            item.canEdit !== false,
        ) !== "undefined"
      ) {
        viewConfig?.onSaveView?.(currentSelectedViewKeyRef.current, config);
        setShowFilterComponent(false);
        currentSelectedViewKeyRef.current = undefined;
      } else {
        generateNewView();
      }
    } else {
      generateNewView();
    }
  }, [control, filterValues, getValues, modal, trigger, viewConfig]);

  // 处理 url 参数
  const transformedParams = useMemo(() => {
    // 如果启用视图，并且 url 不存在 selectedView 参数，则将 url 参数转换为对应的类型
    if (enabledView && typeof searchParams?.selectedView === "undefined") {
      const result = {
        ...pick(searchParams, [...filters.map((item) => item.field), "query"]),
      };

      filters.forEach((filterItem) => {
        const { field, type, itemType } = filterItem;

        if (field in result && type != null) {
          result[field] = transformTypeValue(result[field], type, itemType);
        }
      });

      return result;
    } else {
      return filterValues;
    }
  }, [enabledView, searchParams, filters, filterValues]);

  // 当启用视图并且 searchParams 发生变化的时候，更新 filterValues
  useEffect(() => {
    if (!isEqual(transformedParams, filterValues)) {
      setFilterValues(transformedParams as any);
      setPagination({});
    }
  }, [filterValues, transformedParams]);

  // 如果 url 不存在 selectedView 参数，则根据过滤项和查询条件来决定是否显示过滤组件
  useEffect(() => {
    if (enabledView && typeof searchParams?.selectedView === "undefined") {
      if (
        filters.some(
          (item) => typeof searchParams?.[item.field] !== "undefined",
        ) ||
        typeof searchParams?.query !== "undefined"
      ) {
        if (!showFilterComponent) {
          setShowFilterComponent(true);
        }
      } else {
        setSearchParams({
          selectedView: viewConfig?.items[0].key,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledView, filters, searchParams, viewConfig, showFilterComponent]);

  // 当视图参数存在，但是视图参数不包含在配置项里面时，则将视图参数设置为第一个视图
  useEffect(() => {
    if (
      enabledView &&
      typeof searchParams?.selectedView !== "undefined" &&
      typeof viewConfig !== "undefined" &&
      !viewConfig.items.some((item) => item.key === searchParams.selectedView)
    ) {
      setSearchParams({
        selectedView: viewConfig.items[0].key,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledView, viewConfig, searchParams]);

  useEffect(() => {
    onChange?.({
      query,
      ...(Object.keys(pagination).length > 0
        ? pagination
        : { first: pageSize }),
      ...(typeof orderField !== "undefined"
        ? {
            orderBy: {
              field: orderField,
              direction: orderDirection ?? OrderDirection.ASC,
            },
          }
        : {}),
    });

    tableActionRef.current?.resetRowSelection?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, pagination, pageSize, orderField, orderDirection, tableActionRef]);

  return (
    <div className="divide-y divide-gray-300 rounded-md bg-white pt-3 shadow">
      <div>
        {typeof toolBarRender !== "undefined" && (
          <div className="px-3 pb-3">{toolBarRender()}</div>
        )}

        <div className="flex items-center px-3 pb-3">
          {enabledView && !showFilterComponent && (
            <div className="mr-2 flex-1 overflow-x-auto">
              {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
              <View {...viewConfig!} />
            </div>
          )}

          <Filter<Node>
            extra={
              <>
                {enabledView ? (
                  showFilterComponent ? (
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowFilterComponent(false);

                          setSearchParams({
                            selectedView:
                              typeof currentSelectedViewKeyRef.current !==
                              "undefined"
                                ? currentSelectedViewKeyRef.current
                                : viewConfig?.items[0].key,
                          });

                          currentSelectedViewKeyRef.current = undefined;
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        classNames={{
                          root: "[&>span>span]:flex-shrink-0",
                        }}
                        loading={viewConfig?.saveViewLoading}
                        size="sm"
                        variant="ghost"
                        onClick={handleViewSave}
                      >
                        Save
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <Tooltip content="Search and filter">
                      <Button
                        classNames={{ root: "p-2" }}
                        icon={FunnelIcon}
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowFilterComponent(true);
                          currentSelectedViewKeyRef.current =
                            searchParams?.selectedView;
                        }}
                      />
                    </Tooltip>
                  )
                ) : undefined}

                {typeof orderOptions !== "undefined" &&
                orderOptions.length > 0 ? (
                  <Popover
                    activator={
                      <div>
                        <Tooltip content="Sort">
                          <Button
                            classNames={{ root: "p-2" }}
                            icon={ArrowsUpDownIcon}
                            size="sm"
                            variant="ghost"
                          />
                        </Tooltip>
                      </div>
                    }
                    contentConfig={{
                      className: "p-2",
                    }}
                  >
                    <RadioGroup
                      options={orderOptions}
                      value={orderField}
                      onChange={(value) => {
                        setPagination({});
                        setOrderField(value as OrderField);
                      }}
                    />
                    <OrderDirectionList
                      value={orderDirection}
                      onChange={(value) => {
                        setPagination({});
                        setOrderDirection(value);
                      }}
                    />
                  </Popover>
                ) : undefined}
              </>
            }
            filters={filters}
            loading={loading}
            search={
              !enabledView || (enabledView && showFilterComponent)
                ? search
                : false
            }
            showFilterItems={
              !enabledView || (enabledView && showFilterComponent)
            }
            values={filterValues}
            onChange={(result) => {
              // 根据是否开启视图来决定如何更新过滤项
              if (enabledView) {
                setSearchParams(result);
              } else {
                setFilterValues(result);
                setPagination({});
              }
            }}
          />
        </div>
      </div>

      {typeof edges !== "undefined" && edges.length > 0 ? (
        <ListTable
          columns={columns}
          data={edges.map((edge) => edge.node)}
          rowSelection={rowSelection}
          tableActionRef={tableActionRef}
          onRow={onRow}
        />
      ) : (
        <EmptyState
          className="py-10"
          description={emptyStateDescription}
          icon={emptyStateIcon}
          title={emptyStateTitle}
        />
      )}

      {footer}

      {(pageInfo?.hasPreviousPage === true ||
        pageInfo?.hasNextPage === true) && (
        <div className="flex justify-center gap-2 p-5">
          <Button
            className="p-2"
            disabled={!pageInfo?.hasPreviousPage}
            onClick={handlePrevClick}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            className="p-2"
            disabled={!pageInfo?.hasNextPage}
            onClick={handleNextClick}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
