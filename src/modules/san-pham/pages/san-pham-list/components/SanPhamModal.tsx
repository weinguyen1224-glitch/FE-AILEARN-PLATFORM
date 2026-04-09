import {
  ModalForm,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import type { FC } from 'react';
import React from 'react';
import { sanPhamService } from '../../../service/san-pham.service';
import type { CreateSanPhamDto, SanPham } from '../../../types/san-pham.types';

interface SanPhamModalProps {
  visible: boolean;
  record?: SanPham;
  onClose: () => void;
}

const SanPhamModal: FC<SanPhamModalProps> = ({ visible, record, onClose }) => {
  return (
    <ModalForm<SanPham>
      title={record ? 'Sửa sản phẩm' : 'Thêm mới sản phẩm'}
      open={visible}
      onFinish={async (values) => {
        const data: CreateSanPhamDto = {
          ten: values.ten || '',
          gia: values.gia || 0,
          giaSale: values.giaSale,
          moTa: values.moTa,
          urlAnhBia: values.urlAnhBia,
          thuongHieu: values.thuongHieu,
          maDanhMuc: values.maDanhMuc,
        };

        if (record?.id) {
          await sanPhamService.update(record.id, data);
        } else {
          await sanPhamService.create(data);
        }
        onClose();
        return true;
      }}
      onOpenChange={onClose}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      submitter={{
        resetButtonProps: {
          children: 'Hủy',
        },
        submitButtonProps: {
          children: record ? 'Cập nhật' : 'Thêm mới',
        },
      }}
    >
      <ProFormText
        name="ten"
        label="Tên sản phẩm"
        placeholder="Nhập tên sản phẩm"
        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
        initialValue={record?.ten}
      />
      <ProFormDigit
        name="gia"
        label="Giá"
        placeholder="Nhập giá"
        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
        initialValue={record?.gia}
        fieldProps={{
          min: 0,
          precision: 0,
        }}
      />
      <ProFormDigit
        name="giaSale"
        label="Giá sale"
        placeholder="Nhập giá sale (nếu có)"
        initialValue={record?.giaSale}
        fieldProps={{
          min: 0,
          precision: 0,
        }}
      />
      <ProFormText
        name="thuongHieu"
        label="Thương hiệu"
        placeholder="Nhập thương hiệu"
        initialValue={record?.thuongHieu}
      />
      <ProFormText
        name="maDanhMuc"
        label="Mã danh mục"
        placeholder="Nhập mã danh mục"
        initialValue={record?.maDanhMuc}
      />
      <ProFormText
        name="urlAnhBia"
        label="URL hình ảnh"
        placeholder="Nhập URL hình ảnh"
        initialValue={record?.urlAnhBia}
      />
      <ProFormTextArea
        name="moTa"
        label="Mô tả"
        placeholder="Nhập mô tả"
        initialValue={record?.moTa}
      />
    </ModalForm>
  );
};

export default SanPhamModal;
