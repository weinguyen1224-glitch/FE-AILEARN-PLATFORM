import { useBoolean } from "ahooks";
import { Button, Space } from "antd";
import type { FC } from "react";
import React from "react";

import BaseModal from "@/common/components/core/base-modal";
import BaseTable from "@/common/components/core/base-table";
import { useDeleteUser, useGetUserPage } from "../hooks/user.hooks";
import type { User } from "../types/user.types";

import type { UserFormRef } from "./UserForm";
import UserForm from "./UserForm";

export interface UserTableProps {
  onEdit?: (record: User) => void;
}

const UserTable: FC<UserTableProps> = ({ onEdit }) => {
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
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
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
    ? "Bạn có chắc chắn muốn xóa '" +
      selectedRecord.name +
      "'? Hành động này không thể hoàn tác."
    : "Bạn có chắc chắn muốn xóa?";

  return (
    <>
      <BaseTable<User>
        headerTitle={
          <Button type="primary" onClick={handleCreate}>
            Thêm mới
          </Button>
        }
        loading={loading}
        dataSource={data?.data}
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
        <UserForm
          ref={formRef}
          open={formOpen}
          onOpenChange={closeForm}
          onSuccess={handleFormSuccess}
        />
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
