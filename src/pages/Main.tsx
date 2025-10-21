import { usePokerStore } from '../store';
import { useState } from 'react';

export default function Main() {
  const [newPlayerName, setNewPlayerName] = useState('');
  // Store de Zustand

  const CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '?'];

  const { players, votes, revealed, addPlayer, removePlayer, vote, revealVotes, reset } =
    usePokerStore();

  console.log('Current players:', players);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const allVoted = players.length > 0 && players.every((p) => votes[p.id]);

  const getAverage = () => {
    const numericVotes = Object.values(votes)
      .filter((v) => v !== '?')
      .map(Number);
    if (numericVotes.length === 0) return 'N/A';
    const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    return avg.toFixed(1);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-4xl font-bold text-center text-indigo-900 mb-8'>Planning Poker</h1>

        {/* Agregar jugador */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
              placeholder='Nombre del jugador'
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
            <button
              onClick={handleAddPlayer}
              className='px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de jugadores */}
        {players.length > 0 && (
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800'>Jugadores</h2>
            <div className='space-y-2'>
              {players.map((player) => (
                <div
                  key={player.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <span className='font-medium text-gray-800'>{player.name}</span>
                    {votes[player.id] && (
                      <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
                        {revealed ? votes[player.id] : '✓ Votó'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className='text-red-500 hover:text-red-700'
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cartas para votar */}
        {players.length > 0 && (
          <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800'>Selecciona tu carta</h2>

            {players.map((player) => (
              <div key={player.id} className='mb-6'>
                <h3 className='font-medium text-gray-700 mb-3'>{player.name}</h3>
                <div className='grid grid-cols-5 gap-3 sm:grid-cols-9'>
                  {CARDS.map((card) => (
                    <button
                      key={card}
                      onClick={() => vote(player.id, card)}
                      disabled={revealed}
                      className={`aspect-[2/3] rounded-lg font-bold text-xl transition transform hover:scale-105 ${
                        votes[player.id] === card
                          ? 'bg-indigo-600 text-white shadow-lg scale-105'
                          : 'bg-white border-2 border-indigo-300 text-indigo-600 hover:border-indigo-500'
                      } ${revealed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {card}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controles */}
        {players.length > 0 && (
          <div className='flex gap-4 justify-center'>
            <button
              onClick={revealVotes}
              disabled={!allVoted || revealed}
              className={`px-8 py-3 rounded-lg font-semibold transition ${
                allVoted && !revealed
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Revelar Votos
            </button>
            <button
              onClick={reset}
              className='px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition'
            >
              Nueva Ronda
            </button>
          </div>
        )}

        {/* Resultados */}
        {revealed && (
          <div className='mt-6 bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-2xl font-semibold mb-4 text-center text-gray-800'>Resultados</h2>
            <div className='text-center'>
              <p className='text-lg text-gray-600'>
                Promedio: <span className='text-3xl font-bold text-indigo-600'>{getAverage()}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
