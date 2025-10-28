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
          <div className='size-4 bg-green-500 rounded-full animate-pulse'></div>
          <Text className='text-green-600 font-medium'>Conectado</Text>
        </>
      ) : (
        <>
          <div className='flex items-center justify-center '>
            <Ripples size='20' speed='1.75' color='#3b82f6' />
          </div>
          <Text className='text-blue-600 font-medium'>Conectando</Text>
        </>
      )}
    </div>
  );
};
