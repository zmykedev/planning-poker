import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useWebSocketStore } from '../store/websocketStore';
import { ParticipantsTable } from '../components/ParticipantsTable';
import { PokerCard } from '../components/PokerCard';
import { Card, Space, Typography, Alert, Spin, Button, message } from 'antd';
import { UserOutlined, DisconnectOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Main() {
  const {
    connected,
    currentUser,
    players,
    roomId,
    revealed,
    cardDeck,
    vote,
    reveal,
    reset,
    disconnect,
    getRoomLink,
  } = useWebSocketStore();

  const [selectedCard, setSelectedCard] = useState<number | string | null>(null);
  const navigate = useNavigate();

  // Redirect to register if no current user
  useEffect(() => {
    if (!currentUser) {
      navigate('/register');
    }
  }, [currentUser, navigate]);

  // Sincronizar selectedCard con el voto del usuario actual
  useEffect(() => {
    if (currentUser?.vote !== undefined) {
      setSelectedCard(currentUser.vote);
    }
  }, [currentUser?.vote]);

  // Debug: Log del estado actual
  useEffect(() => {
    console.log('Main page state:', {
      connected,
      currentUser,
      players: players.length,
      roomId,
      revealed,
      cardDeck: cardDeck ? cardDeck.name : 'null',
      cardDeckValues: cardDeck?.values || 'null',
    });
  }, [connected, currentUser, players, roomId, revealed, cardDeck]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const handleCardClick = (value: number | string) => {
    if (revealed || currentUser?.role !== 'voter') {
      return;
    }

    setSelectedCard(value);
    vote(value);
  };

  const handleReveal = () => {
    reveal();
  };

  const handleReset = () => {
    reset();
    setSelectedCard(null);
  };

  const handleDisconnect = () => {
    disconnect();
    navigate('/register');
  };

  const handleCopyRoomLink = async () => {
    const roomLink = getRoomLink();
    if (roomLink) {
      try {
        await navigator.clipboard.writeText(roomLink);
        message.success('Link de la sala copiado al portapapeles');
        console.log('Link copiado al portapapeles:', roomLink);
      } catch (err) {
        message.error('Error al copiar el link');
        console.error('Error al copiar:', err);
      }
    } else {
      message.warning('No hay sala activa para compartir');
    }
  };

  if (!connected) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <Card className='text-center p-8'>
          <Spin size='large' />
          <Title level={4} className='mt-4'>
            Conectando al servidor...
          </Title>
          <Text type='secondary'>Estableciendo conexión WebSocket</Text>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
        <Card className='text-center p-8'>
          <Title level={4}>No hay usuario activo</Title>
          <Button type='primary' onClick={() => navigate('/register')}>
            Ir al registro
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <Card className='mb-6'>
          <div className='flex justify-between items-center'>
            <div>
              <Title level={2} className='mb-2'>
                🃏 Planning Poker
              </Title>
              <Space>
                <Text strong>Usuario: {currentUser.name}</Text>
                <Text type='secondary'>•</Text>
                <Text strong>Sala: {roomId}</Text>
                <Text type='secondary'>•</Text>
                <Text type='secondary'>
                  Rol: {currentUser.role === 'voter' ? 'Votante' : 'Espectador'}
                </Text>
                <Text type='secondary'>•</Text>
                <Text type='secondary'>Voto: {currentUser.vote ?? 'Sin votar'}</Text>
              </Space>
            </div>
            <Space>
              <Button icon={<LinkOutlined />} onClick={handleCopyRoomLink} type='default'>
                Copiar Link
              </Button>
              <Button icon={<DisconnectOutlined />} onClick={handleDisconnect} danger>
                Desconectar
              </Button>
            </Space>
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

        {/* Game Status */}
        <Card className='mb-6'>
          <div className='text-center'>
            <Title level={3}>{revealed ? '🎯 Votos Revelados' : '⏳ Votando...'}</Title>
            <Text type='secondary'>
              {revealed
                ? 'Los votos han sido revelados. Puedes iniciar una nueva ronda.'
                : currentUser.role === 'voter'
                  ? currentUser.vote
                    ? 'Has votado. Espera a que todos voten para revelar.'
                    : 'Selecciona tu voto haciendo clic en una carta.'
                  : 'Los participantes están votando. Espera a que todos voten para revelar.'}
            </Text>
            {currentUser.role === 'voter' && currentUser.vote && !revealed && (
              <div className='mt-4'>
                <Text strong>Tu voto: </Text>
                <Text className='text-2xl font-bold text-blue-600'>{currentUser.vote}</Text>
              </div>
            )}
          </div>
        </Card>

        {/* Participants */}
        <Card title='👥 Participantes' className='mb-6'>
          <ParticipantsTable />
        </Card>

        {/* Voting Cards - Only for voters */}
        {currentUser.role === 'voter' && cardDeck && (
          <Card title='🃏 Selecciona tu voto' className='mb-6'>
            <div className='mb-4 text-center'>
              <Text type='secondary'>
                Estado: {revealed ? 'Votos revelados' : 'Votando'} | Tu voto:{' '}
                {currentUser.vote ?? 'Sin votar'} | Carta seleccionada: {selectedCard ?? 'Ninguna'}
              </Text>
            </div>
            <div className='flex flex-wrap justify-center gap-4'>
              {cardDeck.values.map((value) => (
                <PokerCard
                  key={value}
                  value={value}
                  isSelected={selectedCard === value}
                  onClick={() => handleCardClick(value)}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Show message if cards are not available */}
        {currentUser.role === 'voter' && !cardDeck && (
          <Card title='🃏 Cartas no disponibles' className='mb-6'>
            <div className='text-center'>
              <Text type='secondary'>
                Las cartas de votación no están disponibles. Esperando datos del servidor...
              </Text>
            </div>
          </Card>
        )}

        {/* Controls - Only for voters */}
        {currentUser.role === 'voter' && (
          <Card>
            <div className='text-center'>
              <Space size='large'>
                <Button
                  type='primary'
                  size='large'
                  onClick={handleReveal}
                  disabled={
                    revealed ||
                    players.filter((p) => p.role === 'voter').some((p) => p.vote === null)
                  }
                >
                  {revealed ? 'Votos Revelados' : 'Revelar Votos'}
                </Button>
                <Button size='large' onClick={handleReset} disabled={!revealed}>
                  Nueva Ronda
                </Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Spectator Info */}
        {currentUser.role === 'spectator' && (
          <Card>
            <div className='text-center'>
              <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <Title level={4} className='mt-4'>
                Modo Espectador
              </Title>
              <Text type='secondary'>
                Estás observando la sesión. Los votos se revelarán cuando el moderador lo decida.
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
