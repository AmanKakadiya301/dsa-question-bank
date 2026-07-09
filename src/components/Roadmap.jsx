import { useState, useMemo } from 'react';
import ProblemTable from './ProblemTable.jsx';
import ConfettiEffect from './ConfettiEffect.jsx';
import FilterBar from './FilterBar.jsx';

function PatternAccordion({
  pattern,
  solved,
  bookmarks,
  notes,
  toggleSolved,
  toggleBookmark,
  openNoteModal,
  searchQuery,
  activePattern,
  setActivePattern
}) {
  const [userExpanded, setUserExpanded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const safeId = pattern.pattern.replace(/[^a-zA-Z0-9]/g, '_');
  const isTargeted = activePattern === safeId;

  // Expanded if: (1) Searching, OR (2) explicitly targeted by Sidebar, OR (3) User manually toggled it
  const expanded = searchQuery ? true : (isTargeted || userExpanded);

  // If we close this one while it was the activePattern from sidebar, we just unset it 
  const handleToggle = () => {
    if (isTargeted) setActivePattern(null);
    setUserExpanded(!expanded);
  };

  const totalProblems = pattern.problems.length;
  const solvedProblems = pattern.problems.filter(
    p => solved[`${pattern.pattern}::${p.title}`]
  ).length;
  const progressPct = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const isComplete = progressPct === 100 && totalProblems > 0;

  const filteredProblems = useMemo(() => {
    let result = pattern.problems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }
    if (filter === 'solved') {
      result = result.filter(p => solved[`${pattern.pattern}::${p.title}`]);
    } else if (filter === 'unsolved') {
      result = result.filter(p => !solved[`${pattern.pattern}::${p.title}`]);
    } else if (filter === 'bookmarked') {
      result = result.filter(p => bookmarks[`${pattern.pattern}::${p.title}`]);
    }
    if (difficultyFilter !== 'all') {
      result = result.filter(p => (p.difficulty || 'medium') === difficultyFilter);
    }
    return result;
  }, [pattern, solved, bookmarks, filter, difficultyFilter, searchQuery]);

  // Don't render empty patterns on search
  if (searchQuery && filteredProblems.length === 0) return null;

  return (
    <div id={safeId} className="mb-3">
      <ConfettiEffect trigger={isComplete && expanded ? pattern.pattern : null} />
      
      {/* Accordion Header */}
      <button 
        onClick={handleToggle}
        className="w-full text-left bg-[#0c0c10] hover:bg-white/[0.02] border border-white/[0.06] rounded-xl transition-all duration-200 relative overflow-hidden group"
      >
        {isComplete && (
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/[0.06] to-transparent pointer-events-none" />
        )}
        <div className="p-3 sm:p-4 flex items-center gap-3">
          {/* Chevron */}
          <div className="text-silver-600 group-hover:text-silver-400 transition-all duration-300 flex-shrink-0" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Title + Progress inline */}
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <h2 className="font-display text-sm sm:text-base font-bold tracking-wider text-white flex items-center gap-2 flex-shrink-0">
              {pattern.pattern}
              {isComplete && <span className="sparkle-icon text-xs">✨</span>}
            </h2>
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: isComplete ? 'linear-gradient(90deg, #d4af37, #fdf5e6)' : 'linear-gradient(90deg, #b8941f, #d4af37)',
                  }}
                />
              </div>
              <span className={`text-xs font-mono whitespace-nowrap ${isComplete ? 'gold-text font-bold' : 'text-silver-500'}`}>
                {solvedProblems}/{totalProblems}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-1 border border-white/[0.04] bg-[#08080b] rounded-xl overflow-hidden animate-fade-in">
          <div className="p-2 sm:p-3 border-b border-white/[0.04] bg-black/30 flex flex-wrap items-center justify-between gap-2">
            <FilterBar
              filter={filter}
              setFilter={setFilter}
              difficultyFilter={difficultyFilter}
              setDifficultyFilter={setDifficultyFilter}
            />
          </div>
          <ProblemTable
            pattern={pattern.pattern}
            problems={filteredProblems}
            solved={solved}
            bookmarks={bookmarks}
            notes={notes}
            toggleSolved={toggleSolved}
            toggleBookmark={toggleBookmark}
            openNoteModal={openNoteModal}
          />
        </div>
      )}
    </div>
  );
}

