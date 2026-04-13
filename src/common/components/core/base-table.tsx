import {
  Button,
  Card,
  Space,
  Table,
  type TableColumnsType,
  type TableProps,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import React from 'react';

export interface BaseTableProps<T>
  extends Omit<TableProps<T>, 'pagination' | 'columns'> {
  pagination?: false | TablePaginationConfig;
  loading?: boolean;
  showPagination?: boolean;
  headerTitle?: React.ReactNode;
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  onRow?: (
    record: T,
    index?: number,
  ) => { onClick?: (event: React.MouseEvent<HTMLElement>) => void };
  columns?: TableColumnsType<T>;
}

function BaseTable<T extends object>({
  pagination,
  loading,
  showPagination = true,
  headerTitle,
  onSelectionChange,
  columns,
  onRow,
  ...tableProps
}: BaseTableProps<T>) {
  return (
    <Card styles={{ body: { padding: 0 } }}>
      {headerTitle && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
            fontWeight: 500,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{headerTitle}</span>
        </div>
      )}
      <Table<T>
        loading={loading}
        pagination={showPagination ? pagination : false}
        rowSelection={
          onSelectionChange
            ? {
                onChange: (selectedRowKeys, selectedRows) => {
                  onSelectionChange(selectedRowKeys, selectedRows);
                },
              }
            : undefined
        }
        columns={columns}
        onRow={onRow}
        {...tableProps}
      />
    </Card>
  );
}

export interface BaseTableColumnProps {
  title: React.ReactNode;
  dataIndex?: string;
  key?: string;
  width?: string | number;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

export const BaseTableColumn: React.FC<BaseTableColumnProps> = () => null;

export interface BaseTableActionsProps {
  render: (value: any, record: any, index: number) => React.ReactNode;
}

export const BaseTableActions: React.FC<BaseTableActionsProps> = () => null;

BaseTable.Column = BaseTableColumn;
BaseTable.Actions = BaseTableActions;

export interface BaseTableActionButton {
  key: string;
  label: string;
  danger?: boolean;
  onClick: (record: any) => void;
}

export interface BaseTableWithActionsProps<T> {
  columns?: TableColumnsType<T>;
  actions?: BaseTableActionButton[];
  onRowClick?: (record: T) => void;
  pagination?: false | TablePaginationConfig;
  loading?: boolean;
  showPagination?: boolean;
  headerTitle?: React.ReactNode;
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
  dataSource?: T[];
  rowKey?: keyof T | ((record: T) => string);
}

export function createBaseTableWithActions<T extends object>(
  config: BaseTableWithActionsProps<T>,
): React.ReactNode {
  const { actions, onRowClick, columns: restColumns, ...rest } = config;

  const actionColumn: TableColumnsType<T>[number] = {
    title: 'Thao tác',
    key: 'actions',
    width: actions ? actions.length * 100 : 150,
    render: (_: any, record: T) => (
      <Space>
        {actions?.map((action) => (
          <Button
            key={action.key}
            type="link"
            danger={action.danger}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(record);
            }}
          >
            {action.label}
          </Button>
        ))}
      </Space>
    ),
  };

  const columns = restColumns ? [...restColumns, actionColumn] : [actionColumn];

  return (
    <BaseTable<T>
      {...rest}
      columns={columns}
      rowKey={rest.rowKey as keyof T | ((record: T) => string) | undefined}
      onRow={
        onRowClick
          ? () => ({
              onClick: () => {},
              style: { cursor: 'pointer' },
            })
          : undefined
      }
    />
  );
}

export default BaseTable;
