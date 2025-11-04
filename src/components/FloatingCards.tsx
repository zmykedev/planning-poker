import { motion } from 'framer-motion';
import { useMemo, memo } from 'react';

interface FloatingCard {
  id: number;
  value: string | number;
  x: number;
  y: number;
  duration: number;
  delay?: number;
  rotation: number;
  scale: number;
}

const cardValues = ['1', '2', '3', '5', '8', '13', '21', '34'];

// Optimización: Generar cartas solo una vez
const generateCards = (): FloatingCard[] => {
  return Array.from({ length: 80 }, (_, i) => {
    // Crear más concentración en los laterales
    const rand = Math.random();
    let x: number;

    if (rand < 0.35) {
      // 35% en el lado izquierdo
      x = Math.random() * 25 - 10;
    } else if (rand < 0.7) {
      // 35% en el lado derecho
      x = 85 + Math.random() * 25;
    } else {
      // 30% en el centro
      x = 25 + Math.random() * 60;
    }

    return {
      id: i,
      value: cardValues[Math.floor(Math.random() * cardValues.length)],
      x,
      y: -20 - Math.random() * 100,
      duration: 20 + Math.random() * 30,
      rotation: Math.random() * 720 - 360,
      scale: 0.5 + Math.random() * 0.6,
    };
  });
};

export const FloatingCards = memo(() => {
  // useMemo para evitar regenerar las cartas
  const cards = useMemo(() => generateCards(), []);

  return (
    <div className='fixed inset-0 pointer-events-none overflow-hidden' aria-hidden='true'>
      {cards.map((card) => (
        <motion.div
          key={card.id}
          className='absolute'
          initial={{
            x: `${card.x}vw`,
            y: `${card.y}vh`,
            rotate: 0,
            scale: card.scale,
            opacity: 0,
          }}
          animate={{
            x: `${card.x}vw`,
            y: '120vh',
            rotate: card.rotation,
            opacity: [0, 0.25, 0.25, 0],
          }}
          transition={{
            duration: card.duration,
            delay: card.delay,
            repeat: Infinity,
            ease: 'linear',
            opacity: {
              duration: card.duration,
              times: [0, 0.15, 0.85, 1],
            },
          }}
          style={{
            width: '3.5rem',
            height: '5.5rem',
            willChange: 'transform, opacity',
          }}
        >
          <div
            className='w-full h-full rounded-xl border-2 border-blue-300 bg-gradient-to-br from-white via-blue-50 to-white flex items-center justify-center font-black text-xl text-blue-600 shadow-lg'
            style={{
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)',
            }}
          >
            {card.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

FloatingCards.displayName = 'FloatingCards';
