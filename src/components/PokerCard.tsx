import { Card } from 'antd';

interface PokerCardProps {
  value: number | string;
  isSelected?: boolean;
  onClick: () => void;
  revealed?: boolean;
  disabled?: boolean;
}

export const PokerCard = ({ value, isSelected, onClick, revealed, disabled }: PokerCardProps) => (
  <Card
    hoverable={!disabled}
    className={`flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
      isSelected ? 'border-blue-500 border-2' : ''
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    style={{ width: 80, height: 120 }}
    bodyStyle={{
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}
    onClick={disabled ? undefined : onClick}
  >
    {value}
  </Card>
);

export default PokerCard;
