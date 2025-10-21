import { Card, Radio, Space, Typography } from 'antd';
import type { CardDeck } from '@/types/session';

const { Text } = Typography;

interface CardDeckSelectorProps {
  selectedDeck: CardDeck;
  onDeckChange: (deck: CardDeck) => void;
}

const CARD_DECKS: CardDeck[] = [
  {
    id: 'fibonacci',
    name: 'Fibonacci',
    values: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?'],
  },
  {
    id: 'modified-fibonacci',
    name: 'Fibonacci Modificado',
    values: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'],
  },
  {
    id: 'powers-of-2',
    name: 'Potencias de 2',
    values: [0, 1, 2, 4, 8, 16, 32, 64, '?'],
  },
  {
    id: 't-shirt-sizes',
    name: 'Tallas de Camiseta',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'],
  },
  {
    id: 'hours',
    name: 'Horas',
    values: [1, 2, 4, 8, 16, 24, 40, '?'],
  },
];

export const CardDeckSelector = ({ selectedDeck, onDeckChange }: CardDeckSelectorProps) => {
  return (
    <Card title="🃏 Selecciona el mazo de cartas" className="mb-6">
      <Radio.Group
        value={selectedDeck.id}
        onChange={(e) => {
          const deck = CARD_DECKS.find(d => d.id === e.target.value);
          if (deck) onDeckChange(deck);
        }}
      >
        <Space direction="vertical" size="middle" className="w-full">
          {CARD_DECKS.map((deck) => (
            <Radio key={deck.id} value={deck.id} className="w-full">
              <div className="flex justify-between items-center w-full">
                <div>
                  <Text strong>{deck.name}</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    {deck.values.join(', ')}
                  </Text>
                </div>
                <div className="flex gap-1">
                  {deck.values.slice(0, 6).map((value, index) => (
                    <div
                      key={index}
                      className="w-8 h-12 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-xs font-bold"
                    >
                      {value}
                    </div>
                  ))}
                  {deck.values.length > 6 && (
                    <div className="w-8 h-12 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs">
                      +{deck.values.length - 6}
                    </div>
                  )}
                </div>
              </div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Card>
  );
};

export default CardDeckSelector;
