import React from 'react';
import { Modal, Typography, Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { Book } from '../types/book';

interface DeleteConfirmModalProps {
  visible: boolean;
  book: Book | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  book,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!book) return null;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      title={
        <div className='flex items-center gap-3'>
          <ExclamationCircleOutlined className='text-red-500 text-xl' />
          <span>Confirmar eliminación</span>
        </div>
      }
    >
      <div className='py-4'>
        <Typography.Text className='text-base'>
          ¿Estás seguro de que deseas eliminar el libro <strong>"{book.title}"</strong>?
        </Typography.Text>

        <Typography.Text type='secondary' className='block mt-2 text-sm'>
          Esta acción no se puede deshacer.
        </Typography.Text>
      </div>

      <div className='flex justify-end gap-3 mt-6'>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>

        <Button type='primary' danger onClick={onConfirm} loading={loading}>
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </div>
    </Modal>
  );
};
