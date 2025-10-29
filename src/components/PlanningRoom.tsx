import { useState, useEffect } from 'react';
import { Typography, Button, message } from 'antd';
import { LinkOutlined, EyeOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { VotingResults } from './VotingResults';
import type { Room, CardValue } from '../types';
import { CARD_DECKS } from '../types';

const { Title, Text } = Typography;

interface Props {
  room: Room;
  currentUserId: string;
  onVote: (vote: CardValue) => void;
  onReveal: () => void;
  onReset: () => void;
}

export function PlanningRoom({ room, currentUserId, onVote, onReveal, onReset }: Props) {
  const [selectedCard, setSelectedCard] = useState<CardValue | null>(null);
  const navigate = useNavigate();

  const currentUser = room.users.find((u) => u.id === currentUserId);
  const allVoted = room.users.every((u) => u.vote !== null);
  const isModerator = currentUser?.id === room.ownerId;

  // Usar las cartas de la sala directamente
  const cardDeck = {
    id: 'room-cards',
    name: 'Cartas de la Sala',
    values: room.cards,
  };

  const handleVote = (value: CardValue) => {
    console.log('🗳️ Usuario votando:', { value, currentUserId, currentUserName });
    setSelectedCard(value);
    onVote(value);
  };

  const handleCopyRoomLink = () => {
    if (!room?.id) {
      message.error('No hay sala activa');
      return;
    }

    const baseUrl = window.location.origin;
    const roomLink = `${baseUrl}/room/${room.id}`;

    navigator.clipboard
      .writeText(roomLink)
      .then(() => {
        message.success('Link copiado al portapapeles');
      })
      .catch(() => {
        message.error('Error al copiar el link');
      });
  };

  // Sincronizar selectedCard con currentUser.vote
  useEffect(() => {
    console.log('🔄 Sincronizando voto:', { 
      currentUserVote: currentUser?.vote, 
      selectedCard, 
      currentUserId 
    });
    if (currentUser?.vote !== undefined && selectedCard !== currentUser.vote) {
      console.log('✅ Actualizando selectedCard a:', currentUser.vote);
      setSelectedCard(currentUser.vote);
    }
  }, [currentUser?.vote, selectedCard, currentUserId]);

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <Title level={2} className='mb-1 text-gray-800'>
                🃏 {room?.name}
              </Title>
              <Text type='secondary' className='text-sm'>
                {room.users.filter((p) => p.vote !== null).length} / {room.users.length} votos
              </Text>
            </div>

            <div className='flex gap-2'>
              {isModerator && (
                <>
                  {!room.revealed && allVoted && (
                    <Button
                      type='primary'
                      icon={<EyeOutlined />}
                      onClick={onReveal}
                      className='bg-blue-600 hover:bg-blue-700 border-blue-600'
                    >
                      Revelar cartas
                    </Button>
                  )}

                  {room.revealed && (
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={onReset}
                      className='bg-gray-600 hover:bg-gray-700 border-gray-600 text-white'
                    >
                      Nueva Ronda
                    </Button>
                  )}
                </>
              )}

              <Button icon={<LinkOutlined />} onClick={handleCopyRoomLink} type='default'>
                Copiar Link
              </Button>

              <Button icon={<HomeOutlined />} onClick={() => navigate('/')} type='default'>
                Inicio
              </Button>
            </div>
          </div>
        </div>

        {/* Mesa de Participantes */}
        <div className='mb-8'>
          <div className='relative w-full max-w-4xl mx-auto'>
            {/* Mesa central */}
            <div className='relative w-80 h-80 mx-auto mb-8'>
              <div className='absolute inset-0 bg-blue-100 rounded-2xl shadow-lg border-2 border-blue-200'></div>

              {/* Centro de la mesa */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='text-4xl mb-2'>🃏</div>
                  <Text className='text-blue-800 font-bold text-lg'>Planning Poker</Text>
                  <Text className='text-blue-600 text-sm'>{cardDeck.name}</Text>
                </div>
              </div>
            </div>

            {/* Participantes alrededor de la mesa */}
            <div className='absolute inset-0 w-80 h-80 mx-auto'>
              {room.users.map((user, index) => {
                const angle = (index * 360) / room.users.length;
                const radius = 140; // Radio desde el centro
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
                          w-16 h-20 rounded-lg border-2 transition-all duration-500 transform
                          ${
                            user.id === currentUserId
                              ? 'border-blue-500 shadow-lg'
                              : 'border-gray-300'
                          }
                          ${user.vote !== null ? 'bg-blue-500' : 'bg-white'}
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
                          absolute inset-0 flex items-center justify-center font-bold text-sm transition-opacity duration-300
                          ${room.revealed ? 'opacity-0' : 'opacity-100'}
                          ${user.vote !== null ? 'text-white' : 'text-gray-600'}
                        `}
                        >
                          {user.vote !== null ? (
                            <div className='flex flex-col items-center'>
                              <div className='text-sm'>✓</div>
                              <div className='text-xs mt-1'>Votado</div>
                            </div>
                          ) : (
                            <div className='flex flex-col items-center'>
                              <div className='text-sm'>?</div>
                              <div className='text-xs mt-1'>Esperando</div>
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
                            <div className='text-xl font-black'>{user.vote ?? '?'}</div>
                            <div className='text-xs mt-1 opacity-80'>Voto</div>
                          </div>
                        </div>
                      </div>

                      {/* Nombre del participante */}
                      <div className='mt-2 text-center'>
                        <div
                          className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${
                            user.id === currentUserId
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }
                        `}
                        >
                          {user.name || `Usuario ${user.id.slice(0, 8)}`}
                        </div>
                        {user.id === room.ownerId && (
                          <div className='text-yellow-500 text-xs mt-1'>👑</div>
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
          <div className='mb-6'>
            <div className='text-center mb-4'>
              <Title level={3} className='text-gray-800'>
                Selecciona tu voto
              </Title>
            </div>
            <div className='flex justify-center gap-3 flex-wrap'>
              {cardDeck.values.map((value, index) => (
                <div key={index} className='relative'>
                  <div
                    className={`
                      w-16 h-20 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 flex items-center justify-center
                      ${
                        selectedCard === value
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                          : 'border-gray-300 bg-white text-gray-800 hover:border-blue-400'
                      }
                      ${room.revealed ? 'pointer-events-none' : ''}
                    `}
                    onClick={() => !room.revealed && handleVote(value)}
                  >
                    <span className='text-lg font-bold'>{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show message if cards are not available */}
        {currentUser && !cardDeck && (
          <div className='text-center py-8'>
            <Text type='secondary'>Las cartas no están disponibles</Text>
          </div>
        )}

        {/* Voting Results - Show when revealed */}
        {room.revealed && (
          <VotingResults players={room.users} revealed={room.revealed} cardDeck={cardDeck} />
        )}

        {/* Notifications */}
        {!room.revealed && allVoted && isModerator && (
          <div className='fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce z-50'>
            <p className='font-semibold'>✓ ¡Todos han votado!</p>
            <p className='text-sm'>Puedes revelar los resultados</p>
          </div>
        )}

        {!room.revealed && allVoted && !isModerator && (
          <div className='fixed bottom-8 right-8 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-50'>
            <p className='font-semibold'>⏳ Esperando al moderador</p>
            <p className='text-sm'>Todos han votado</p>
          </div>
        )}
      </div>
    </div>
  );
}
