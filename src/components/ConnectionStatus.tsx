import { Ripples } from 'ldrs/react';
import { Typography } from 'antd';

const { Text } = Typography;

interface ConnectionStatusProps {
  connected: boolean;
}

export const ConnectionStatus = ({ connected }: ConnectionStatusProps) => {
  return (
    <div className='flex items-center justify-center gap-2 min-w-[120px]'>
      {connected ? (
        <>
          <div
            className='size-4 rounded-full animate-pulse'
            style={{ backgroundColor: 'var(--color-green)' }}
          ></div>
          <Text className='font-medium' style={{ color: 'var(--color-green)' }}>
            Conectado
          </Text>
        </>
      ) : (
        <>
          <div className='flex items-center justify-center'>
            <Ripples size='20' speed='1.75' color='var(--color-blue)' />
          </div>
          <Text className='font-medium' style={{ color: 'var(--color-blue)' }}>
            Conectando
          </Text>
        </>
      )}
    </div>
  );
};
