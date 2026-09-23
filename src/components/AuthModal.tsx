import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  demoUsers: User[];
  onQuickSwitch: (userId: string) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  demoUsers,
  onQuickSwitch,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(name, email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white border border-gray-400 w-full max-w-md p-6 shadow-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'login' ? 'Log In to CodeHelp' : 'Create an Account'}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            {mode === 'login'
              ? 'Enter your credentials to post problems and submit solutions.'
              : 'Sign up to start sharing broken projects and earning solver points.'}
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mb-5 p-3 bg-gray-50 border border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Quick Test Accounts (instant 1-click):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {demoUsers.slice(0, 4).map((du) => (
              <button
                key={du.id}
                type="button"
                onClick={() => {
                  onQuickSwitch(du.id);
                  onClose();
                }}
                className="text-xs px-2 py-1 bg-white border border-gray-300 hover:border-gray-500 rounded text-gray-800"
              >
                {du.name} ({du.score} pts)
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2 text-xs bg-red-50 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Developer"
                className="w-full text-xs px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full text-xs px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-black text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Register'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-200 text-center text-xs text-gray-600">
          {mode === 'login' ? (
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-black font-semibold underline"
              >
                Sign up
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-black font-semibold underline"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
