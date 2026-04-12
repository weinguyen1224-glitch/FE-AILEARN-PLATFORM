import { Card, Table, type TableProps } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import React from 'react';

export interface BaseTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  pagination?: false | TablePaginationConfig;
  loading?: boolean;
  showPagination?: boolean;
  headerTitle?: string;
  onSelectionChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
}

function BaseTable<T extends object>({
  pagination,
  loading,
  showPagination = true,
  headerTitle,
  onSelectionChange,
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
          }}
        >
          {headerTitle}
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
        {...tableProps}
      />
    </Card>
  );
}

export default BaseTable;
