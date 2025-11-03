import { useState, useEffect } from 'react';
import { Typography, Button, message } from 'antd';
import { LinkOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { VotingResults } from './VotingResults';
import type { Room, CardValue } from '../types';

const { Text } = Typography;

interface Props {
  room: Room;
  currentUserId: string;
  onVote: (vote: CardValue) => void;
  onReveal: () => void;
  onReset: () => void;
}

export function PlanningRoom({ room, currentUserId, onVote, onReveal, onReset }: Props) {
  const [selectedCard, setSelectedCard] = useState<CardValue | null>(null);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);

  const currentUser = room.users.find((u) => u.id === currentUserId);
  const allVoted = room.users.every((u) => u.vote !== null);
  const isModerator = currentUser?.id === room.ownerId;

  // Usar las cartas de la sala directamente
  const cardDeck = {
    id: 'room-cards',
    name: 'Cartas de la Sala',
    values: room.cards,
  };

  const otherPlayers = room.users.filter((user) => user.id !== currentUserId);

  const renderPlayerCard = (user: Room['users'][number], size: 'sm' | 'lg' = 'sm') => {
    if (!user) {
      return null;
    }

    const showHiddenPattern = user.vote !== null && !room.revealed;
    const isCurrent = user.id === currentUserId;
    const cardSizeClasses = size === 'lg' ? 'w-28 h-40 rounded-3xl' : 'w-16 h-24 rounded-2xl';
    const valueTextSize = size === 'lg' ? 'text-3xl' : 'text-xl';

    return (
      <div key={user.id} className='flex flex-col items-center gap-3'>
        <div
          className={`relative ${cardSizeClasses} border-2 shadow-md transition-all duration-500 transform`}
          style={{
            transformStyle: 'preserve-3d',
            transform: room.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className={`absolute inset-0 flex items-center justify-center font-bold text-sm transition-opacity duration-300 ${
              room.revealed ? 'opacity-0' : 'opacity-100'
            } ${showHiddenPattern ? 'card-back-pattern text-transparent' : 'bg-white text-gray-600'}`}
          >
            {showHiddenPattern ? (
              <span className='sr-only'>Carta cubierta</span>
            ) : (
              <div className='flex flex-col items-center gap-1'>
                <div className='text-sm'>?</div>
                <div className='text-xs text-gray-500'>Esperando</div>
              </div>
            )}
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center text-blue-600 font-black transition-opacity duration-300 ${
              room.revealed ? 'opacity-100' : 'opacity-0'
            } ${valueTextSize}`}
            style={{
              transform: room.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div>{user.vote ?? '?'}</div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${
            isCurrent
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-slate-700 border border-blue-100'
          }`}
        >
          <span className='text-lg'>{user.emoji}</span>
          <span>{user.name || `Usuario ${user.id.slice(0, 6)}`}</span>
        </div>
      </div>
    );
  };

  const handleVote = (value: CardValue) => {
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

  const handleRevealClick = () => {
    if (revealCountdown !== null) {
      return;
    }
    setRevealCountdown(3);
  };

  // Sincronizar selectedCard con currentUser.vote cuando cambie desde el servidor
  useEffect(() => {
    const serverVote = currentUser?.vote;

    if (serverVote !== undefined && selectedCard !== serverVote) {
      setSelectedCard(serverVote);
    }
  }, [currentUser?.vote, selectedCard]);

  useEffect(() => {
    if (revealCountdown === null) {
      return;
    }

    if (revealCountdown === 0) {
      onReveal();
      setRevealCountdown(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setRevealCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [revealCountdown, onReveal]);

  return (
    <div className='min-h-screen flex flex-col bg-slate-50 text-slate-900'>
      <header className='flex items-center justify-between px-8 py-6 border-b border-blue-100 bg-white/70 backdrop-blur'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 text-xl font-semibold'>
            🂡
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-semibold'>{room.name}</span>
            <span className='text-sm text-slate-500'>Planning poker game</span>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm'>
            <span className='text-lg'>{currentUser?.emoji ?? '🙂'}</span>
            <span>{currentUser?.name ?? 'Tú'}</span>
          </div>

          <Button
            icon={<LinkOutlined />}
            onClick={handleCopyRoomLink}
            className='border-blue-400 text-blue-600 hover:bg-blue-50'
          >
            Invite players
          </Button>
        </div>
      </header>

      <main className='flex-1 flex flex-col items-center gap-10 px-6 py-10'>
        {otherPlayers.length === 0 && (
          <div className='text-center text-slate-500'>
            <div className='text-lg font-medium'>Feeling lonely? 🥺</div>
            <Button type='link' onClick={handleCopyRoomLink} className='font-semibold'>
              Invite players
            </Button>
          </div>
        )}

        <div className='w-full max-w-lg'>
          <div className='rounded-3xl bg-blue-50/80 border border-blue-100 px-10 py-12 text-center shadow-inner'>
            <Text className='text-xl font-semibold text-blue-900'>Pick your cards!</Text>
          </div>
        </div>

        {currentUser && (
          <div className='flex flex-col items-center gap-6'>
            {renderPlayerCard(currentUser, 'lg')}

            {isModerator && (
              <>
                {!room.revealed && allVoted ? (
                  revealCountdown !== null ? (
                    <div className='rounded-full bg-blue-600/90 px-6 py-3 text-4xl font-bold text-white shadow-lg'>
                      {revealCountdown}
                    </div>
                  ) : (
                    <Button
                      type='primary'
                      icon={<EyeOutlined />}
                      onClick={handleRevealClick}
                      className='bg-blue-600 hover:bg-blue-700 border-blue-600'
                      size='large'
                    >
                      Revelar cartas
                    </Button>
                  )
                ) : null}

                {room.revealed && (
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={onReset}
                    className='bg-gray-600 hover:bg-gray-700 border-gray-600 text-white'
                    size='large'
                  >
                    Nueva Ronda
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {otherPlayers.length > 0 && (
          <div className='w-full max-w-4xl'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center'>
              {otherPlayers.map((user) => renderPlayerCard(user))}
            </div>
          </div>
        )}

        {/* {room.revealed && (
          <div className='w-full max-w-4xl'>
            <VotingResults players={room.users} revealed={room.revealed} cardDeck={cardDeck} />
          </div>
        )} */}
      </main>

      {currentUser && cardDeck ? (
        <footer className='border-t border-blue-100 bg-white/80 backdrop-blur px-6 py-6'>
          <div className='flex justify-center gap-3 flex-wrap'>
            {cardDeck.values.map((value, index) => (
              <div key={index} className='relative'>
                <div
                  className={`
                    w-16 h-20 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 flex items-center justify-center
                    ${
                      selectedCard === value
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                        : 'border-blue-400 text-blue-500 bg-white hover:bg-blue-50'
                    }
                    ${room.revealed ? 'pointer-events-none opacity-60' : ''}
                  `}
                  onClick={() => !room.revealed && handleVote(value)}
                >
                  <span className='text-lg font-bold'>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
