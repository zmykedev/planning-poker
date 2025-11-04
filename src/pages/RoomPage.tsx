import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Title, Text } from '../components/ui/Typography';
import { PlanningRoom } from '../components/PlanningRoom';
import { ConnectionStatus } from '../components/ConnectionStatus';
import type { Room, CardValue } from '../types';
import { EmojiPicker } from '../components/EmojiPicker';
import { getRandomEmoji } from '../utils/emoji.ts';
import { apiService } from '../services/apiService';

interface RoomPageProps {
  room: Room | null;
  currentUserId: string | null;
  currentUserName: string | null;
  connected: boolean;
  joinRoom: (roomId: string, userName: string, emoji: string) => void;
  vote: (vote: CardValue) => void;
  revealVotes: () => void;
  resetVoting: () => void;
  toggleSpectator: (spectator: boolean) => void;
}

export function RoomPage({
  room,
  currentUserId,
  connected,
  joinRoom,
  vote,
  revealVotes,
  resetVoting,
  toggleSpectator,
}: RoomPageProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(getRandomEmoji());
  const [roomName, setRoomName] = useState<string | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomInfo = async () => {
      setLoadingRoom(true);
      const roomData = await apiService.getRoomById(roomId);
      if (roomData) {
        setRoomName(roomData.name);
      }
      setLoadingRoom(false);
    };

    fetchRoomInfo();
  }, [roomId]);

  const handleJoin = () => {
    if (!roomId) return;
    if (!connected || !newPlayerName.trim()) return;
    const emoji = selectedEmoji || getRandomEmoji();
    joinRoom(roomId, newPlayerName.trim(), emoji);
  };

  // Si ya tenemos room y currentUserId, mostrar sala de votación
  if (room && currentUserId) {
    return (
      <PlanningRoom
        room={room}
        currentUserId={currentUserId}
        onVote={vote}
        onReveal={revealVotes}
        onReset={resetVoting}
        onToggleSpectator={toggleSpectator}
      />
    );
  }

  // Si no hay room o currentUserId, mostrar formulario de unirse
  return (
    <div
      className='min-h-screen flex items-center justify-center'
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
      <div className='w-full max-w-md p-6'>
        <Card className='p-6'>
          <div className='flex flex-col items-center text-center mb-6'>
            <div className='flex items-center gap-3 mb-2'>
              <img src='/favicon.svg' alt='FocusPoker' className='w-10 h-10' />
              <Title className='text-gray-800'>Unirse a Sala</Title>
            </div>
            <ConnectionStatus connected={connected} />
          </div>

          <div className='flex flex-col gap-6'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Users className='h-4 w-4' />
                <Text className='font-semibold'>
                  {loadingRoom ? 'Cargando...' : roomName ? `Sala: ${roomName}` : `Sala: ${roomId}`}
                </Text>
              </div>
              <Text variant='secondary' className='block'>
                Ingresa tu nombre para unirte a la sala
              </Text>
            </div>

            <div>
              <div className='flex items-center gap-2 mb-2'>
                <User className='h-4 w-4' />
                <Text className='font-semibold'>Tu Nombre</Text>
              </div>
              <Input
                placeholder='John Doe'
                value={newPlayerName}
                onChange={(e) => {
                  setNewPlayerName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoin();
                }}
                className='mb-3'
              />
              <div className='flex justify-center mt-2'>
                <EmojiPicker value={selectedEmoji} onSelect={setSelectedEmoji} />
              </div>
            </div>

            <Button
              variant='primary'
              size='large'
              onClick={handleJoin}
              disabled={!connected || !newPlayerName.trim()}
              className='w-full'
            >
              Unirse a la Sala
            </Button>

            <Button variant='secondary' onClick={() => navigate('/')} className='w-full'>
              Volver al Inicio
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
