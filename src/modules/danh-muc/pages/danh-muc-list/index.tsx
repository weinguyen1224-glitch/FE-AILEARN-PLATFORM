import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { request } from '@umijs/max';
import { Button, Modal, message, Tag } from 'antd';
import type { FC } from 'react';
import React, { useRef, useState } from 'react';
import type { DanhMuc } from '../../types/danh-muc.types';
import DanhMucModal from './components/DanhMucModal';

const DanhMucListPage: FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DanhMuc | undefined>();

  const fetchData = async (params: Record<string, any>) => {
    const response = await request<{
      data: DanhMuc[];
      total: number;
      page: number;
      size: number;
    }>('/danh-muc/page', {
      params: {
        page: params.current,
        size: params.pageSize,
        search: params.keyword,
      },
    });
    return {
      data: response.data,
      total: response.total,
      success: true,
    };
  };

  const handleAdd = () => {
    setEditingRecord(undefined);
    setModalVisible(true);
  };

  const handleEdit = (record: DanhMuc) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request(`/danh-muc/${id}`, { method: 'DELETE' });
      message.success('Xóa thành công');
      actionRef.current?.reload();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingRecord(undefined);
    actionRef.current?.reload();
  };

  const columns: any[] = [
    {
      title: 'STT',
      dataIndex: 'stt',
      width: 80,
      sorter: true,
    },
    {
      title: 'Mã',
      dataIndex: 'ma',
      width: 120,
      copyable: true,
    },
    {
      title: 'Tên',
      dataIndex: 'ten',
      width: 200,
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Danh mục cha',
      dataIndex: ['danhMucCha', 'ten'],
      width: 150,
      render: (_: any, record: DanhMuc) => record.danhMucCha?.ten || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 150,
      render: (_: any, record: DanhMuc) => [
        <a key="edit" onClick={() => handleEdit(record)}>
          Sửa
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: 'Xác nhận xóa',
              content: `Bạn có chắc muốn xóa danh mục "${record.ten}"?`,
              okText: 'Xóa',
              cancelText: 'Hủy',
              onOk: () => handleDelete(record.id),
            });
          }}
        >
          Xóa
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<DanhMuc>
        headerTitle="Danh sách danh mục"
        actionRef={actionRef}
        rowKey="id"
        request={fetchData}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm mới
          </Button>,
        ]}
      />
      <DanhMucModal
        visible={modalVisible}
        record={editingRecord}
        onClose={handleModalClose}
      />
    </PageContainer>
  );
};

export default DanhMucListPage;
