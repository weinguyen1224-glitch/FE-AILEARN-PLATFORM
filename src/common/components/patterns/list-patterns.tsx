import { useBoolean } from 'ahooks';
import { Button, Space, Table, type TableColumnsType, Tag } from 'antd';
import React, { type FC } from 'react';
import BaseModal from '../core/base-modal';
import BaseTable from '../core/base-table';

export interface BaseListPatternProps<T extends { id: number | string }> {
  dataSource?: T[];
  loading?: boolean;
  pagination?: any;
  columns: TableColumnsType<T>;
  rowKey?: keyof T | ((record: T) => string);
  headerTitle?: React.ReactNode;
  onCreate?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  onRefresh?: () => void;
  createText?: string;
  deleteConfirmTitle?: string;
}

export function createBaseListPattern<
  T extends { id: number | string; name?: string },
>() {
  return function BaseListPattern({
    dataSource,
    loading,
    pagination,
    columns,
    rowKey = 'id',
    headerTitle,
    onCreate,
    onEdit,
    onDelete,
    onView,
    onRefresh,
    createText = 'Thêm mới',
    deleteConfirmTitle,
  }: BaseListPatternProps<T>) {
    const [
      deleteModalOpen,
      { setTrue: openDeleteModal, setFalse: closeDeleteModal },
    ] = useBoolean(false);
    const [selectedRecord, setSelectedRecord] = React.useState<T | null>(null);

    const handleDelete = (record: T) => {
      setSelectedRecord(record);
      openDeleteModal();
    };

    const confirmDelete = () => {
      if (selectedRecord && onDelete) {
        onDelete(selectedRecord);
      }
      closeDeleteModal();
    };

    const actionColumns: TableColumnsType<T> = [
      ...columns,
      {
        title: 'Thao tác',
        key: 'actions',
        width: 150,
        fixed: 'right' as const,
        render: (_: any, record: T) => (
          <Space>
            {onView && (
              <Button type="link" onClick={() => onView(record)}>
                Chi tiết
              </Button>
            )}
            {onEdit && (
              <Button type="link" onClick={() => onEdit(record)}>
                Sửa
              </Button>
            )}
            {onDelete && (
              <Button type="link" danger onClick={() => handleDelete(record)}>
                Xóa
              </Button>
            )}
          </Space>
        ),
      },
    ];

    return (
      <>
        <BaseTable<T>
          headerTitle={
            onCreate ? (
              <Button type="primary" onClick={onCreate}>
                {createText}
              </Button>
            ) : (
              headerTitle
            )
          }
          loading={loading}
          dataSource={dataSource}
          columns={actionColumns}
          rowKey={rowKey}
          pagination={pagination}
        />

        <BaseModal.Confirm
          open={deleteModalOpen}
          title="Xác nhận xóa"
          content={
            deleteConfirmTitle ||
            (selectedRecord?.name
              ? `Bạn có chắc chắn muốn xóa "${selectedRecord.name}"? Hành động này không thể hoàn tác.`
              : 'Bạn có chắc chắn muốn xóa?')
          }
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          icon="danger"
        />
      </>
    );
  };
}

export interface SearchListPatternProps<T extends { id: number | string }> {
  dataSource?: T[];
  loading?: boolean;
  pagination?: any;
  columns: TableColumnsType<T>;
  searchPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  onSearch?: (value: string) => void;
  onFilterChange?: (value: string) => void;
  onCreate?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  createText?: string;
}

export function createSearchListPattern<
  T extends { id: number | string; name?: string },
>() {
  return function SearchListPattern({
    dataSource,
    loading,
    pagination,
    columns,
    searchPlaceholder = 'Tìm kiếm...',
    filterOptions,
    onSearch,
    onFilterChange,
    onCreate,
    onEdit,
    onDelete,
    createText = 'Thêm mới',
  }: SearchListPatternProps<T>) {
    const [selectedRecord, setSelectedRecord] = React.useState<T | null>(null);
    const [
      deleteModalOpen,
      { setTrue: openDeleteModal, setFalse: closeDeleteModal },
    ] = useBoolean(false);
    const [searchValue, setSearchValue] = React.useState('');

    const handleDelete = (record: T) => {
      setSelectedRecord(record);
      openDeleteModal();
    };

    const confirmDelete = () => {
      if (selectedRecord && onDelete) {
        onDelete(selectedRecord);
      }
      closeDeleteModal();
    };

    const handleSearch = (value: string) => {
      setSearchValue(value);
      onSearch?.(value);
    };

    const actionColumns: TableColumnsType<T> = [
      ...columns,
      {
        title: 'Thao tác',
        key: 'actions',
        width: 150,
        render: (_: any, record: T) => (
          <Space>
            {onEdit && (
              <Button type="link" onClick={() => onEdit(record)}>
                Sửa
              </Button>
            )}
            {onDelete && (
              <Button type="link" danger onClick={() => handleDelete(record)}>
                Xóa
              </Button>
            )}
          </Space>
        ),
      },
    ];

    return (
      <>
        <BaseTable<T>
          headerTitle={
            onCreate ? (
              <Space>
                <Button type="primary" onClick={onCreate}>
                  {createText}
                </Button>
              </Space>
            ) : undefined
          }
          loading={loading}
          dataSource={dataSource}
          columns={actionColumns}
          rowKey="id"
          pagination={pagination}
        />

        <BaseModal.Confirm
          open={deleteModalOpen}
          title="Xác nhận xóa"
          content={
            selectedRecord?.name
              ? `Bạn có chắc chắn muốn xóa "${selectedRecord.name}"? Hành động này không thể hoàn tác.`
              : 'Bạn có chắc chắn muốn xóa?'
          }
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          icon="danger"
        />
      </>
    );
  };
}

export default { createBaseListPattern, createSearchListPattern };
