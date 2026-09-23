import { useEffect, useState } from 'react';
import { api } from '../api';
import { Problem } from '../types';
import { Plus, CheckCircle2 } from 'lucide-react';

interface OpenProblemsPageProps {
  onNavigate: (page: string, params?: { problemId?: string }) => void;
}

export default function OpenProblemsPage({ onNavigate }: OpenProblemsPageProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'open' | 'all'>('open');

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProblems(filter === 'open' ? 'open' : undefined);
      setProblems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [filter]);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Open Problems
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Browse unresolved help requests, download the project code, and submit a working solution.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Simple Tab Toggle */}
          <div className="flex border border-gray-300 rounded text-xs overflow-hidden">
            <button
              onClick={() => setFilter('open')}
              className={`px-3 py-1.5 font-medium ${
                filter === 'open' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Open Only
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 font-medium ${
                filter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Problems
            </button>
          </div>

          <button
            onClick={() => onNavigate('share')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-gray-800 rounded"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share a Problem</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-xs text-gray-500">
          Loading problems...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && problems.length === 0 && (
        <div className="border border-gray-200 bg-white p-12 text-center space-y-4">
          <p className="text-gray-700 text-sm font-medium">
            No open problems yet.
          </p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Be the first developer to post a broken coding project and get help from the community.
          </p>
          <div>
            <button
              onClick={() => onNavigate('share')}
              className="px-4 py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 rounded"
            >
              Share a Problem
            </button>
          </div>
        </div>
      )}

      {/* Problem List */}
      {!loading && problems.length > 0 && (
        <div className="divide-y divide-gray-200 border border-gray-200 bg-white">
          {problems.map((problem) => (
            <div key={problem.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-semibold text-gray-900 leading-snug">
                      {problem.title}
                    </h2>
                    {problem.status === 'solved' ? (
                      <span className="inline-flex items-center text-[10px] uppercase font-mono px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-300 rounded font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-green-700 mr-1" />
                        Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] uppercase font-mono px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-300 rounded font-semibold">
                        Open
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {problem.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 pt-1">
                    <span>
                      Posted by <strong className="text-gray-800">{problem.posterName}</strong>
                    </span>
                    <span>•</span>
                    <span>{formatDate(problem.createdAt)}</span>
                    <span>•</span>
                    <span className="font-mono text-gray-600">{problem.originalZipName}</span>
                    {typeof problem.solutionsCount === 'number' && (
                      <>
                        <span>•</span>
                        <span>{problem.solutionsCount} {problem.solutionsCount === 1 ? 'solution' : 'solutions'} submitted</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pt-1 sm:pt-0">
                  <button
                    onClick={() => onNavigate('problem-detail', { problemId: problem.id })}
                    className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-900 text-xs font-medium hover:bg-gray-100 rounded"
                  >
                    View Problem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
