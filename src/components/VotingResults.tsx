import { Card, Typography, Space, Progress } from 'antd';
import type { User, CardDeck } from '../types';

const { Title, Text } = Typography;

interface VotingResultsProps {
  players: User[];
  revealed: boolean;
  cardDeck?: CardDeck;
}

export const VotingResults = ({ players, revealed, cardDeck }: VotingResultsProps) => {
  if (!revealed) return null;

  const votes = players.filter((u) => u.vote !== null).map((u) => u.vote as string | number);

  if (votes.length === 0) {
    return (
      <Card title='Resultados' className='mb-6'>
        <Text type='secondary'>No hay votos para mostrar</Text>
      </Card>
    );
  }

  const numericVotes = votes.filter((v) => typeof v === 'number') as number[];
  const average =
    numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
      : 'N/A';

  const voteCounts = votes.reduce(
    (acc, vote) => {
      const key = String(vote);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const maxCount = Math.max(...Object.values(voteCounts));
  const mostCommon = Object.entries(voteCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([vote]) => vote);

  return (
    <Card title='Resultados' className='mb-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card className='text-center bg-blue-50 border-blue-200'>
          <Text type='secondary'>Promedio</Text>
          <Title level={3} className='text-blue-900'>
            {average}
          </Title>
        </Card>
        <Card
          className='text-center border-0'
          style={{
            backgroundColor: 'var(--color-green-20)',
            border: '1px solid var(--color-green-50)',
          }}
        >
          <Text style={{ color: 'var(--color-green)' }}>Más Común</Text>
          <Title level={3} style={{ color: 'var(--color-green)' }}>
            {mostCommon.join(', ')}
          </Title>
        </Card>
        <Card className='text-center bg-purple-50 border-purple-200'>
          <Text type='secondary'>Total Votos</Text>
          <Title level={3} className='text-purple-900'>
            {votes.length}
          </Title>
        </Card>
      </div>

      <Title level={4}>Distribución de Votos</Title>
      <Space direction='vertical' className='w-full'>
        {Object.entries(voteCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([vote, count]) => {
            const percentage = (count / votes.length) * 100;
            return (
              <div key={vote} className='flex items-center space-x-3'>
                <Text strong className='w-16' style={{ color: 'var(--color-blue)' }}>
                  {vote}
                </Text>
                <Progress
                  percent={percentage}
                  showInfo={false}
                  strokeColor='var(--color-green)'
                  className='flex-1'
                />
                <Text>
                  {count} ({percentage.toFixed(0)}%)
                </Text>
              </div>
            );
          })}
      </Space>
    </Card>
  );
};
