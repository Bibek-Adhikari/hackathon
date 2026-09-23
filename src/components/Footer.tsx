export default function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 py-8 text-xs text-gray-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-900 font-mono text-sm">&lt;/&gt; CodeHelp</span>
          <span className="text-gray-400">|</span>
          <span>Developer-to-developer peer debugging platform</span>
        </div>

        <div className="flex items-center space-x-6 text-gray-600">
          <button onClick={() => onNavigate('home')} className="hover:text-black">
            Home
          </button>
          <button onClick={() => onNavigate('share')} className="hover:text-black">
            Share Problem
          </button>
          <button onClick={() => onNavigate('solve')} className="hover:text-black">
            Solve Problem
          </button>
          <button onClick={() => onNavigate('leaderboard')} className="hover:text-black">
            Leaderboard
          </button>
        </div>
      </div>
    </footer>
  );
}
