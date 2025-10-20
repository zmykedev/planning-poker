import React from 'react';
import useStore from '../store';
import { useNavigate } from 'react-router';
import { Card, Typography, Button, Space, Alert } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const UserProfile: React.FC = () => {
  const { getUser, isLoggedIn, logout } = useStore();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout(); // Use the logout action from the store
    navigate('/login');
  };

  if (!isLoggedIn || !user) {
    return (
      <Alert
        message='No hay sesión activa'
        description='Por favor, inicia sesión para ver tu perfil.'
        type='warning'
        showIcon
        className='m-4'
      />
    );
  }

  return (
    <Card
      title={
        <div className='flex justify-between w-full items-center'>
          <Title level={4} className='mb-0 text-fountain-blue-900 dark:text-fountain-blue-100'>
            Perfil de Usuario
          </Title>
          <Button type='primary' danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      }
      className='p-6 max-w-2xl mx-auto my-8 shadow-lg border border-fountain-blue-200 dark:border-fountain-blue-600'
    >
      <Space direction='vertical' size='middle' className='w-full'>
        <div className='flex justify-between w-full'>
          <Text strong>ID:</Text>
          <Text copyable>{user.id}</Text>
        </div>

        <div className='flex justify-between w-full'>
          <Text strong>Email:</Text>
          <Text copyable>{user.email}</Text>
        </div>

        <div className='flex justify-between w-full'>
          <Text strong>Nombre:</Text>
          <Text>
            {user.firstName} {user.lastName}
          </Text>
        </div>

        <div className='flex justify-between w-full'>
          <Text strong>Creado:</Text>
          <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
        </div>

        <div className='flex justify-between w-full'>
          <Text strong>Último login:</Text>
          <Text>{new Date(user.lastLoginAt).toLocaleString()}</Text>
        </div>
      </Space>
    </Card>
  );
};
