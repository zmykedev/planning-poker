import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { PlanningRoom } from './components/PlanningRoom';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Card, Space, Typography, Button, Input } from 'antd';
import { UserOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons';
import { useWebSocket } from './hooks/useWebSocket';
import type { CardDeck } from './types';
import { CARD_DECKS } from './types';

const { Title, Text } = Typography;

// Tipo para las props del WebSocket
type WebSocketProps = ReturnType<typeof useWebSocket>;

// Componente para la página de inicio
function HomePage({ room, currentUserId, currentUserName, connected, createRoom }: WebSocketProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [selectedDeck] = useState<CardDeck>(CARD_DECKS[0]);
  const navigate = useNavigate();

  const handleCreateRoom = (roomName: string, userName: string, cardDeck: CardDeck) => {
    console.log('🖱️ Creando sala:', { roomName, userName, cardDeck });
    console.log('🔌 Connected:', connected);
    createRoom(roomName, userName, cardDeck);
  };

  // Redirigir a la sala cuando se cree o se una
  useEffect(() => {
    console.log('🔍 Estado para redirección en HomePage:', {
      room: !!room,
      currentUserId,
      currentUserName,
      roomId: room?.id,
    });

    console.log('room', room);
    console.log('currentUserId', currentUserId);
    console.log('currentUserName', currentUserName);
    if (room && currentUserId && currentUserName) {
      console.log('🚀 Redirigiendo a la sala desde HomePage:', room.id);
      navigate(`/room/${room.id}`);
    }
  }, [room, currentUserId, currentUserName, navigate]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-full max-w-md p-6'>
        <Card className='shadow-lg border-0 bg-white'>
          <div className='text-center mb-6'>
            <Title level={2} className='mb-2 text-gray-800'>
              🃏 Planning Poker
            </Title>
            <div className='flex items-center justify-center mb-2'>
              <ConnectionStatus connected={connected} />
            </div>
          </div>

          <Space direction='vertical' className='w-full' size='large'>
            {/* Información del Usuario */}
            <div>
              <Text strong className='block mb-2'>
                <UserOutlined /> Ingresa tu nombre o alias
              </Text>
              <Input
                placeholder='John Doe'
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className='mb-3'
              />
            </div>

            {/* Crear Nueva Sala */}
            <div>
              <Text strong className='block mb-2'>
                <PlusOutlined /> Crear Nueva Sala
              </Text>
              <Input
                placeholder='Planning Experiencia Digital'
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className='mb-3'
              />

              <Button
                type='primary'
                size='large'
                onClick={() => handleCreateRoom(roomName, newPlayerName, selectedDeck)}
                disabled={!connected || !newPlayerName.trim() || !roomName.trim()}
                className='w-full mt-4'
              >
                Crear Sala
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
}

// Componente para la sala de votación
function RoomPage({
  room,
  currentUserId,
  currentUserName,
  connected,
  joinRoom,
  vote,
  revealVotes,
  resetVoting,
}: WebSocketProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const [newPlayerName, setNewPlayerName] = useState('');
  const navigate = useNavigate();

  // Log inicial del componente RoomPage
  console.log('🏠 RoomPage montado:', {
    roomId,
    room: !!room,
    currentUserId,
    currentUserName,
    connected,
  });

  // NO auto-unirse, el usuario debe hacer clic en el botón
  // Removido el useEffect que se ejecutaba con cada tecla

  // Si ya tenemos room y currentUserId, no necesitamos el formulario
  if (room && currentUserId) {
    console.log('✅ Mostrando sala de votación en RoomPage:', {
      roomId,
      currentUserId,
      currentUserName,
      roomName: room.name,
      usersCount: room.users.length,
    });
    return (
      <PlanningRoom
        room={room}
        currentUserId={currentUserId}
        onVote={vote}
        onReveal={revealVotes}
        onReset={resetVoting}
      />
    );
  }

  console.log('room', room);
  console.log('currentUserId', currentUserId);
  console.log('currentUserName', currentUserName);

  // Si no hay room, mostrar formulario de unirse
  if (!room || !currentUserId) {
    console.log('🔍 Mostrando formulario de unirse:', { room: !!room, currentUserId, roomId });
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='w-full max-w-md p-6'>
          <Card className='shadow-lg border-0 bg-white'>
            <div className='text-center mb-6'>
              <Title level={2} className='mb-2 text-gray-800'>
                🃏 Unirse a Sala
              </Title>
              <div className='flex items-center justify-center mb-2'>
                <ConnectionStatus connected={connected} />
              </div>
            </div>

            <Space direction='vertical' className='w-full' size='large'>
              <div>
                <Text strong className='block mb-2'>
                  <TeamOutlined /> Sala: {roomId}
                </Text>
                <Text type='secondary' className='block mb-3'>
                  Ingresa tu nombre para unirte a la sala
                </Text>
              </div>

              <div>
                <Text strong className='block mb-2'>
                  <UserOutlined /> Tu Nombre
                </Text>
                <Input
                  placeholder='John Doe'
                  value={newPlayerName}
                  onChange={(e) => {
                    console.log('⌨️ Escribiendo nombre:', e.target.value);
                    setNewPlayerName(e.target.value);
                  }}
                  onPressEnter={() => {
                    if (connected && newPlayerName.trim()) {
                      console.log('↩️ Enter presionado, uniéndose a sala...');
                      joinRoom(roomId!, newPlayerName);
                    }
                  }}
                  className='mb-3'
                />
              </div>

              <Button
                type='primary'
                size='large'
                onClick={() => {
                  console.log('🔘 Click en Unirse a la Sala:', { roomId, newPlayerName });
                  joinRoom(roomId!, newPlayerName);
                }}
                disabled={!connected || !newPlayerName.trim()}
                className='w-full'
              >
                Unirse a la Sala
              </Button>

              <Button onClick={() => navigate('/')} className='w-full'>
                Volver al Inicio
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <PlanningRoom
      room={room}
      currentUserId={currentUserId}
      onVote={vote}
      onReveal={revealVotes}
      onReset={resetVoting}
    />
  );
}

export function App() {
  // ✅ Llamar useWebSocket UNA SOLA VEZ aquí para que persista entre rutas
  const websocketState = useWebSocket();

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage {...websocketState} />} />
        <Route path='/room/:roomId' element={<RoomPage {...websocketState} />} />
      </Routes>
    </Router>
  );
}
