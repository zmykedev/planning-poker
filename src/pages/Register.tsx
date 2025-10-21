import { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePokerStore } from '../store';
import type { User } from '@/types/session';

export const Register = () => {
  const { addPlayer, setCurrentUser } = usePokerStore();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [role, setRole] = useState<User['role']>('voter');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;

    // Set current user in the store. The store's setCurrentUser already
    // adds the player to players when role === 'voter'. For spectators,
    // añadimos explícitamente para que también se vean en Main.
    setCurrentUser(name, role);
    if (role === 'spectator') {
      addPlayer(name);
    }

    setNewPlayerName('');
    navigate('/main');
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-md bg-white rounded-lg shadow-md p-6 space-y-4'
      >
        <h2 className='text-2xl font-bold text-center text-indigo-900'>Registro</h2>

        <label className='block'>
          <span className='text-sm text-gray-700'>Nombre</span>
          <input
            type='text'
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={onEnter}
            placeholder='Nombre del jugador'
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
        </label>

        <div>
          <span className='text-sm text-gray-700'>Rol</span>
          <div className='mt-2 flex gap-4'>
            <label
              className={`px-3 py-2 rounded-lg border ${
                role === 'voter' ? 'bg-indigo-600 text-white' : ''
              }`}
            >
              <input
                type='radio'
                name='role'
                value='voter'
                checked={role === 'voter'}
                onChange={() => setRole('voter')}
                className='mr-2'
              />
              <span className='ml-2'>Votante</span>
            </label>
            <label
              className={`px-3 py-2 rounded-lg border ${
                role === 'spectator' ? 'bg-indigo-600 text-white' : ''
              }`}
            >
              <input
                type='radio'
                name='role'
                value='spectator'
                checked={role === 'spectator'}
                onChange={() => setRole('spectator')}
                className='mr-2'
              />
              <span className='ml-2'>Espectador</span>
            </label>
          </div>
        </div>

        <div className='flex justify-end'>
          <button
            type='submit'
            className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
};
