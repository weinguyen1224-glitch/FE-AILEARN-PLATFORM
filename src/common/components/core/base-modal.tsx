import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ModalProps } from 'antd';
import { Button, Modal, Space, Typography } from 'antd';
import React, { type FC, type ReactNode } from 'react';

const { Text } = Typography;

export interface BaseConfirmModalProps {
  open: boolean;
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: 'warning' | 'danger' | 'info' | 'success';
}

export const BaseConfirmModal: FC<BaseConfirmModalProps> = ({
  open,
  title = 'Xác nhận',
  content = 'Bạn có chắc chắn muốn thực hiện?',
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  isConfirming = false,
  onConfirm,
  onCancel,
  icon = 'warning',
}) => {
  const icons = {
    warning: (
      <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />
    ),
    danger: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />,
    info: <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
    success: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
  };

  return (
    <Modal
      open={open}
      title={title}
      footer={null}
      onCancel={onCancel}
      closable={!isConfirming}
      maskClosable={!isConfirming}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <span style={{ marginTop: 4 }}>{icons[icon]}</span>
        <div style={{ flex: 1 }}>
          <Text>{content}</Text>
        </div>
      </div>
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel} disabled={isConfirming}>
            {cancelText}
          </Button>
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

export type BaseModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface BaseModalProps extends ModalProps {
  size?: BaseModalSize;
  header?: ReactNode;
  footer?: ReactNode | null;
  children?: ReactNode;
}

const sizeMap: Record<BaseModalSize, number | string> = {
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
  full: '90vw',
};

export interface BaseModalHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
}

export const BaseModalHeader: FC<BaseModalHeaderProps> = ({
  title,
  subtitle,
  extra,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 16,
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 16,
      }}
    >
      <div>
        {title && (
          <Text strong style={{ fontSize: 16, display: 'block' }}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            type="secondary"
            style={{ fontSize: 12, display: 'block', marginTop: 4 }}
          >
            {subtitle}
          </Text>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
};

export interface BaseModalFooterProps {
  children?: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const BaseModalFooter: FC<BaseModalFooterProps> = ({
  children,
  align = 'right',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: align,
        gap: 8,
        paddingTop: 16,
        borderTop: '1px solid #f0f0f0',
        marginTop: 16,
      }}
    >
      {children}
    </div>
  );
};

export interface BaseModalBodyProps {
  children?: ReactNode;
}

export const BaseModalBody: FC<BaseModalBodyProps> = ({ children }) => {
  return <div>{children}</div>;
};

export interface BaseFormModalProps {
  open: boolean;
  title?: string;
  size?: BaseModalSize;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  onSubmit: () => void;
  onCancel: () => void;
  children?: ReactNode;
  footer?: null | ReactNode;
}

export const BaseFormModal: FC<BaseFormModalProps> = ({
  open,
  title,
  size = 'md',
  loading = false,
  submitText = 'Lưu',
  cancelText = 'Hủy',
  onSubmit,
  onCancel,
  children,
  footer,
}) => {
  return (
    <BaseModal
      open={open}
      title={title}
      size={size}
      footer={
        footer !== null ? (
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} disabled={loading}>
              {cancelText}
            </Button>
            <Button type="primary" loading={loading} onClick={onSubmit}>
              {submitText}
            </Button>
          </Space>
        ) : null
      }
      onCancel={onCancel}
    >
      {children}
    </BaseModal>
  );
};

const BaseModal: FC<BaseModalProps> = ({
  size = 'md',
  header,
  footer,
  children,
  width,
  ...modalProps
}) => {
  return (
    <Modal width={width || sizeMap[size]} footer={footer} {...modalProps}>
      {header && <div style={{ marginBottom: 16 }}>{header}</div>}
      {children}
    </Modal>
  );
};

type BaseModalCompound = FC<BaseModalProps> & {
  Confirm: typeof BaseConfirmModal;
  Header: typeof BaseModalHeader;
  Footer: typeof BaseModalFooter;
  Body: typeof BaseModalBody;
  Form: typeof BaseFormModal;
  sizes: typeof sizeMap;
};

(BaseModal as BaseModalCompound).Confirm = BaseConfirmModal;
(BaseModal as BaseModalCompound).Header = BaseModalHeader;
(BaseModal as BaseModalCompound).Footer = BaseModalFooter;
(BaseModal as BaseModalCompound).Body = BaseModalBody;
(BaseModal as BaseModalCompound).Form = BaseFormModal;
(BaseModal as BaseModalCompound).sizes = sizeMap;

export default BaseModal as BaseModalCompound;
