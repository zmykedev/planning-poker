import { Card } from 'antd';

interface PokerCardProps {
  value: number | string;
  isSelected?: boolean;
  onClick: () => void;
}

export const PokerCard = ({ value, isSelected, onClick }: PokerCardProps) => (
  <Card
    hoverable
    className={`flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
      isSelected ? 'border-blue-500 border-2' : ''
    }`}
    style={{ width: 80, height: 120 }}
    bodyStyle={{
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}
    onClick={onClick}
  >
    {value}
  </Card>
);

export default PokerCard;
