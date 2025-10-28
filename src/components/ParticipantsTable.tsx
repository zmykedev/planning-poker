import { Avatar, Card, Space, Tag, Typography } from 'antd';
import { UserOutlined, EyeOutlined, CheckCircleFilled } from '@ant-design/icons';
import type { User } from '../types';

const { Text } = Typography;

interface ParticipantsTableProps {
  players: User[];
  revealed: boolean;
  currentUserId?: string;
}

export const ParticipantsTable = ({ players, revealed, currentUserId }: ParticipantsTableProps) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
      {players.map((user) => (
        <Card
          key={user.id}
          className={`text-center ${user.id === currentUserId ? 'border-blue-500 bg-blue-50' : ''}`}
        >
          <Space direction='vertical' align='center'>
            <Avatar size={48} icon={<UserOutlined />} />
            <Text strong>{user.name}</Text>
            {!user.isModerator && <Tag icon={<EyeOutlined />}>Votante</Tag>}
            <div style={{ height: 50, display: 'flex', alignItems: 'center' }}>
              {revealed ? (
                <Text className='text-3xl font-bold'>{user.vote ?? '?'}</Text>
              ) : user.vote !== null ? (
                <CheckCircleFilled style={{ fontSize: 24, color: '#52c41a' }} />
              ) : (
                <Text type='secondary'>Votando...</Text>
              )}
            </div>
          </Space>
        </Card>
      ))}
    </div>
  );
};

export default ParticipantsTable;
