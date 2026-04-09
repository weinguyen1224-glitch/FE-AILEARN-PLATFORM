import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { request } from '@umijs/max';
import { Button, Image, Modal, message, Tag } from 'antd';
import type { FC } from 'react';
import React, { useRef, useState } from 'react';
import type { SanPham } from '../../types/san-pham.types';
import SanPhamModal from './components/SanPhamModal';

const SanPhamListPage: FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SanPham | undefined>();

  const fetchData = async (params: Record<string, any>) => {
    const response = await request<{
      data: SanPham[];
      total: number;
      page: number;
      size: number;
    }>('/san-pham/page', {
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

  const handleEdit = (record: SanPham) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request(`/san-pham/${id}`, { method: 'DELETE' });
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
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
      title: 'Hình ảnh',
      dataIndex: 'urlAnhBia',
      width: 100,
      render: (url: string) => (url ? <Image width={60} src={url} /> : '-'),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'ten',
      width: 250,
    },
    {
      title: 'Giá',
      dataIndex: 'gia',
      width: 150,
      render: (gia: number, record: SanPham) => (
        <span>
          {record.giaSale ? (
            <>
              <span style={{ textDecoration: 'line-through', color: '#999' }}>
                {formatCurrency(gia)}
              </span>
              <br />
              <span style={{ color: 'red' }}>
                {formatCurrency(record.giaSale)}
              </span>
            </>
          ) : (
            formatCurrency(gia)
          )}
        </span>
      ),
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'thuongHieu',
      width: 120,
    },
    {
      title: 'Mã DM',
      dataIndex: 'maDanhMuc',
      width: 100,
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
      render: (_: any, record: SanPham) => [
        <a key="edit" onClick={() => handleEdit(record)}>
          Sửa
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: 'Xác nhận xóa',
              content: `Bạn có chắc muốn xóa sản phẩm "${record.ten}"?`,
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
      <ProTable<SanPham>
        headerTitle="Danh sách sản phẩm"
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
      <SanPhamModal
        visible={modalVisible}
        record={editingRecord}
        onClose={handleModalClose}
      />
    </PageContainer>
  );
};

export default SanPhamListPage;
