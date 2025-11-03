import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Space, Typography, Button, Input } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { ConnectionStatus } from '../components/ConnectionStatus';
import type { CardDeck, Room } from '../types';
import { EmojiPicker } from '../components/EmojiPicker';
import { getRandomEmoji } from '../utils/emoji.ts';
import { CARD_DECKS } from '../types';

const { Title, Text } = Typography;

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
  console.log('connected', connected);

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-md p-6'>
        <Card className='shadow-lg border-0 bg-white/90 backdrop-blur-sm'>
          <div className='text-center mb-6'>
            <Title level={2} className='mb-2 text-gray-800'>
              🃏 Planning Poker
            </Title>
            <div className='flex flex-col items-center gap-3 mb-2'>
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
                onPressEnter={() => {
                  if (connected && newPlayerName.trim() && roomName.trim()) {
                    handleCreateRoom(roomName, newPlayerName, selectedDeck);
                  }
                }}
                className='mb-3'
              />
              {/* EmojiPicker posicionado debajo del nombre */}
              <div className="flex justify-center mt-2">
                <EmojiPicker value={selectedEmoji} onSelect={setSelectedEmoji} />
              </div>
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
                onPressEnter={() => {
                  if (connected && newPlayerName.trim() && roomName.trim()) {
                    handleCreateRoom(roomName, newPlayerName, selectedDeck);
                  }
                }}
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
