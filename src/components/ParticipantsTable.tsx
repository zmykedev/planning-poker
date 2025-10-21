import { Avatar, Card, Space, Tag, Typography } from 'antd';
import { UserOutlined, EyeOutlined, CheckCircleFilled } from '@ant-design/icons';
import useSessionStore from '../store';

const { Text } = Typography;

export const ParticipantsTable = () => {
  const { users, votesRevealed } = useSessionStore();

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
      {users.map((user) => (
        <Card key={user.id} className='text-center'>
          <Space direction='vertical' align='center'>
            <Avatar size={48} icon={<UserOutlined />} />
            <Text strong>{user.name}</Text>
            {user.role === 'spectator' && <Tag icon={<EyeOutlined />}>Espectador</Tag>}
            <div style={{ height: 50, display: 'flex', alignItems: 'center' }}>
              {votesRevealed ? (
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
