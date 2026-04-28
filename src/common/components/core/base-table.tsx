import {
  ProTable,
  type ActionType,
  type ProColumns,
} from "@ant-design/pro-components";
import { Button, Space } from "antd";
import type { Key, ReactNode } from "react";
import React, { useCallback, useState } from "react";

export interface BaseTableProps<T extends object>
  extends Omit<
    React.ComponentProps<typeof ProTable<T, any>>,
    "actionRef" | "toolBarRender" | "columns"
  > {
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  headerTitle?: ReactNode;
  toolBarActions?: ReactNode[];
  columns?: ProColumns<T>[];
  loading?: boolean;
  onSelectionChange?: (keys: Key[], rows: T[]) => void;
  rowKey?: string | ((record: T) => string);
}

function BaseTable<T extends object>({
  actionRef,
  headerTitle,
  toolBarActions,
  columns,
  loading,
  onSelectionChange,
  rowKey = "id",
  ...restProps
}: BaseTableProps<T>) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const handleSelectionChange = useCallback(
    (keys: Key[], rows: T[]) => {
      setSelectedRowKeys(keys);
      onSelectionChange?.(keys, rows);
    },
    [onSelectionChange]
  );

  return (
    <ProTable<T, any>
      actionRef={actionRef}
      headerTitle={headerTitle}
      rowKey={rowKey}
      loading={loading}
      search={{ labelWidth: 120 }}
      toolBarRender={() => toolBarActions || []}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} trên ${total}`,
        pageSizeOptions: ["10", "20", "50", "100"],
      }}
      columns={columns}
      rowSelection={
        onSelectionChange
          ? { selectedRowKeys, onChange: handleSelectionChange }
          : undefined
      }
      options={{ reload: true, density: true, fullScreen: true }}
      scroll={{ x: "max-content" }}
      {...restProps}
    />
  );
}

export interface BaseTableAction<T = any> {
  key: string;
  label: string;
  danger?: boolean;
  onClick: (record: T) => void;
}

export function createActionColumn<T>(
  actions: BaseTableAction<T>[],
  width?: number
): ProColumns<T> {
  return {
    title: "Thao tác",
    key: "action",
    width: width || actions.length * 80 + 40,
    fixed: "right",
    render: (_, record) => (
      <Space size={4}>
        {actions.map((act) => (
          <Button
            key={act.key}
            type="link"
            size="small"
            danger={act.danger}
            onClick={(e) => {
              e.stopPropagation?.();
              act.onClick(record);
            }}
          >
            {act.label}
          </Button>
        ))}
      </Space>
    ),
  };
}

export function createStatusColumn<T>(
  dataIndex: string,
  valueEnum: Record<string, { text: string; status: string }>,
  title?: string
): ProColumns<T> {
  return {
    title: title || dataIndex,
    dataIndex,
    valueType: "select",
    valueEnum,
  };
}

export function createDateColumn<T>(
  dataIndex: string,
  title?: string
): ProColumns<T> {
  return {
    title: title || dataIndex,
    dataIndex,
    valueType: "dateTime",
    sorter: true,
  };
}

export type { ActionType, ProColumns } from "@ant-design/pro-components";
export default BaseTable;
