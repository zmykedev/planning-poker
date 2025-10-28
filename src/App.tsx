import { useState, useEffect } from 'react';
import { useWebSocket } from './contexts/WebSocketContext';
import { VotingResults } from './components/VotingResults';
import { ConnectionStatus } from './components/ConnectionStatus';
import { Card, Space, Typography, Alert, Button, message, Input } from 'antd';
import {
  LinkOutlined,
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { CardDeck } from './types';
import { CARD_DECKS } from './types';

const { Title, Text } = Typography;

export function App() {
  const {
    room,
    currentUserId,
    error,
    connected,
    createRoom,
    joinRoom,
    vote,
    revealVotes,
    resetVoting,
  } = useWebSocket();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<number | string | null>(null);

  // Estados para el formulario de registro
  const [newPlayerName, setNewPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [selectedDeck] = useState<CardDeck>(CARD_DECKS[0]);

  // Detectar si hay sala en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomFromUrl = urlParams.get('room');
  const hasRoomInUrl = !!roomFromUrl;

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }, [error]);

  // Sincronizar selectedCard con currentUser.vote
  useEffect(() => {
    const currentUser = room?.users.find((u) => u.id === currentUserId);
    if (currentUser?.vote !== undefined) {
      console.log('🔄 Sincronizando voto:', {
        currentUserId,
        vote: currentUser.vote,
        selectedCard,
      });
      setSelectedCard(currentUser.vote);
    } else if (currentUser && currentUser.vote === null) {
      // Si el usuario no ha votado, resetear selectedCard
      console.log('🔄 Reseteando voto local');
      setSelectedCard(null);
    }
  }, [room?.users, currentUserId, selectedCard]);

  const handleCreateRoom = (roomName: string, userName: string, cardDeck: CardDeck) => {
    createRoom(roomName, userName, cardDeck);
  };

  const handleJoinRoom = (roomId: string, userName: string) => {
    joinRoom(roomId, userName);
  };

  const handleVote = (value: number | string) => {
    console.log('🗳️ Enviando voto:', value);
    vote(value);
    // No actualizar selectedCard localmente, esperar confirmación del servidor
  };

  const handleReveal = () => {
    revealVotes();
  };

  const handleReset = () => {
    console.log('🔄 Reiniciando votación');
    resetVoting();
    // No resetear selectedCard localmente, esperar confirmación del servidor
  };

  const handleCopyRoomLink = () => {
    if (!room?.id) {
      message.error('No hay sala activa');
      return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const roomLink = `${baseUrl}?room=${room.id}`;

    navigator.clipboard
      .writeText(roomLink)
      .then(() => {
        message.success('Link copiado al portapapeles');
      })
      .catch(() => {
        message.error('Error al copiar el link');
      });
  };

  const allVoted = room?.users.every((p) => p.vote !== null) || false;

  // Obtener usuario actual y calcular si es moderador
  const currentUser = room?.users.find((u) => u.id === currentUserId);
  const isModerator = currentUser?.id === room?.ownerId;

  // Usar mazo por defecto si el servidor no envía cardDeck
  const cardDeck = room?.cardDeck || CARD_DECKS[0];

  // Si no hay room o currentUserId, mostrar formulario de registro
  console.log('🔍 Estado para redirección:', {
    hasRoom: !!room,
    currentUserId,
    connected,
    roomFromUrl,
  });
  if (!room || !currentUserId) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='w-full max-w-md p-6'>
          <Card className='shadow-lg'>
            <div className='text-center mb-6'>
              <Title level={2} className='mb-2'>
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

              {/* Sala Compartida */}
              {hasRoomInUrl && (
                <div>
                  <Text strong className='block mb-2'>
                    <TeamOutlined /> Sala Compartida
                  </Text>
                  <Text type='secondary' className='block mb-3'>
                    Te han invitado a la sala: <Text code>{roomFromUrl}</Text>
                  </Text>
                  <Button
                    type='primary'
                    size='large'
                    onClick={() => {
                      console.log('🖱️ Botón Unirse clickeado');
                      console.log('🔌 Connected:', connected);
                      console.log('👤 newPlayerName:', newPlayerName);
                      console.log('🏠 roomFromUrl:', roomFromUrl);
                      handleJoinRoom(roomFromUrl, newPlayerName);
                    }}
                    disabled={!connected || !newPlayerName.trim()}
                    className='w-full'
                  >
                    Unirse a Sala Compartida
                  </Button>
                </div>
              )}

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
                  onClick={() => {
                    console.log('🖱️ Botón Crear Sala clickeado');
                    console.log('🔌 Connected:', connected);
                    console.log('👤 newPlayerName:', newPlayerName);
                    console.log('🏠 roomName:', roomName);
                    handleCreateRoom(roomName, newPlayerName, selectedDeck);
                  }}
                  disabled={!connected || !newPlayerName.trim() || !roomName.trim()}
                  className='w-full mt-4'
                >
                  Crear Sala
                </Button>
              </div>

              {/* Unirse a Sala
              <div>
                <Text strong className='block mb-2'>
                  <TeamOutlined /> Unirse a Sala Existente
                </Text>
                <Input
                  placeholder='ID de la sala'
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  className='mb-3'
                />
                <Button
                  type='default'
                  size='large'
                  onClick={() => handleJoinRoom(roomIdInput, newPlayerName)}
                  disabled={!connected || !newPlayerName.trim() || !roomIdInput.trim()}
                  className='w-full'
                >
                  Unirse a Sala
                </Button>
              </div> */}
            </Space>
          </Card>
        </div>
      </div>
    );
  }

  // Si hay room y currentUserId, mostrar la sala de planning poker
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3'>
      <div className='max-w-6xl mx-auto'>
        {/* Error notification */}
        {errorMessage && (
          <div className='fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-slide-in'>
            <div className='flex items-center space-x-2'>
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Connection status indicator */}
        {!connected && (
          <div className='fixed top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            <span className='text-sm'>Conectando al servidor...</span>
          </div>
        )}

        {/* Header */}
        <Card className='mb-4'>
          <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3'>
            <div>
              <Title level={3} className='mb-1'>
                🃏 Planning Poker
              </Title>

              {/* Status Bar */}
              <div className='mt-2 flex items-center space-x-3 text-xs'>
                <div className='flex items-center space-x-1'>
                  <span
                    className={`w-2 h-2 rounded-full ${allVoted ? 'bg-green-500' : 'bg-yellow-500'}`}
                  ></span>
                  <Text type='secondary' className='text-xs'>
                    {room.users.filter((p) => p.vote !== null).length} / {room.users.length} votos
                  </Text>
                </div>
                <Text type='secondary'>|</Text>
                <Text type='secondary' className='text-xs'>
                  Mazo: <Text strong>{cardDeck.name}</Text>
                </Text>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              {isModerator && (
                <>
                  {!room.revealed && allVoted && (
                    <Button
                      type='primary'
                      icon={<EyeOutlined />}
                      onClick={handleReveal}
                      size='small'
                      className='bg-green-600 hover:bg-green-700 border-green-600'
                    >
                      Revelar
                    </Button>
                  )}

                  {room.revealed && (
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleReset}
                      size='small'
                      className='bg-amber-600 hover:bg-amber-700 border-amber-600 text-white'
                    >
                      Nueva Ronda
                    </Button>
                  )}
                </>
              )}

              <Button
                icon={<LinkOutlined />}
                onClick={handleCopyRoomLink}
                type='default'
                size='small'
              >
                Copiar
              </Button>
            </div>
          </div>
        </Card>

        {/* Connection Status */}
        {!connected && (
          <Alert
            message='Desconectado del servidor'
            description='Intentando reconectar...'
            type='warning'
            showIcon
            className='mb-6'
          />
        )}

        {/* Mesa Redonda */}
        <div className='mb-4'>
          <div className='text-center mb-3'></div>

          <div className='relative w-full max-w-2xl mx-auto'>
            {/* Partículas flotantes alrededor de la mesa */}
            <div className='absolute inset-0 pointer-events-none'>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className='floating-particle'
                  style={{
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Mesa circular */}
            <div className='relative w-64 h-64 mx-auto mb-4'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-2xl border-4 border-amber-400'></div>
              <div className='absolute inset-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full shadow-inner'></div>

              {/* Centro de la mesa */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-3xl mb-1'>🃏</div>
                  <Text className='text-white font-bold text-sm'>Planning Poker</Text>
                  <Text className='text-white/80 text-xs'>{cardDeck.name}</Text>
                </div>
              </div>
            </div>

            {/* Participantes alrededor de la mesa */}
            <div className='absolute inset-0 w-64 h-64 mx-auto'>
              {room.users.map((user, index) => {
                const angle = (index * 360) / room.users.length;
                const radius = 120; // Radio desde el centro (reducido)
                const x = Math.cos(((angle - 90) * Math.PI) / 180) * radius;
                const y = Math.sin(((angle - 90) * Math.PI) / 180) * radius;

                return (
                  <div
                    key={user.id}
                    className='absolute transform -translate-x-1/2 -translate-y-1/2'
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                  >
                    {/* Carta del participante */}
                    <div className='relative'>
                      <div
                        className={`
                          w-12 h-16 rounded-md border-2 transition-all duration-700 transform card-hover
                          ${
                            user.id === currentUserId
                              ? 'border-blue-400 shadow-lg shadow-blue-500/50'
                              : 'border-white/30'
                          }
                          ${
                            user.vote !== null
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                              : 'bg-gradient-to-br from-gray-400 to-gray-600'
                          }
                          ${room.revealed ? 'animate-card-flip' : ''}
                        `}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: room.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Frente de la carta */}
                        <div
                          className={`
                          absolute inset-0 flex items-center justify-center text-white font-bold text-sm transition-opacity duration-300
                          ${room.revealed ? 'opacity-0' : 'opacity-100'}
                        `}
                        >
                          {user.vote !== null ? (
                            <div className='flex flex-col items-center'>
                              <div className='text-green-300 animate-pulse-slow text-sm'>✓</div>
                              <div className='text-xs mt-0.5'>Votado</div>
                            </div>
                          ) : (
                            <div className='flex flex-col items-center'>
                              <div className='text-white/60 text-sm'>?</div>
                              <div className='text-xs mt-0.5'>Esperando</div>
                            </div>
                          )}
                        </div>

                        {/* Reverso de la carta (cuando se revela) */}
                        <div
                          className={`
                          absolute inset-0 flex items-center justify-center text-white font-bold text-lg transition-opacity duration-300
                          ${room.revealed ? 'opacity-100' : 'opacity-0'}
                        `}
                          style={{
                            transform: room.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          }}
                        >
                          <div className='text-center'>
                            <div className='text-lg font-black'>{user.vote ?? '?'}</div>
                            <div className='text-xs mt-0.5 opacity-80'>Voto</div>
                          </div>
                        </div>
                      </div>

                      {/* Nombre del participante */}
                      <div className='mt-1 text-center'>
                        <div
                          className={`
                          px-1.5 py-0.5 rounded text-xs font-semibold
                          ${
                            user.id === currentUserId
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/20 text-white'
                          }
                        `}
                        >
                          {user.name || `Usuario ${user.id.slice(0, 8)}`}
                        </div>
                        {user.id === room.ownerId && (
                          <div className='text-yellow-400 text-xs mt-0.5'>👑</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Voting Cards */}
        {currentUser && cardDeck && (
          <Card title='🃏 Selecciona tu voto' className='mb-4'>
            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2'>
              {cardDeck.values.map((value, index) => (
                <div key={index} className='relative'>
                  <div
                    className={`
                      w-full aspect-[2/3] rounded-lg border-2 cursor-pointer transition-all duration-300 transform hover:scale-105
                      ${
                        selectedCard === value
                          ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                          : 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 hover:border-blue-400'
                      }
                      ${room.revealed ? 'pointer-events-none' : ''}
                    `}
                    onClick={() => !room.revealed && handleVote(value)}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: selectedCard === value ? 'rotateY(10deg)' : 'rotateY(0deg)',
                    }}
                  >
                    <div className='flex items-center justify-center h-full'>
                      <span className='text-lg font-bold'>{value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedCard !== null && !room.revealed && (
              <div
                className='mt-3 p-3 rounded-lg'
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-green-20) 0%, var(--color-yellow-20) 100%)',
                  border: '1px solid var(--color-green-50)',
                }}
              >
                <div className='flex items-center justify-center space-x-2'>
                  <span className='text-lg'>✅</span>
                  <p className='text-center text-sm' style={{ color: 'var(--color-yellow)' }}>
                    Has votado:{' '}
                    <strong className='text-lg' style={{ color: 'var(--color-green)' }}>
                      {selectedCard}
                    </strong>
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Show message if cards are not available */}
        {currentUser && !cardDeck && (
          <Card title='🃏 Cartas no disponibles' className='mb-6'>
            <Alert
              message='Las cartas no están disponibles'
              description='Esperando información de la sala...'
              type='info'
              showIcon
            />
          </Card>
        )}

        {/* Voting Results - Show when revealed */}
        {room.revealed && (
          <VotingResults players={room.users} revealed={room.revealed} cardDeck={cardDeck} />
        )}

        {/* Notifications */}
        {!room.revealed && allVoted && isModerator && (
          <div
            className='fixed bottom-8 right-8 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce z-50'
            style={{ backgroundColor: 'var(--color-green)' }}
          >
            <p className='font-semibold'>✓ ¡Todos han votado!</p>
            <p className='text-sm'>Puedes revelar los resultados</p>
          </div>
        )}

        {!room.revealed && allVoted && !isModerator && (
          <div
            className='fixed bottom-8 right-8 text-white px-6 py-4 rounded-lg shadow-2xl z-50'
            style={{ backgroundColor: 'var(--color-blue)' }}
          >
            <p className='font-semibold'>⏳ Esperando al moderador</p>
            <p className='text-sm'>Todos han votado</p>
          </div>
        )}
      </div>
    </div>
  );
}
