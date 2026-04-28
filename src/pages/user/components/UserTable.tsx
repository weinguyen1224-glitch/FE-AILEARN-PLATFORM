import { useBoolean } from "ahooks";
import { Button, Space, Spin } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import type { FC } from "react";
import React from "react";

import BaseModal from "@/common/components/core/base-modal";
import BaseTable from "@/common/components/core/base-table";
import { qb } from "@/common/utils/query-builder";
import { useDeleteUser, useGetUserPage } from "@/modules/user/hooks/user.hooks";
import type { User } from "@/modules/user/types/user.types";

import type { UserFormRef } from "./UserForm";
import UserForm from "./UserForm";

const UserTable: FC = () => {
  const [queryParams, setQueryParams] = React.useState<Record<string, any>>({});
  const [refreshKey, setRefreshKey] = React.useState(0);

  const { data, loading, refresh } = useGetUserPage(
    { ...queryParams, _t: refreshKey },
    { refreshDeps: [refreshKey] }
  );
  const { run: deleteRecord, loading: deleting } = useDeleteUser();

  const [
    deleteModalOpen,
    { setTrue: openDeleteModal, setFalse: closeDeleteModal },
  ] = useBoolean(false);
  const [selectedRecord, setSelectedRecord] = React.useState<User | null>(null);

  const [formOpen, { setTrue: openForm, setFalse: closeForm }] =
    useBoolean(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const formRef = React.useRef<UserFormRef>(null);

  const handleSearch = (values: Record<string, any>) => {
    const query = qb<User>().page(1).size(10);
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        query.like(key as keyof User, value as string);
      }
    });
    setQueryParams(query.buildQueryParams());
    setRefreshKey((k) => k + 1);
  };

  const handleTableChange = (
    pagination: any,
    filters: any,
    sorter: SorterResult<User> | SorterResult<User>[]
  ) => {
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;

    const query = qb<User>().page(1).size(10);
    Object.entries(queryParams.filter || {}).forEach(([key, value]) => {
      if (value) {
        query.like(key as keyof User, value as string);
      }
    });
    if (singleSorter?.field) {
      const field = singleSorter.field as keyof User;
      const order = singleSorter.order === "ascend" ? "ASC" : "DESC";
      query.orderBy(field, order);
    }

    setQueryParams(query.buildQueryParams());
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (record: User) => {
    setSelectedRecord(record);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (selectedRecord?.id) {
      await deleteRecord(selectedRecord.id);
      closeDeleteModal();
      refresh();
    }
  };

  const handleEdit = (record: User) => {
    setSelectedRecord(record);
    setIsEdit(true);
    formRef.current?.setData(record);
    openForm();
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    setIsEdit(false);
    formRef.current?.reset();
    openForm();
  };

  const handleFormSuccess = () => {
    closeForm();
    setIsEdit(false);
    refresh();
  };

  const columns = [
    { title: "Mã", dataIndex: "ma", key: "ma", width: 120, sorter: true },
    { title: "Username", dataIndex: "username", key: "username", sorter: true },
    { title: "Password", dataIndex: "password", key: "password" },
    {
      title: "Số điện thoại",
      dataIndex: "soDienThoai",
      key: "soDienThoai",
      sorter: true,
    },
    { title: "NgaySinh", dataIndex: "ngaySinh", key: "ngaySinh", sorter: true },
    { title: "AvatarUrl", dataIndex: "avatarUrl", key: "avatarUrl" },
    { title: "DiaChi", dataIndex: "diaChi", key: "diaChi" },
    { title: "Email", dataIndex: "email", key: "email", sorter: true },
    { title: "HoTen", dataIndex: "hoTen", key: "hoTen", sorter: true },
    { title: "VaiTro", dataIndex: "vaiTro", key: "vaiTro", sorter: true },
    { title: "Active", dataIndex: "active", key: "active", sorter: true },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const deleteContent = selectedRecord?.id
    ? "Bạn có chắc chắn muốn xóa?"
    : "Xác nhận xóa?";

  return (
    <>
      <BaseTable<User>
        headerTitle={
          <Space>
            {loading && <Spin size="small" />}
            <Button type="primary" onClick={handleCreate}>
              Thêm mới
            </Button>
          </Space>
        }
        loading={loading}
        dataSource={data?.items}
        columns={columns}
        rowKey="id"
        pagination={data?.pagination}
        onChange={handleTableChange}
        onSubmit={handleSearch}
        search={{
          labelWidth: 120,
        }}
      />

      <BaseModal.Form
        open={formOpen}
        title={isEdit ? "Sửa User" : "Thêm mới User"}
        onCancel={closeForm}
        onSubmit={() => formRef.current?.submit()}
        loading={false}
        submitText={isEdit ? "Cập nhật" : "Thêm mới"}
      >
        <UserForm ref={formRef} onSuccess={handleFormSuccess} />
      </BaseModal.Form>

      <BaseModal.Confirm
        open={deleteModalOpen}
        title="Xác nhận xóa"
        content={deleteContent}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isConfirming={deleting}
        icon="danger"
      />
    </>
  );
};

export default UserTable;
