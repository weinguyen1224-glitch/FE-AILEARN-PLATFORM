import {
  ModalForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import type { FC } from 'react';
import React from 'react';
import { danhMucService } from '../../../service/danh-muc.service';
import type { CreateDanhMucDto, DanhMuc } from '../../../types/danh-muc.types';

interface DanhMucModalProps {
  visible: boolean;
  record?: DanhMuc;
  onClose: () => void;
}

const DanhMucModal: FC<DanhMucModalProps> = ({ visible, record, onClose }) => {
  return (
    <ModalForm<DanhMuc>
      title={record ? 'Sửa danh mục' : 'Thêm mới danh mục'}
      open={visible}
      onFinish={async (values) => {
        const data: CreateDanhMucDto = {
          ten: values.ten || '',
          moTa: values.moTa,
          active: values.active ?? true,
          maDanhMucCha: values.maDanhMucCha,
        };

        if (record?.id) {
          await danhMucService.update(record.id, data);
        } else {
          await danhMucService.create(data);
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
        label="Tên danh mục"
        placeholder="Nhập tên danh mục"
        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        initialValue={record?.ten}
      />
      <ProFormTextArea
        name="moTa"
        label="Mô tả"
        placeholder="Nhập mô tả"
        initialValue={record?.moTa}
      />
      <ProFormText
        name="maDanhMucCha"
        label="Mã danh mục cha"
        placeholder="Nhập mã danh mục cha (nếu có)"
        initialValue={record?.maDanhMucCha}
      />
      <ProFormSwitch
        name="active"
        label="Hoạt động"
        initialValue={record?.active ?? true}
      />
    </ModalForm>
  );
};

export default DanhMucModal;
