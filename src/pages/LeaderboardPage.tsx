import { useEffect, useState } from 'react';
import { api } from '../api';
import { LeaderboardEntry } from '../types';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getLeaderboard()
      .then((data) => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load leaderboard');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Leaderboard
        </h1>
        <p className="text-xs text-gray-600 mt-1">
          Developers ranked by accepted solutions. Earn +1 point each time an author accepts your fix.
        </p>
      </div>

      {loading && (
        <div className="py-12 text-center text-xs text-gray-500">
          Loading leaderboard...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="border border-gray-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-20">Rank</th>
                <th className="py-3 px-4">Developer</th>
                <th className="py-3 px-4 text-center">Accepted Solutions</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No developers ranked yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((dev) => (
                  <tr key={dev.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-medium text-gray-500">
                      {dev.rank}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {dev.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-gray-600">
                      {dev.acceptedCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {dev.score}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-[11px] text-gray-500 p-3 bg-gray-50 border border-gray-200">
        Scoring rule: Solvers receive +1 point when their submitted fix is accepted by the original problem poster. Ties are broken by accepted solution count, followed by registration date.
      </div>
    </div>
  );
}
