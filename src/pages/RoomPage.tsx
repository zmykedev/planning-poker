import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Space, Typography, Button, Input } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { PlanningRoom } from '../components/PlanningRoom';
import { ConnectionStatus } from '../components/ConnectionStatus';
import type { Room, CardValue } from '../types';
import { EmojiPicker } from '../components/EmojiPicker';
import { getRandomEmoji } from '../utils/emoji.ts';

const { Title, Text } = Typography;

interface RoomPageProps {
  room: Room | null;
  currentUserId: string | null;
  currentUserName: string | null;
  connected: boolean;
  joinRoom: (roomId: string, userName: string, emoji: string) => void;
  vote: (vote: CardValue) => void;
  revealVotes: () => void;
  resetVoting: () => void;
}

export function RoomPage({
  room,
  currentUserId,
  connected,
  joinRoom,
  vote,
  revealVotes,
  resetVoting,
}: RoomPageProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(getRandomEmoji());
  const navigate = useNavigate();
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
      />
    );
  }

  // Si no hay room o currentUserId, mostrar formulario de unirse
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-md p-6'>
        <Card className='shadow-lg border-0 bg-white/90 backdrop-blur-sm'>
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
              <Text type='secondary' className='block'>
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
                  setNewPlayerName(e.target.value);
                }}
                onPressEnter={handleJoin}
                className='mb-3'
              />
              <div className="flex justify-center mt-2">
              <EmojiPicker  value={selectedEmoji} onSelect={setSelectedEmoji} />
              </div>
            </div>

            <Button
              type='primary'
              size='large'
              onClick={handleJoin}
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
