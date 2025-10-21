import { Button, Space, Card } from 'antd';
import { useNavigate } from 'react-router';
import { useStore } from '../store';

export const SessionControls = () => {
  const { revealVotes, resetVotes, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Card className='mt-8'>
      <Space size='large' wrap className='flex justify-center'>
        <Button type='primary' onClick={revealVotes}>
          Revelar Votos
        </Button>
        <Button onClick={resetVotes}>Nueva Ronda</Button>
        <Button danger onClick={handleLogout}>
          Salir de la Sesión
        </Button>
      </Space>
    </Card>
  );
};

export default SessionControls;
