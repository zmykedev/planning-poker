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

  // Distribuir todos los jugadores alrededor de la mesa
  const distributePlayersAroundTable = (players: Room['users']) => {
    const total = players.length;
    const top: Room['users'] = [];
    const bottom: Room['users'] = [];
    const left: Room['users'] = [];
    const right: Room['users'] = [];

    if (total === 1) {
      bottom.push(players[0]);
    } else if (total === 2) {
      top.push(players[0]);
      bottom.push(players[1]);
    } else if (total === 3) {
      top.push(players[0]);
      bottom.push(players[1], players[2]);
    } else if (total === 4) {
      top.push(players[0], players[1]);
      bottom.push(players[2], players[3]);
    } else if (total <= 6) {
      const perSide = Math.ceil(total / 2);
      top.push(...players.slice(0, perSide));
      bottom.push(...players.slice(perSide));
    } else if (total <= 10) {
      const perTopBottom = Math.floor(total / 3);
      const remaining = total - perTopBottom * 2;
      const perSide = Math.ceil(remaining / 2);
      
      top.push(...players.slice(0, perTopBottom));
      left.push(...players.slice(perTopBottom, perTopBottom + perSide));
      right.push(...players.slice(perTopBottom + perSide, perTopBottom + remaining));
      bottom.push(...players.slice(perTopBottom + remaining));
    } else {
      const perSide = Math.ceil(total / 4);
      top.push(...players.slice(0, perSide));
      right.push(...players.slice(perSide, perSide * 2));
      bottom.push(...players.slice(perSide * 2, perSide * 3));
      left.push(...players.slice(perSide * 3));
    }

    return { top, bottom, left, right };
  };

  const playersDistribution = distributePlayersAroundTable(room.users);

  const renderPlayerCard = (user: Room['users'][number]) => {
    if (!user) {
      return null;
    }

    const showHiddenPattern = user.vote !== null && !room.revealed;
    const isCurrent = user.id === currentUserId;

    return (
      <div key={user.id} className='flex flex-col items-center gap-2'>
        <div
          className={`relative w-14 h-20 rounded-xl border-2 shadow-md transition-all duration-500 transform`}
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
              <div className='text-lg'>?</div>
            )}
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center text-blue-600 font-black text-xl transition-opacity duration-300 ${
              room.revealed ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: room.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div>{user.vote ?? '?'}</div>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
            isCurrent
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-slate-700 border border-blue-100'
          }`}
        >
          <span className='text-sm'>{user.emoji}</span>
          <span className='max-w-[70px] truncate'>{user.name || `User ${user.id.slice(0, 4)}`}</span>
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
    <div className='h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden'>
      {/* Header compacto */}
      <header className='flex items-center justify-between px-6 py-3 border-b border-blue-100 bg-white/70 backdrop-blur shrink-0'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-lg font-semibold'>
            🂡
          </div>
          <span className='text-base font-semibold'>{room.name}</span>
        </div>

        <Button
          icon={<LinkOutlined />}
          size='small'
          onClick={handleCopyRoomLink}
          className='border-blue-400 text-blue-600 hover:bg-blue-50'
        >
          Invitar
        </Button>
      </header>

      {/* Main - Mesa con jugadores alrededor */}
      <main className='flex-1 relative overflow-hidden'>
        {room.users.length === 0 ? (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center text-slate-500'>
              <div className='text-lg font-medium'>¿Te sientes solo? 🥺</div>
              <Button type='link' onClick={handleCopyRoomLink} className='font-semibold'>
                Invitar jugadores
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Jugadores arriba */}
            {playersDistribution.top.length > 0 && (
              <div className='absolute top-4 left-1/2 -translate-x-1/2 flex gap-4'>
                {playersDistribution.top.map((user) => renderPlayerCard(user))}
              </div>
            )}

            {/* Jugadores izquierda */}
            {playersDistribution.left.length > 0 && (
              <div className='absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4'>
                {playersDistribution.left.map((user) => renderPlayerCard(user))}
              </div>
            )}

            {/* Jugadores derecha */}
            {playersDistribution.right.length > 0 && (
              <div className='absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4'>
                {playersDistribution.right.map((user) => renderPlayerCard(user))}
              </div>
            )}

            {/* Jugadores abajo */}
            {playersDistribution.bottom.length > 0 && (
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
                {playersDistribution.bottom.map((user) => renderPlayerCard(user))}
              </div>
            )}

            {/* Mesa central con controles */}
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              <div className='flex flex-col items-center gap-4 pointer-events-auto'>
                {/* Mesa/Superficie de juego */}
                <div className='w-72 h-40 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200 shadow-xl flex items-center justify-center'>
                  <div className='text-center'>
                    {!room.revealed && !allVoted && (
                      <Text className='text-lg font-semibold text-blue-900'>
                        🎴 Esperando votos...
                      </Text>
                    )}
                    
                    {/* Botón Revelar */}
                    {isModerator && !room.revealed && allVoted && revealCountdown === null && (
                      <Button
                        type='primary'
                        icon={<EyeOutlined />}
                        onClick={handleRevealClick}
                        className='bg-blue-600 hover:bg-blue-700 border-blue-600'
                        size='large'
                      >
                        Revelar votos
                      </Button>
                    )}

                    {/* Contador */}
                    {revealCountdown !== null && (
                      <div className='text-6xl font-bold text-blue-600 animate-pulse'>
                        {revealCountdown}
                      </div>
                    )}

                    {/* Votos revelados */}
                    {room.revealed && !isModerator && (
                      <Text className='text-lg font-semibold text-blue-900'>
                        ✨ Votos revelados
                      </Text>
                    )}

                    {/* Botón Nueva Ronda */}
                    {isModerator && room.revealed && (
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={onReset}
                        className='bg-gray-600 hover:bg-gray-700 border-gray-600 text-white'
                        size='large'
                      >
                        Nueva Ronda
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer con cartas - compacto */}
      {currentUser && cardDeck && (
        <footer className='border-t border-blue-100 bg-white/80 backdrop-blur px-4 py-3 shrink-0'>
          <div className='flex justify-center gap-2 flex-wrap max-w-4xl mx-auto'>
            {cardDeck.values.map((value, index) => (
              <div
                key={index}
                className={`
                  w-12 h-16 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 flex items-center justify-center
                  ${
                    selectedCard === value
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                      : 'border-blue-400 text-blue-500 bg-white hover:bg-blue-50'
                  }
                  ${room.revealed ? 'pointer-events-none opacity-60' : ''}
                `}
                onClick={() => !room.revealed && handleVote(value)}
              >
                <span className='text-base font-bold'>{value}</span>
              </div>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
