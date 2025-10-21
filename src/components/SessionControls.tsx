import { Button, Space, Card } from 'antd';
import { useNavigate } from 'react-router';
import { useWebSocketStore } from '../store/websocketStore';

export const SessionControls = () => {
  const { reveal, reset, disconnect, revealed, players } = useWebSocketStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnect();
    navigate('/register');
  };

  const canReveal = !revealed && players.filter(p => p.role === 'voter').every(p => p.vote !== null);

  return (
    <Card className='mt-8'>
      <Space size='large' wrap className='flex justify-center'>
        <Button 
          type='primary' 
          onClick={reveal}
          disabled={!canReveal}
        >
          {revealed ? 'Votos Revelados' : 'Revelar Votos'}
        </Button>
        <Button 
          onClick={reset}
          disabled={!revealed}
        >
          Nueva Ronda
        </Button>
        <Button danger onClick={handleLogout}>
          Salir de la Sesión
        </Button>
      </Space>
    </Card>
  );
};

export default SessionControls;
