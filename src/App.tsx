import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import ShareProblemPage from './pages/ShareProblemPage';
import OpenProblemsPage from './pages/OpenProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { api } from './api';
import { User } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync state with URL Hash
  const parseHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash || hash === '') {
      setCurrentPage('home');
    } else if (hash.startsWith('problem/')) {
      const id = hash.replace('problem/', '');
      setSelectedProblemId(id);
      setCurrentPage('problem-detail');
    } else if (hash === 'share') {
      setCurrentPage('share');
    } else if (hash === 'solve') {
      setCurrentPage('solve');
    } else if (hash === 'leaderboard') {
      setCurrentPage('leaderboard');
    } else {
      setCurrentPage('home');
    }
  };

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Initialize session and demo users
  useEffect(() => {
    api.getMe().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });

    api.getDemoUsers().then((users) => {
      setDemoUsers(users);
      // If no user is logged in, default to Bibek (poster of first problem) for easy evaluation
      api.getMe().then((me) => {
        if (!me && users.length > 0) {
          // Keep unauthenticated initially or let user test
        }
      });
    });
  }, []);

  const navigateTo = (page: string, params?: { problemId?: string }) => {
    if (page === 'home') {
      window.location.hash = '#/';
      setCurrentPage('home');
    } else if (page === 'share') {
      window.location.hash = '#/share';
      setCurrentPage('share');
    } else if (page === 'solve') {
      window.location.hash = '#/solve';
      setCurrentPage('solve');
    } else if (page === 'leaderboard') {
      window.location.hash = '#/leaderboard';
      setCurrentPage('leaderboard');
    } else if (page === 'problem-detail' && params?.problemId) {
      window.location.hash = `#/problem/${params.problemId}`;
      setSelectedProblemId(params.problemId);
      setCurrentPage('problem-detail');
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const handleQuickSwitch = async (userId: string) => {
    try {
      const res = await api.switchDemo(userId);
      setCurrentUser(res.user);
      // Refresh demo users scores
      const refreshed = await api.getDemoUsers();
      setDemoUsers(refreshed);
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const handleUserUpdate = (user: User) => {
    setCurrentUser(user);
    api.getDemoUsers().then(setDemoUsers);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-gray-200">
      {/* Top Header */}
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        user={currentUser}
        demoUsers={demoUsers}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchUser={handleQuickSwitch}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
        {currentPage === 'share' && (
          <ShareProblemPage
            user={currentUser}
            onNavigate={navigateTo}
            onUserUpdate={handleUserUpdate}
          />
        )}
        {currentPage === 'solve' && <OpenProblemsPage onNavigate={navigateTo} />}
        {currentPage === 'problem-detail' && (
          <ProblemDetailPage
            problemId={selectedProblemId}
            user={currentUser}
            onNavigate={navigateTo}
            onUserUpdate={handleUserUpdate}
          />
        )}
        {currentPage === 'leaderboard' && <LeaderboardPage />}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleUserUpdate}
        demoUsers={demoUsers}
        onQuickSwitch={handleQuickSwitch}
      />
    </div>
  );
}
