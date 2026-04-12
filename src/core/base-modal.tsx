import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, type ModalProps, Space } from 'antd';
import React from 'react';

export interface BaseConfirmModalProps {
  open: boolean;
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: 'warning' | 'danger' | 'info';
}

export const BaseConfirmModal: React.FC<BaseConfirmModalProps> = ({
  open,
  title = 'Confirm',
  content = 'Are you sure?',
  okText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
  onConfirm,
  onCancel,
  icon = 'warning',
}) => {
  const icons = {
    warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    danger: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
    info: <ExclamationCircleOutlined style={{ color: '#1890ff' }} />,
  };

  return (
    <Modal open={open} title={title} footer={null} onCancel={onCancel}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <span style={{ fontSize: 24 }}>{icons[icon]}</span>
        <div>{content}</div>
      </div>
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>{cancelText}</Button>
          <Button
            type="primary"
            danger={icon === 'danger'}
            loading={isConfirming}
            onClick={onConfirm}
          >
            {okText}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export type BaseModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface BaseModalProps extends ModalProps {
  size?: BaseModalSize;
  footer?: null | React.ReactNode;
}

const sizeMap: Record<BaseModalSize, number> = {
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
};

const BaseModal: React.FC<BaseModalProps> = ({
  size = 'md',
  width,
  footer,
  children,
  ...modalProps
}) => {
  return (
    <Modal width={width || sizeMap[size]} footer={footer} {...modalProps}>
      {children}
    </Modal>
  );
};

export default BaseModal;
