import { useBoolean } from "ahooks";
import { Button, Space } from "antd";
import type { FC } from "react";
import React from "react";

import BaseModal from "@/common/components/core/base-modal";
import BaseTable from "@/common/components/core/base-table";
import { useDeleteUser, useGetUserPage } from "@/modules/user/hooks/user.hooks";
import type { User } from "@/modules/user/types/user.types";

import type { UserFormRef } from "./UserForm";
import UserForm from "./UserForm";

const UserTable: FC = () => {
  const { data, loading, refresh } = useGetUserPage();
  const { run: deleteRecord, loading: deleting } = useDeleteUser();

  const [
    deleteModalOpen,
    { setTrue: openDeleteModal, setFalse: closeDeleteModal },
  ] = useBoolean(false);
  const [selectedRecord, setSelectedRecord] = React.useState<User | null>(null);

  const [formOpen, { setTrue: openForm, setFalse: closeForm }] =
    useBoolean(false);
  const formRef = React.useRef<UserFormRef>(null);

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
    formRef.current?.setData(record);
    openForm();
  };

  const handleCreate = () => {
    setSelectedRecord(null);
    formRef.current?.reset();
    openForm();
  };

  const handleFormSuccess = () => {
    closeForm();
    refresh();
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Password", dataIndex: "password", key: "password" },
    { title: "SoDienThoai", dataIndex: "soDienThoai", key: "soDienThoai" },
    { title: "NgaySinh", dataIndex: "ngaySinh", key: "ngaySinh" },
    { title: "AvatarUrl", dataIndex: "avatarUrl", key: "avatarUrl" },
    { title: "DiaChi", dataIndex: "diaChi", key: "diaChi" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "HoTen", dataIndex: "hoTen", key: "hoTen" },
    { title: "VaiTro", dataIndex: "vaiTro", key: "vaiTro" },
    { title: "Active", dataIndex: "active", key: "active" },
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
          <Button type="primary" onClick={handleCreate}>
            Thêm mới
          </Button>
        }
        loading={loading}
        dataSource={data?.items}
        columns={columns}
        rowKey="id"
        pagination={data?.pagination}
      />

      <BaseModal.Form
        open={formOpen}
        title={selectedRecord?.id ? "Sửa User" : "Thêm mới User"}
        onCancel={closeForm}
        onSubmit={() => formRef.current?.submit()}
        loading={false}
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
