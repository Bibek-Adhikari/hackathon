import { useEffect, useState } from 'react';
import HeroIllustration from '../components/HeroIllustration';
import { api } from '../api';
import { LeaderboardEntry } from '../types';
import { ArrowRight, Upload, Download, Award } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [topSolvers, setTopSolvers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getLeaderboard()
      .then((data) => {
        if (mounted) {
          setTopSolvers(data.slice(0, 5));
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-10 border-b border-gray-200 pb-14">
        <div className="max-w-xl space-y-5">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
            Stuck with a coding problem?
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Share your broken project and get help from other developers, or solve problems and build your reputation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('share')}
              className="px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded"
            >
              Share Your Problem
            </button>
            <button
              onClick={() => onNavigate('solve')}
              className="px-5 py-2.5 bg-white text-gray-900 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors rounded"
            >
              Solve a Problem
            </button>
          </div>
        </div>

        <div className="w-full lg:w-auto flex justify-center">
          <HeroIllustration />
        </div>
      </section>

      {/* How it Works: 3 Simple Steps */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border border-gray-200 bg-white">
            <div className="flex items-center space-x-2 text-gray-900 font-semibold text-sm mb-1.5">
              <Upload className="w-4 h-4 text-gray-700" />
              <span>1. Post</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Upload your problem and broken project ZIP. Describe what broke and what you have already attempted.
            </p>
          </div>

          <div className="p-4 border border-gray-200 bg-white">
            <div className="flex items-center space-x-2 text-gray-900 font-semibold text-sm mb-1.5">
              <Download className="w-4 h-4 text-gray-700" />
              <span>2. Solve</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Download the reproducible project ZIP, fix the bug locally, and submit your fixed project as a reply.
            </p>
          </div>

          <div className="p-4 border border-gray-200 bg-white">
            <div className="flex items-center space-x-2 text-gray-900 font-semibold text-sm mb-1.5">
              <Award className="w-4 h-4 text-gray-700" />
              <span>3. Earn</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Get exactly 1 point on the global leaderboard when the original problem poster accepts your fix.
            </p>
          </div>
        </div>
      </section>

      {/* Compact Leaderboard Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="text-lg font-bold text-gray-900">
            Top Solvers
          </h2>
          <button
            onClick={() => onNavigate('leaderboard')}
            className="text-xs text-gray-600 hover:text-black flex items-center space-x-1 font-medium underline"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="border border-gray-200 bg-white overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-4 w-16">Rank</th>
                <th className="py-2.5 px-4">Developer</th>
                <th className="py-2.5 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    Loading top solvers...
                  </td>
                </tr>
              ) : topSolvers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    No scores recorded yet.
                  </td>
                </tr>
              ) : (
                topSolvers.map((solver) => (
                  <tr key={solver.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 font-mono text-gray-500">{solver.rank}</td>
                    <td className="py-2.5 px-4 font-medium text-gray-900">{solver.name}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-gray-900">
                      {solver.score} pts
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
