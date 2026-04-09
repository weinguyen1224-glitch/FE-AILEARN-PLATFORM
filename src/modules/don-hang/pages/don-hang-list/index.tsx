import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { request } from '@umijs/max';
import { Tag } from 'antd';
import type { FC } from 'react';
import React, { useRef } from 'react';
import type {
  DonHang,
  TrangThaiDonHang,
  TrangThaiThanhToan,
} from '../../types/don-hang.types';

const trangThaiLabels: Record<
  TrangThaiDonHang,
  { text: string; color: string }
> = {
  DANG_XU_LY: { text: 'Đang xử lý', color: 'processing' },
  DANG_GIAO: { text: 'Đang giao', color: 'warning' },
  HOAN_THANH: { text: 'Hoàn thành', color: 'success' },
  HUY: { text: 'Hủy', color: 'error' },
};

const trangThaiThanhToanLabels: Record<
  TrangThaiThanhToan,
  { text: string; color: string }
> = {
  DANG_XU_LY: { text: 'Đang xử lý', color: 'processing' },
  CHUA_THANH_TOAN: { text: 'Chưa thanh toán', color: 'default' },
  DA_THANH_TOAN: { text: 'Đã thanh toán', color: 'success' },
};

const DonHangListPage: FC = () => {
  const actionRef = useRef<ActionType>();

  const fetchData = async (params: Record<string, any>) => {
    const response = await request<{
      data: DonHang[];
      total: number;
      page: number;
      size: number;
    }>('/don-hang/page', {
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
      title: 'Mã đơn',
      dataIndex: 'ma',
      width: 120,
      copyable: true,
    },
    {
      title: 'Người nhận',
      dataIndex: 'tenNguoiNhan',
      width: 180,
    },
    {
      title: 'SĐT',
      dataIndex: 'soDienThoai',
      width: 130,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'diaChi',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'tongTien',
      width: 150,
      render: (tongTien: number) => (
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          {formatCurrency(tongTien)}
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 130,
      render: (trangThai: TrangThaiDonHang) => {
        const label = trangThaiLabels[trangThai] || {
          text: trangThai,
          color: 'default',
        };
        return <Tag color={label.color}>{label.text}</Tag>;
      },
    },
    {
      title: 'Thanh toán',
      dataIndex: 'trangThaiThanhToan',
      width: 150,
      render: (trangThai: TrangThaiThanhToan) => {
        const label = trangThaiThanhToanLabels[trangThai] || {
          text: trangThai,
          color: 'default',
        };
        return <Tag color={label.color}>{label.text}</Tag>;
      },
    },
    {
      title: 'Hình thức',
      dataIndex: 'hinhThucThanhToan',
      width: 100,
      render: (hinhThuc: string) => <Tag>{hinhThuc}</Tag>,
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
      width: 100,
      render: (_: any, record: DonHang) => [
        <a key="view" onClick={() => {}}>
          Xem
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<DonHang>
        headerTitle="Danh sách đơn hàng"
        actionRef={actionRef}
        rowKey="id"
        request={fetchData}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
    </PageContainer>
  );
};

export default DonHangListPage;
