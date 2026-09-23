import { useState } from 'react';
import { User } from '../types';
import { Menu, X, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, params?: { problemId?: string }) => void;
  user: User | null;
  demoUsers: User[];
  onLoginClick: () => void;
  onLogout: () => void;
  onSwitchUser: (userId: string) => void;
}

export default function Header({
  currentPage,
  onNavigate,
  user,
  demoUsers,
  onLoginClick,
  onLogout,
  onSwitchUser,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchDropdownOpen, setSwitchDropdownOpen] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleNav('home')}
            className="text-xl font-bold tracking-tight text-gray-900 flex items-center space-x-1.5 focus:outline-none"
          >
            <span className="font-mono text-base bg-gray-900 text-white px-1.5 py-0.5 rounded text-xs">&lt;/&gt;</span>
            <span>CodeHelp</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <button
              onClick={() => handleNav('share')}
              className={`hover:text-black transition-colors ${
                currentPage === 'share' ? 'text-black font-semibold' : 'text-gray-600'
              }`}
            >
              Share Your Problem
            </button>
            <button
              onClick={() => handleNav('solve')}
              className={`hover:text-black transition-colors ${
                currentPage === 'solve' ? 'text-black font-semibold' : 'text-gray-600'
              }`}
            >
              Solve a Problem
            </button>
            <button
              onClick={() => handleNav('leaderboard')}
              className={`hover:text-black transition-colors ${
                currentPage === 'leaderboard' ? 'text-black font-semibold' : 'text-gray-600'
              }`}
            >
              Leaderboard
            </button>
          </nav>
        </div>

        {/* Right side Auth & Switcher */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3 text-sm">
              <div className="relative">
                <button
                  onClick={() => setSwitchDropdownOpen(!switchDropdownOpen)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 font-mono"
                  title="Switch developer account for testing poster vs solver flows"
                >
                  <span className="font-sans font-medium text-gray-900">{user.name}</span>
                  <span className="text-gray-500">({user.score} pts)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {switchDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-300 shadow-md rounded py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-gray-200 text-gray-500 font-sans">
                      Test as different developer:
                    </div>
                    {demoUsers.map((du) => (
                      <button
                        key={du.id}
                        onClick={() => {
                          onSwitchUser(du.id);
                          setSwitchDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between"
                      >
                        <div className="font-sans">
                          <span className="font-medium text-gray-900">{du.name}</span>
                          <span className="text-gray-500 ml-1.5">({du.score} pts)</span>
                        </div>
                        {user.id === du.id && <Check className="w-3.5 h-3.5 text-gray-800" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-black hover:underline text-xs"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={onLoginClick}
                className="text-sm font-medium text-gray-700 hover:text-black px-3 py-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                Log In / Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-gray-700 hover:text-black border border-gray-300 rounded"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 py-3 bg-gray-50 space-y-2 text-sm">
          <button
            onClick={() => handleNav('home')}
            className="block w-full text-left py-1.5 text-gray-800 font-medium"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('share')}
            className="block w-full text-left py-1.5 text-gray-800 font-medium"
          >
            Share Your Problem
          </button>
          <button
            onClick={() => handleNav('solve')}
            className="block w-full text-left py-1.5 text-gray-800 font-medium"
          >
            Solve a Problem
          </button>
          <button
            onClick={() => handleNav('leaderboard')}
            className="block w-full text-left py-1.5 text-gray-800 font-medium"
          >
            Leaderboard
          </button>

          <div className="pt-2 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">
                  Signed in as <strong className="text-gray-900">{user.name}</strong> ({user.score} pts)
                </div>
                <div className="text-xs text-gray-500 font-medium">Quick switch developer:</div>
                <div className="flex flex-wrap gap-1">
                  {demoUsers.map((du) => (
                    <button
                      key={du.id}
                      onClick={() => {
                        onSwitchUser(du.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`text-xs px-2 py-1 border rounded ${
                        user.id === du.id ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-300'
                      }`}
                    >
                      {du.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block text-xs text-red-600 underline pt-1"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 bg-black text-white text-xs font-medium rounded"
              >
                Log In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
