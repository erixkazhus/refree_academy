import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { FibaHalfCourtSvg, RefereeWhistleIcon, ShotClockIcon } from '../components/CourtMotifs';
import { QuestionCard } from '../components/QuestionCard';
import { VideoCasePlayer } from '../components/VideoCasePlayer';
import { useAuth } from '../context/AuthContext';
import { CategoryCount, PublicQuestion } from '../types';

const QUIZ_SECTIONS = [
  { id: 'All', label: 'All (Mixed)', subtitle: 'Rules 1–8 & Appendices' },
  { id: 'Rule 1 · The Game', label: 'Rule 1 · The Game', subtitle: 'Art. 1' },
  { id: 'Rule 2 · Court & Equipment', label: 'Rule 2 · Court & Equipment', subtitle: 'Art. 2–3' },
  { id: 'Rule 3 · Teams', label: 'Rule 3 · Teams', subtitle: 'Art. 4–7' },
  { id: 'Rule 4 · Playing Regulations', label: 'Rule 4 · Playing Regulations', subtitle: 'Art. 8–21' },
  { id: 'Rule 5 · Violations', label: 'Rule 5 · Violations', subtitle: 'Art. 22–31' },
  { id: 'Rule 6 · Fouls', label: 'Rule 6 · Fouls', subtitle: 'Art. 32–40' },
  { id: 'Rule 7 · General Provisions', label: 'Rule 7 · General Provisions', subtitle: 'Art. 41–45' },
  { id: 'Rule 8 · Officials', label: 'Rule 8 · Officials', subtitle: 'Art. 46–51' },
  { id: 'Appendices A–F', label: 'Appendices A–F', subtitle: 'Signals, Scoresheet & IRS' },
];

