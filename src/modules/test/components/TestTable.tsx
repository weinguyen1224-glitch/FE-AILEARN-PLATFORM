import { useBoolean } from "ahooks";
import { Button, Space } from "antd";
import type { FC } from "react";
import React from "react";

import BaseModal from "@/common/components/core/base-modal";
import BaseTable from "@/common/components/core/base-table";
import { useDeleteTest, useGetTestPage } from "../hooks/test.hooks";
import type { Test } from "../types/test.types";

import type { TestFormRef } from "./TestForm";
import TestForm from "./TestForm";

export interface TestTableProps {
  onEdit?: (record: Test) => void;
}

const TestTable: FC<TestTableProps> = ({ onEdit }) => {
  const { data, loading, refresh } = useGetTestPage();
  const { run: deleteRecord, loading: deleting } = useDeleteTest();

  const [
    deleteModalOpen,
    { setTrue: openDeleteModal, setFalse: closeDeleteModal },
  ] = useBoolean(false);
  const [selectedRecord, setSelectedRecord] = React.useState<Test | null>(null);

  const [formOpen, { setTrue: openForm, setFalse: closeForm }] =
    useBoolean(false);
  const formRef = React.useRef<TestFormRef>(null);

  const handleDelete = (record: Test) => {
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

  const handleEdit = (record: Test) => {
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
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 80,
    },
    {
      title: "Mã",
      dataIndex: "ma",
      key: "ma",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_: any, record: Test) => (
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
      selectedRecord.ma +
      "'? Hành động này không thể hoàn tác."
    : "Bạn có chắc chắn muốn xóa?";

  return (
    <>
      <BaseTable<Test>
        headerTitle={
          <Button type="primary" onClick={handleCreate}>
            Thêm mới
          </Button>
        }
        loading={loading}
        dataSource={data?.items}
        columns={columns}
        rowKey="id"
        pagination={
          data
            ? {
                total: data.total,
                pageSize: data.size,
                current: data.page,
              }
            : false
        }
      />

      <BaseModal.Form
        open={formOpen}
        title={selectedRecord?.id ? "Sửa Test" : "Thêm mới Test"}
        onCancel={closeForm}
        onSubmit={() => formRef.current?.submit()}
        loading={false}
      >
        <TestForm ref={formRef} onSuccess={handleFormSuccess} />
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

export default TestTable;
