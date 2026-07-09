import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

const PATTERN_ICONS = {
  'Two Pointers': '⚡',
  'Fast & Slow Pointers': '🏹',
  'Sliding Window': '◈',
  "Kadane's / Subarray": '◆',
  'Prefix Sum': '∑',
  'Merge Intervals': '⟐',
  'Linked List Reversal': '⟳',
  'Monotonic Stack': '▣',
  'Hashing / Strings': '⌗',
  'Binary Search': '◎',
  'Heap / Priority Queue': '△',
  'Recursion Basics': '∞',
  'Backtracking': '⬡',
  'Trees': '⚘',
  'Graphs': '⬢',
};

export default function Sidebar({ patterns, solved, sidebarOpen, setSidebarOpen, activePattern, setActivePattern, user }) {
  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (window.innerWidth < 1024 && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  function getPatternProgress(pattern) {
    const total = pattern.problems.length;
    const done = pattern.problems.filter(
      p => solved[`${pattern.pattern}::${p.title}`]
    ).length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  function scrollToSection(id) {
    if (setActivePattern) setActivePattern(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  const handleLogout = async () => {
    await signOut(auth);
  };

  // User display info
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Adventurer';
  const displayEmail = user?.email || '';
  const avatarUrl = user?.photoURL;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed left, full height, independent scroll */}
      <aside
        className={`fixed left-0 top-0 bottom-0 h-screen w-[260px] z-[100] transition-transform duration-300 ease-out flex flex-col custom-scrollbar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          background: '#0b0b0f',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo header */}
        <div className="flex flex-col pt-6 pb-2 px-5 sticky top-0 z-10" style={{ background: 'linear-gradient(180deg, rgba(11,11,15,1), rgba(11,11,15,0.95) 80%, transparent)' }}>
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-2xl sparkle-icon">✨</span>
            </div>
            <h1 className="font-display text-lg font-bold tracking-widest gold-text">
              DSA BANK
            </h1>
            <button 
              className="ml-auto p-1.5 lg:hidden text-silver-600 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Nav items — scrollable */}
        <nav className="flex-1 flex flex-col py-4 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <button
            onClick={() => scrollToSection('dashboard-top')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-silver-400 hover:text-white hover:bg-white/[0.03]"
          >
            <span className="text-sm flex-shrink-0 w-5 text-center font-mono opacity-80">⊞</span>
            <span className="text-[13px] font-medium tracking-wide">Progress Summary</span>
          </button>

          <div className="px-3 pt-6 pb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-silver-700 font-bold">Algorithms</span>
          </div>

          {patterns.map((pattern, idx) => {
            const { done, total, pct } = getPatternProgress(pattern);
            const icon = PATTERN_ICONS[pattern.pattern] || '◇';
            const safeId = pattern.pattern.replace(/[^a-zA-Z0-9]/g, '_');
            const isActive = activePattern === safeId;

            return (
              <button
                key={idx}
                onClick={() => scrollToSection(safeId)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'text-white bg-white/[0.05]' 
                    : 'text-silver-400 hover:text-silver-200 hover:bg-white/[0.03]'}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full" style={{ background: 'linear-gradient(180deg, #d4af37, #b8941f)', boxShadow: '0 0 8px rgba(212,175,55,0.4)' }} />
                )}
                <span className={`text-sm flex-shrink-0 w-5 text-center font-mono transition-colors duration-300 
                  ${isActive ? 'text-gold-500 opacity-100' : 'opacity-60 group-hover:opacity-100 group-hover:text-gold-500'}`}>
                  {icon}
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[12px] font-medium tracking-wide truncate">{pattern.pattern}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-[2px] bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? 'linear-gradient(90deg, #d4af37, #fdf5e6)'
                            : 'linear-gradient(90deg, rgba(212,175,55,0.4), rgba(212,175,55,0.1))',
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-silver-600 font-mono tabular-nums">{done}/{total}</span>
                  </div>
                </div>
                {pct === 100 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sparkle-icon shadow-sm">✨</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── User Profile + Logout ── */}
        <div className="sticky bottom-0 z-10 px-3 pb-4 pt-3" style={{ background: 'linear-gradient(0deg, rgba(11,11,15,1) 60%, transparent)' }}>
          <div className="border-t border-white/[0.06] pt-3">
            <div className="flex items-center gap-3 px-2">
              {/* Avatar */}
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="w-8 h-8 rounded-full border border-gold-500/30 flex-shrink-0 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-obsidian"
                  style={{ background: 'linear-gradient(135deg, #d4af37, #fdf5e6)' }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Name + Email */}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-silver-200 truncate">{displayName}</div>
                {displayEmail && (
                  <div className="text-[10px] text-silver-600 truncate">{displayEmail}</div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-silver-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 flex-shrink-0"
                title="Sign Out"
                id="sidebar-logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
