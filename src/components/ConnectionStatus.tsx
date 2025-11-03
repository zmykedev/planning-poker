import { Ripples } from 'ldrs/react';
import { Text } from './ui/Typography';

interface ConnectionStatusProps {
  connected: boolean;
}

export const ConnectionStatus = ({ connected }: ConnectionStatusProps) => {
  return (
    <div className='flex items-center justify-center gap-2 min-w-[120px]'>
      {connected ? (
        <>
          <div className='size-3 bg-green-500 rounded-full animate-pulse'></div>
          <Text className='text-green-600 font-medium text-sm'>Conectado</Text>
        </>
      ) : (
        <>
          <div className='flex items-center justify-center'>
            <Ripples size='16' speed='1.75' color='#6b7280' />
          </div>
          <Text className='text-gray-600 font-medium text-sm'>Conectando</Text>
        </>
      )}
    </div>
  );
};