export const StudyPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [shuffleMode, setShuffleMode] = useState(true);
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());
  const [pageIndex, setPageIndex] = useState(0);
  const [jumpInput, setJumpInput] = useState('');

  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestionPage = async (opts: {
    cat: string;
    query: string;
    page: number;
    shuffle: boolean;
    seed: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPagedQuestions({
        category: opts.cat,
        search: opts.query,
        page: opts.page,
        size: 1,
        shuffle: opts.shuffle,
        seed: opts.seed,
      });
      setQuestions(data.items);
      setTotalElements(data.totalElements);
      setPageIndex(data.page);
      setCategoryCounts(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load practice questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionPage({
      cat: selectedCategory,
      query: appliedSearch,
      page: pageIndex,
      shuffle: shuffleMode,
      seed: shuffleSeed,
    });
  }, [selectedCategory, appliedSearch, pageIndex, shuffleMode, shuffleSeed]);

  const handleSelectSection = (catId: string) => {
    const defaultMixed = catId === 'All';
    setSelectedCategory(catId);
    setShuffleMode(defaultMixed);
    setShuffleSeed(Date.now());
    setPageIndex(0);
    setJumpInput('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPageIndex(0);
  };

  const handleReshuffle = () => {
    setShuffleMode(true);
    setShuffleSeed(Date.now());
    setPageIndex(0);
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim(), 10);
    if (!Number.isNaN(num) && num >= 1 && num <= totalElements) {
      setPageIndex(num - 1);
      setJumpInput('');
    }
  };

  const countForSection = (sectionId: string): number | null => {
    if (categoryCounts.length === 0) return null;
    if (sectionId === 'All') {
      return categoryCounts.reduce((acc, c) => acc + c.count, 0);
    }
    const found = categoryCounts.find((c) => c.category === sectionId);
    return found ? found.count : 0;
  };

  const activeQuestion = questions[0] ?? null;

  return (
    <main className="min-h-screen bg-[#f7f7f4] pb-20">
      {/* Arena Quiz Control Header */}
      <section className="relative overflow-hidden bg-[#26251e] text-white border-b border-[#3d3b31]">
        <FibaHalfCourtSvg
          className="hidden lg:block absolute right-0 top-0 w-[400px] h-[250px] opacity-25 pointer-events-none"
          strokeColor="rgba(247,247,244,0.22)"
        />
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-mono-clock uppercase tracking-widest text-[#f54e00] font-semibold m-0">
                <RefereeWhistleIcon size={14} />
                FIBA 2026 Rulebook Video Quiz · 1,864+ Official Clips
              </p>
              <h1 className="text-3xl font-medium tracking-tight text-white mt-1.5 m-0">
                Rulebook Quiz by Official Section
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user && (
                <div className="flex items-center gap-2.5 bg-[#1b1a15] px-4 py-2 rounded-full border border-[#3d3b31] text-xs font-mono-clock">
                  <ShotClockIcon />
                  <span className="text-[#cfcdc4]">Accuracy:</span>
                  <span className="font-semibold text-white">
                    {user.correctAttempts} / {user.totalAttempts}
                  </span>
                </div>
              )}
              <Link
                to="/rules"
                className="bg-white/10 text-white border border-white/25 rounded-full h-10 px-4 text-xs font-medium inline-flex items-center no-underline hover:bg-white hover:text-[#26251e] transition-colors"
              >
                Study Rulebook →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rulebook Study Guide Quiz Section Filter Bar */}
      <section className="bg-white border-b border-[#e6e5e0]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {QUIZ_SECTIONS.map((sec) => {
              const count = countForSection(sec.id);
              const isActive = selectedCategory === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSelectSection(sec.id)}
                  className={`filter-chip !py-2 !px-4 text-left flex items-center gap-2 ${
                    isActive ? 'filter-chip-active' : ''
                  }`}
                  title={sec.subtitle}
                >
                  <span>{sec.label}</span>
                  {count !== null && (
                    <span
                      className={`text-[11px] font-mono-clock px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#f7f7f4] text-[#5a5852]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search case, rule or keyword..."
              className="h-10 px-4 rounded-full bg-[#f7f7f4] border border-[#e6e5e0] focus:border-[#26251e] focus:bg-white focus:outline-none text-sm w-full lg:w-64"
            />
            <button type="submit" className="btn-dark !h-10 !px-5 !text-xs">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Side-by-Side Workspace */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 mt-8">
        {loading && !activeQuestion ? (
          <div className="bg-white border border-[#e6e5e0] rounded-xl p-12 text-center text-[#5a5852]">
            Loading FIBA video case...
          </div>
        ) : error ? (
          <div className="bg-white border border-[#cf2d56] rounded-xl p-8 text-center text-[#cf2d56]">{error}</div>
        ) : !activeQuestion ? (
          <div className="bg-white border border-[#e6e5e0] rounded-xl p-12 text-center">
            <h2 className="text-xl font-medium m-0 text-[#26251e]">
              No rulebook cases match this filter.
            </h2>
            <p className="text-sm text-[#5a5852] mt-2">
              Reset the search filter or select All (Mixed) to explore all official FIBA 2026 quiz cases.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setAppliedSearch('');
                handleSelectSection('All');
              }}
              className="btn-primary mt-4 !h-10 !px-6 !text-xs"
            >
              Show All (Mixed) Questions
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Case Header & Sequential / Mixed Navigation Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white border border-[#e6e5e0] rounded-xl p-5">
              <div>
                <p className="text-[11px] font-mono-clock uppercase tracking-widest text-[#f54e00] font-semibold m-0">
                  Side-by-Side IRS Replay &amp; Ruling · Question {pageIndex + 1} of{' '}
                  {totalElements.toLocaleString()}
                </p>
                <h2 className="text-2xl font-medium tracking-tight text-[#26251e] mt-1 m-0">
                  {activeQuestion.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={pageIndex <= 0 || loading}
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  className="btn-secondary !h-9 !px-4 !text-xs disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleReshuffle}
                  className={`filter-chip !py-1.5 !px-3.5 !text-xs ${
                    shuffleMode ? 'filter-chip-active' : ''
                  }`}
                  title="Shuffle questions in this section"
                >
                  ↻ {shuffleMode ? 'Mixed / Reshuffle' : 'Mix Questions'}
                </button>

                {selectedCategory !== 'All' && shuffleMode && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setShuffleMode(false);
                      setPageIndex(0);
                    }}
                    className="btn-secondary !h-9 !px-3 !text-xs"
                  >
                    In Order
                  </button>
                )}

                <form onSubmit={handleJump} className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, totalElements)}
                    value={jumpInput}
                    onChange={(e) => setJumpInput(e.target.value)}
                    placeholder={`#1–${totalElements}`}
                    className="h-9 w-24 px-2.5 rounded-full bg-[#f7f7f4] border border-[#cfcdc4] text-xs font-mono-clock focus:outline-none focus:border-[#26251e]"
                  />
                  <button type="submit" className="btn-secondary !h-9 !px-3 !text-xs">
                    Go
                  </button>
                </form>

                <button
                  type="button"
                  disabled={pageIndex >= totalElements - 1 || loading}
                  onClick={() => setPageIndex((p) => Math.min(totalElements - 1, p + 1))}
                  className="btn-primary !h-9 !px-5 !text-xs disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6">
                <VideoCasePlayer
                  key={`${activeQuestion.id}-${activeQuestion.videoUrl || 'novid'}`}
                  videoUrl={activeQuestion.videoUrl}
                  ruleReference={activeQuestion.ruleReference}
                  category={activeQuestion.category}
                />
              </div>

              <div className="lg:col-span-6">
                <QuestionCard
                  key={activeQuestion.id}
                  question={activeQuestion}
                  onAnswered={() => {
                    if (user) refreshUser();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
