import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useWebSocketStore } from '../store/websocketStore';
import { CardDeckSelector } from '../components/CardDeckSelector';
import type { User, CardDeck } from '@/types/session';
import { Card, Tabs, Input, Button, Radio, Space, Typography, Alert } from 'antd';
import { UserOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DEFAULT_DECK: CardDeck = {
  id: 'fibonacci',
  name: 'Fibonacci',
  values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'],
};

export const Register = () => {
  const { connect, createRoom, joinRoom, setCurrentUser, connected } = useWebSocketStore();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [role, setRole] = useState<User['role']>('voter');
  const [selectedDeck, setSelectedDeck] = useState<CardDeck>(DEFAULT_DECK);
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Conectar al WebSocket cuando el componente se monta
  useEffect(() => {
    connect();
  }, [connect]);

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
    createRoom(room, name, selectedDeck);
    navigate('/main');
  };

  const handleJoinRoom = () => {
    const name = newPlayerName.trim();
    const room = roomId.trim();
    
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
    navigate('/main');
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Determine which action to take based on current tab
      const activeTab = document.querySelector('.ant-tabs-tab-active')?.textContent;
      if (activeTab?.includes('Crear')) {
        handleCreateRoom();
      } else {
        handleJoinRoom();
      }
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <Title level={1} className='text-indigo-900'>
            🃏 Planning Poker
          </Title>
          <Text type='secondary' className='text-lg'>
            Estimación colaborativa de historias de usuario
          </Text>
        </div>

        {!connected && (
          <Alert
            message="Conectando al servidor..."
            description="Estableciendo conexión WebSocket"
            type="info"
            showIcon
            className="mb-6"
          />
        )}

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={() => setError('')}
          />
        )}

        <Card className='max-w-2xl mx-auto'>
          <Tabs
            defaultActiveKey="create"
            items={[
              {
                key: 'create',
                label: (
                  <span>
                    <PlusOutlined />
                    Crear Sala
                  </span>
                ),
                children: (
                  <div className='space-y-6'>
                    <div>
                      <label className='block mb-2'>
                        <Text strong>Nombre del jugador</Text>
                      </label>
                      <Input
                        size='large'
                        placeholder='Tu nombre'
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyDown={onEnter}
                        prefix={<UserOutlined />}
                      />
                    </div>

                    <div>
                      <label className='block mb-2'>
                        <Text strong>Nombre de la sala</Text>
                      </label>
                      <Input
                        size='large'
                        placeholder='Nombre de la sala'
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        onKeyDown={onEnter}
                        prefix={<TeamOutlined />}
                      />
                    </div>

                    <div>
                      <Text strong className='block mb-3'>Rol</Text>
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

                    <CardDeckSelector
                      selectedDeck={selectedDeck}
                      onDeckChange={setSelectedDeck}
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
                ),
              },
              {
                key: 'join',
                label: (
                  <span>
                    <TeamOutlined />
                    Unirse a Sala
                  </span>
                ),
                children: (
                  <div className='space-y-6'>
                    <div>
                      <label className='block mb-2'>
                        <Text strong>Nombre del jugador</Text>
                      </label>
                      <Input
                        size='large'
                        placeholder='Tu nombre'
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyDown={onEnter}
                        prefix={<UserOutlined />}
                      />
                    </div>

                    <div>
                      <label className='block mb-2'>
                        <Text strong>ID de la sala</Text>
                      </label>
                      <Input
                        size='large'
                        placeholder='ID de la sala (ej: ABC123)'
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        onKeyDown={onEnter}
                        prefix={<TeamOutlined />}
                      />
                    </div>

                    <div>
                      <Text strong className='block mb-3'>Rol</Text>
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

                    <Button
                      type='primary'
                      size='large'
                      onClick={handleJoinRoom}
                      disabled={!connected}
                      className='w-full'
                    >
                      Unirse a la Sala
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};
