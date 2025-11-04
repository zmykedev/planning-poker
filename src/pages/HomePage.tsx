import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Title, Text } from '../components/ui/Typography';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { FloatingCards } from '../components/FloatingCards';
import type { CardDeck, Room } from '../types';
import { EmojiPicker } from '../components/EmojiPicker';
import { getRandomEmoji } from '../utils/emoji.ts';
import { CARD_DECKS } from '../types';

interface HomePageProps {
  room: Room | null;
  currentUserId: string | null;
  currentUserName: string | null;
  connected: boolean;
  createRoom: (roomName: string, userName: string, cardDeck: CardDeck, ownerEmoji: string) => void;
}

export function HomePage({
  room,
  currentUserId,
  currentUserName,
  connected,
  createRoom,
}: HomePageProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [selectedDeck] = useState<CardDeck>(CARD_DECKS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(getRandomEmoji());
  const navigate = useNavigate();

  const handleCreateRoom = (roomName: string, userName: string, cardDeck: CardDeck) => {
    const emoji = selectedEmoji || getRandomEmoji();
    createRoom(roomName, userName, cardDeck, emoji);
  };

  useEffect(() => {
    if (room && currentUserId && currentUserName) {
      navigate(`/room/${room.id}`);
    }
  }, [room, currentUserId, currentUserName, navigate]);

  return (
    <main
      className='min-h-screen flex items-center justify-center relative overflow-hidden'
      role='main'
      aria-label='Página de inicio de FocusPoker'
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
      {/* Cartas flotantes de fondo */}
      <FloatingCards />

      <div className='w-full max-w-md p-6 relative z-10'>
        <Card className='p-6'>
          <div className='flex flex-col items-center text-center mb-6'>
            <div className='flex items-center gap-3 mb-2'>
              <img src='/favicon.svg' alt='FocusPoker' className='w-10 h-10' />
              <Title className='text-gray-800'>FocusPoker</Title>
            </div>
            <ConnectionStatus connected={connected} />
          </div>

          <div className='flex flex-col gap-6'>
            {/* Información del Usuario */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <User className='h-4 w-4' />
                <Text className='font-semibold'>Ingresa tu nombre o alias</Text>
              </div>
              <Input
                placeholder='John Doe'
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && connected && newPlayerName.trim() && roomName.trim()) {
                    handleCreateRoom(roomName, newPlayerName, selectedDeck);
                  }
                }}
                className='mb-3'
              />
              {/* EmojiPicker posicionado debajo del nombre */}
              <div className='flex justify-center mt-2'>
                <EmojiPicker value={selectedEmoji} onSelect={setSelectedEmoji} />
              </div>
            </div>

            {/* Crear Nueva Sala */}
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Plus className='h-4 w-4' />
                <Text className='font-semibold'>Crear Nueva Sala</Text>
              </div>
              <Input
                placeholder='Planning Experiencia Digital'
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && connected && newPlayerName.trim() && roomName.trim()) {
                    handleCreateRoom(roomName, newPlayerName, selectedDeck);
                  }
                }}
                className='mb-3'
              />

              <Button
                variant='primary'
                size='large'
                onClick={() => handleCreateRoom(roomName, newPlayerName, selectedDeck)}
                disabled={!connected || !newPlayerName.trim() || !roomName.trim()}
                className='w-full mt-4'
              >
                Crear Sala
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
