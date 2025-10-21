import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useWebSocketStore, setNavigateFunction } from '../store/websocketStore';
import type { User, CardDeck } from '@/types/session';
import { Card, Input, Button, Radio, Space, Typography, Alert } from 'antd';
import { UserOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DEFAULT_DECK: CardDeck = {
  id: 'fibonacci',
  name: 'Fibonacci',
  values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'],
};

export const Register = () => {
  const navigate = useNavigate();
  const { connect, createRoom, joinRoom, setCurrentUser, connected } = useWebSocketStore();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [role, setRole] = useState<User['role']>('voter');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    connect();
    setNavigateFunction(navigate);
  }, [connect, navigate]);

  // Detectar si hay sala en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get('room');
  const hasRoomInUrl = !!roomFromUrl;

  const handleCreateRoom = () => {
    const name = newPlayerName.trim();
    const room = roomName.trim();

    if (!name) {
      setError('El nombre es requerido');
      return;
    }

    if (!room) {
      setError('El nombre de la sala es requerido');
      return;
    }

    setError('');
    setCurrentUser(name, role);
    createRoom(room, name, DEFAULT_DECK);
    // La redirección se manejará cuando llegue la respuesta del backend
  };

  const handleJoinRoom = () => {
    const name = newPlayerName.trim();
    const room = roomIdInput.trim();

    if (!name) {
      setError('El nombre es requerido');
      return;
    }

    if (!room) {
      setError('El ID de la sala es requerido');
      return;
    }

    setError('');
    setCurrentUser(name, role);
    joinRoom(room, name);
    // La redirección se manejará cuando llegue la respuesta del backend
  };

  const handleJoinFromUrl = () => {
    const name = newPlayerName.trim();

    if (!name) {
      setError('El nombre es requerido');
      return;
    }

    if (!roomFromUrl) {
      setError('No hay sala en la URL');
      return;
    }

    setError('');
    setCurrentUser(name, role);
    joinRoom(roomFromUrl, name);
    // La redirección se manejará cuando llegue la respuesta del backend
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-md p-6'>
        <div className='text-center mb-8'>
          <Title level={1} className='mb-2'>
            🃏 Planning Poker
          </Title>
          <Text type='secondary'>Únete a una sesión de estimación</Text>
        </div>

        {!connected && (
          <Alert
            message='Conectando al servidor...'
            description='Estableciendo conexión WebSocket'
            type='info'
            showIcon
            className='mb-6'
          />
        )}

        {error && (
          <Alert
            message={error}
            type='error'
            showIcon
            className='mb-6'
            closable
            onClose={() => setError('')}
          />
        )}

        <Card className='mb-6'>
          <div className='space-y-6'>
            {/* Nombre del jugador */}
            <div>
              <label className='block mb-2'>
                <Text strong>Nombre del jugador</Text>
              </label>
              <Input
                size='large'
                placeholder='Tu nombre'
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                prefix={<UserOutlined />}
              />
            </div>

            {/* Rol */}
            <div>
              <Text strong className='block mb-3'>
                Rol
              </Text>
              <Radio.Group
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className='w-full'
              >
                <Space direction='vertical' className='w-full'>
                  <Radio value='voter' className='w-full'>
                    <div>
                      <Text strong>Votante</Text>
                      <br />
                      <Text type='secondary'>Puede votar y participar en la estimación</Text>
                    </div>
                  </Radio>
                  <Radio value='spectator' className='w-full'>
                    <div>
                      <Text strong>Espectador</Text>
                      <br />
                      <Text type='secondary'>Solo puede observar, no puede votar</Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>

            {/* Crear Sala */}
            <div className='border-t pt-6'>
              <div className='flex items-center mb-4'>
                <PlusOutlined className='mr-2' />
                <Text strong>Crear Nueva Sala</Text>
              </div>

              <div className='space-y-4'>
                <Input
                  placeholder='Nombre de la sala'
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  prefix={<TeamOutlined />}
                />

                <Button
                  type='primary'
                  size='large'
                  onClick={handleCreateRoom}
                  disabled={!connected}
                  className='w-full'
                >
                  Crear Sala
                </Button>
              </div>
            </div>

            {/* Unirse a Sala */}
            <div className='border-t pt-6'>
              <div className='flex items-center mb-4'>
                <TeamOutlined className='mr-2' />
                <Text strong>Unirse a Sala</Text>
              </div>

              <div className='space-y-4'>
                <Input
                  placeholder='ID de la sala'
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                  prefix={<TeamOutlined />}
                />

                <Button
                  type='default'
                  size='large'
                  onClick={handleJoinRoom}
                  disabled={!connected}
                  className='w-full'
                >
                  Unirse a Sala
                </Button>
              </div>
            </div>

            {/* Unirse desde URL */}
            {hasRoomInUrl && (
              <div className='border-t pt-6'>
                <div className='flex items-center mb-4'>
                  <TeamOutlined className='mr-2' />
                  <Text strong>Sala Compartida</Text>
                </div>

                <div className='space-y-4'>
                  <Alert
                    message={`Sala: ${roomFromUrl}`}
                    description='Te unirás automáticamente a la sala compartida'
                    type='info'
                    showIcon
                  />

                  <Button
                    type='primary'
                    size='large'
                    onClick={handleJoinFromUrl}
                    disabled={!connected}
                    className='w-full'
                  >
                    Unirse a Sala Compartida
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
