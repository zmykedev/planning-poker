import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Eye, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import { Text } from './ui/Typography';
import { useToast } from '../contexts/ToastContext';
import type { Room, CardValue } from '../types';

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
  const toast = useToast();

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
          className='relative w-16 h-24'
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            transform: room.revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Cara frontal - Carta oculta */}
          <div
            className={`absolute inset-0 flex items-center justify-center font-bold rounded-2xl border-2 ${
              showHiddenPattern
                ? 'card-back-pattern border-blue-500'
                : 'bg-gradient-to-br from-white via-blue-50 to-white border-slate-200'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: showHiddenPattern
                ? '0 4px 14px 0 rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                : '0 4px 14px 0 rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(148, 163, 184, 0.1)',
            }}
          >
            {showHiddenPattern ? (
              <span className='sr-only'>Carta cubierta</span>
            ) : (
              <div className='text-2xl text-slate-400'>?</div>
            )}
          </div>

          {/* Cara trasera - Carta revelada */}
          <div
            className='absolute inset-0 flex items-center justify-center text-blue-600 font-black text-2xl rounded-2xl border-2 border-blue-400 bg-gradient-to-br from-white via-blue-50 to-white'
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow:
                '0 8px 20px 0 rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.2), inset 0 1px 2px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className='drop-shadow-sm'>{user.vote ?? '?'}</div>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
            isCurrent
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white text-slate-700 border border-slate-200 shadow-md'
          }`}
        >
          <span className='text-base'>{user.emoji}</span>
          <span className='max-w-[70px] truncate'>
            {user.name || `User ${user.id.slice(0, 4)}`}
          </span>
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
      toast.error('No hay sala activa');
      return;
    }

    const baseUrl = window.location.origin;
    const roomLink = `${baseUrl}/room/${room.id}`;

    navigator.clipboard
      .writeText(roomLink)
      .then(() => {
        toast.success('Link copiado al portapapeles');
      })
      .catch(() => {
        toast.error('Error al copiar el link');
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
    <div
      className='h-screen flex flex-col text-slate-900 overflow-hidden'
      style={{
        background: `linear-gradient(
          135deg,
          var(--color-purple-20) 0%,
          var(--color-blue-20) 25%,
          var(--color-green-20) 50%,
          var(--color-yellow-10) 75%,
          var(--color-orange-10) 100%
        ), #f8fafc`,
      }}
    >
      {/* Header compacto */}
      <header className='flex items-center justify-between px-6 py-3 border-b border-blue-100 bg-white/70 backdrop-blur shrink-0'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-lg font-semibold'>
            🂡
          </div>
          <span className='text-base font-semibold'>{room.name}</span>
        </div>

        <Button
          icon={<Link className='h-4 w-4' />}
          size='small'
          variant='secondary'
          onClick={handleCopyRoomLink}
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
              <Button variant='link' onClick={handleCopyRoomLink} className='font-semibold'>
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
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                  className='relative w-64 h-20 rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-100 border-2 border-blue-300 flex items-center justify-center overflow-hidden'
                  style={{
                    boxShadow:
                      '0 20px 60px -10px rgba(59, 130, 246, 0.3), 0 10px 30px -5px rgba(59, 130, 246, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(148, 163, 184, 0.1)',
                  }}
                >
                  {/* Efecto de brillo en el borde */}
                  <div className='absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40 pointer-events-none' />

                  <div className='text-center z-10'>
                    {!room.revealed && !allVoted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Text className='text-base font-semibold text-blue-900'>
                          🎴 Esperando votos...
                        </Text>
                      </motion.div>
                    )}

                    {/* Botón Revelar */}
                    {isModerator && !room.revealed && allVoted && revealCountdown === null && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <Button
                          variant='primary'
                          icon={<Eye className='h-4 w-4' />}
                          onClick={handleRevealClick}
                          size='default'
                          className='shadow-2xl shadow-blue-600/50'
                        >
                          Revelar votos
                        </Button>
                      </motion.div>
                    )}

                    {/* Contador */}
                    {revealCountdown !== null && (
                      <motion.div
                        key={revealCountdown}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className='text-5xl font-black bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent'
                        style={{
                          textShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
                        }}
                      >
                        {revealCountdown}
                      </motion.div>
                    )}

                    {/* Votos revelados */}
                    {room.revealed && !isModerator && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Text className='text-base font-semibold text-blue-900'>
                          ✨ Votos revelados
                        </Text>
                      </motion.div>
                    )}

                    {/* Botón Nueva Ronda */}
                    {isModerator && room.revealed && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
                      >
                        <Button
                          icon={<RotateCcw className='h-4 w-4' />}
                          onClick={onReset}
                          className='bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-2xl shadow-gray-600/50'
                          size='default'
                        >
                          Nueva Ronda
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer con cartas - compacto */}
      {currentUser && cardDeck && (
        <footer className='border-t border-blue-100 bg-white/90 backdrop-blur-md px-4 py-4 shrink-0 shadow-lg'>
          <div className='flex justify-center gap-3 flex-wrap max-w-4xl mx-auto'>
            {cardDeck.values.map((value, index) => (
              <motion.div
                key={index}
                whileHover={!room.revealed ? { scale: 1.1, y: -8 } : {}}
                whileTap={!room.revealed ? { scale: 0.95 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className={`
                  relative w-14 h-20 rounded-xl cursor-pointer flex items-center justify-center
                  ${room.revealed ? 'pointer-events-none opacity-50' : ''}
                `}
                onClick={() => !room.revealed && handleVote(value)}
              >
                <div
                  className={`
                    w-full h-full rounded-xl border-2 flex items-center justify-center transition-all duration-300
                    ${
                      selectedCard === value
                        ? 'border-blue-500 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/40 scale-105'
                        : 'border-blue-300 bg-gradient-to-br from-white via-blue-50 to-white text-blue-600 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-300/30'
                    }
                  `}
                  style={
                    selectedCard === value
                      ? {
                          boxShadow:
                            '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                        }
                      : {
                          boxShadow:
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        }
                  }
                >
                  <span className='text-lg font-black drop-shadow-sm'>{value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