export default function Roadmap({
  patterns,
  totalProblems,
  solvedCount,
  solved,
  bookmarks,
  notes,
  streak,
  dailyGoal,
  todaySolved,
  setDailyGoal,
  levelInfo,
  toggleSolved,
  toggleBookmark,
  saveNote,
  searchQuery,
  openNoteModal,
  activePattern,
  setActivePattern
}) {

  const progressPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  // Breakdown diffs
  const diffStats = { easy: {s:0, t:0}, medium: {s:0, t:0}, hard: {s:0, t:0} };
  patterns.forEach(p => p.problems.forEach(prob => {
    const diff = prob.difficulty || 'medium';
    diffStats[diff].t++;
    if (solved[`${p.pattern}::${prob.title}`]) diffStats[diff].s++;
  }));

  return (
    <div className="w-full">
      
      {/* DASHBOARD SUMMARY — full width, no centering */}
      <section id="dashboard-top" className="mb-6 p-4 sm:p-5 lg:p-6 glass-card rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-radial from-gold-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Progress info */}
          <div className="flex-1 min-w-0 z-10">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-wider gold-text">Roadmap Summary</h2>
              <div className="text-lg">{levelInfo?.icon}</div>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl sm:text-3xl font-display font-black text-white">{progressPct}%</span>
              <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-silver-500">Overall Progress</span>
            </div>
            
            {/* Multi-color progress bar */}
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden flex border border-white/[0.05]">
              <div style={{ width: `${totalProblems > 0 ? (diffStats.easy.s/totalProblems)*100 : 0}%` }} className="h-full bg-green-500/80 transition-all duration-700" />
              <div style={{ width: `${totalProblems > 0 ? (diffStats.medium.s/totalProblems)*100 : 0}%` }} className="h-full bg-gold-400 transition-all duration-700" />
              <div style={{ width: `${totalProblems > 0 ? (diffStats.hard.s/totalProblems)*100 : 0}%` }} className="h-full bg-red-500/80 transition-all duration-700" />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-[11px] sm:text-xs font-mono font-medium">
              <span className="text-green-400">Easy {diffStats.easy.s}/{diffStats.easy.t}</span>
              <span className="text-gold-500">Med {diffStats.medium.s}/{diffStats.medium.t}</span>
              <span className="text-red-400">Hard {diffStats.hard.s}/{diffStats.hard.t}</span>
            </div>
          </div>

          {/* Right: XP + Streak widgets */}
          <div className="flex gap-3 z-10 flex-shrink-0">
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center min-w-[90px] sm:min-w-[110px]">
              <span className="text-xl sm:text-2xl font-bold gold-text-shimmer">{levelInfo?.xp}</span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] font-mono text-silver-600 mt-1">Total XP</span>
              <span className="text-[9px] sm:text-[10px] text-silver-400 mt-1 font-display tracking-widest">{levelInfo?.title}</span>
            </div>
            
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center min-w-[90px] sm:min-w-[110px]">
              <div className="flex gap-1.5 items-center">
                <span className="text-base sm:text-lg">{streak.count > 0 ? '🔥' : '❄️'}</span>
                <span className="text-xl sm:text-2xl font-bold text-white">{streak.count}</span>
              </div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] font-mono text-silver-600 mt-1">Day Streak</span>
              <div className="text-[9px] sm:text-[10px] mt-2 flex items-center gap-1 text-silver-500">
                Today: <span className={todaySolved >= dailyGoal ? "text-gold-500" : "text-white"}>{todaySolved}/{dailyGoal}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PATTERN ACCORDION LIST — full width */}
      <section className="w-full pb-20">
        {patterns.map(pattern => (
          <PatternAccordion
            key={pattern.pattern}
            pattern={pattern}
            solved={solved}
            bookmarks={bookmarks}
            notes={notes}
            toggleSolved={toggleSolved}
            toggleBookmark={toggleBookmark}
            openNoteModal={openNoteModal}
            searchQuery={searchQuery}
            activePattern={activePattern}
            setActivePattern={setActivePattern}
          />
        ))}

        {!searchQuery && patterns.length === 0 && (
          <div className="text-center py-20 text-silver-600">
            <p className="text-sm tracking-wide">No patterns loaded.</p>
          </div>
        )}
      </section>
    </div>
  );
}
