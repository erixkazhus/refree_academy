import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { FibaHalfCourtSvg, RefereeWhistleIcon } from '../components/CourtMotifs';
import { RefereeSignal, RuleArticle, RuleSection } from '../types';

type ArticleTab = 'rules' | 'examples' | 'signals';

export const RulebookPage: React.FC = () => {
  const [sections, setSections] = useState<RuleSection[]>([]);
  const [signals, setSignals] = useState<RefereeSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, ArticleTab>>({});
  const [selectedSignal, setSelectedSignal] = useState<RefereeSignal | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const bundle = await api.getRulebook();
        if (active) {
          setSections(bundle.sections);
          setSignals(bundle.signals);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load FIBA Rulebook from database.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const signalsByNumber = useMemo(() => {
    const map: Record<number, RefereeSignal> = {};
    for (const s of signals) {
      map[s.number] = s;
    }
    return map;
  }, [signals]);

  const signalGroups = useMemo(
    () => Array.from(new Set(signals.map((s) => s.category))),
    [signals]
  );

  const normalizedQuery = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) {
      return sections;
    }

    return sections.map((sec) => {
      const sectionMatches =
        sec.ruleNumber.toLowerCase().includes(normalizedQuery) ||
        sec.title.toLowerCase().includes(normalizedQuery);

      const matchingArticles = sec.articles.filter((art) => {
        if (sectionMatches) return true;
        if (
          art.articleNumber.toLowerCase().includes(normalizedQuery) ||
          art.title.toLowerCase().includes(normalizedQuery) ||
          (art.subtitle && art.subtitle.toLowerCase().includes(normalizedQuery))
        ) {
          return true;
        }
        const subMatches = art.subPoints.some(
          (sp) =>
            sp.code.toLowerCase().includes(normalizedQuery) ||
            sp.heading.toLowerCase().includes(normalizedQuery) ||
            sp.body.toLowerCase().includes(normalizedQuery) ||
            (sp.bullets && sp.bullets.some((b) => b.toLowerCase().includes(normalizedQuery)))
        );
        if (subMatches) return true;
        const exMatches = art.examples?.some(
          (ex) =>
            ex.code.toLowerCase().includes(normalizedQuery) ||
            ex.text.toLowerCase().includes(normalizedQuery) ||
            (ex.interpretation && ex.interpretation.toLowerCase().includes(normalizedQuery))
        );
        if (exMatches) return true;
        const sigMatches = art.signalNumbers?.some((num) => {
          const sig = signalsByNumber[num];
          return (
            sig &&
            (sig.name.toLowerCase().includes(normalizedQuery) ||
              sig.action.toLowerCase().includes(normalizedQuery) ||
              String(sig.number) === normalizedQuery)
          );
        });
        return Boolean(sigMatches);
      });

      return { ...sec, articles: matchingArticles };
    }).filter((sec) => sec.articles.length > 0);
  }, [normalizedQuery, sections, signalsByNumber]);

  const toggleArticle = (articleId: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  const expandAllVisible = () => {
    const next: Record<string, boolean> = { ...expandedIds };
    filteredSections.forEach((sec) => {
      sec.articles.forEach((art) => {
        next[art.id] = true;
      });
    });
    setExpandedIds(next);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const isArticleOpen = (art: RuleArticle) => {
    if (normalizedQuery.length > 0) return true;
    return Boolean(expandedIds[art.id]);
  };

  const getActiveTab = (art: RuleArticle): ArticleTab => {
    const explicit = activeTabs[art.id];
    if (explicit) return explicit;

    if (normalizedQuery.length > 0) {
      const subMatch = art.subPoints.some(
        (sp) =>
          sp.code.toLowerCase().includes(normalizedQuery) ||
          sp.heading.toLowerCase().includes(normalizedQuery) ||
          sp.body.toLowerCase().includes(normalizedQuery) ||
          sp.bullets?.some((b) => b.toLowerCase().includes(normalizedQuery))
      );
      if (subMatch) return 'rules';
      const exMatch = art.examples?.some(
        (ex) =>
          ex.code.toLowerCase().includes(normalizedQuery) ||
          ex.text.toLowerCase().includes(normalizedQuery) ||
          ex.interpretation?.toLowerCase().includes(normalizedQuery)
      );
      if (exMatch) return 'examples';
      if (art.signalNumbers && art.signalNumbers.length > 0) return 'signals';
    }

    return art.id === 'app-a' ? 'signals' : 'rules';
  };

  const setArticleTab = (articleId: string, tab: ArticleTab) => {
    setActiveTabs((prev) => ({ ...prev, [articleId]: tab }));
  };

  const jumpToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#26251e] text-white rounded-2xl border border-[#26251e] p-8 md:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <FibaHalfCourtSvg
          className="hidden lg:block absolute right-0 bottom-0 w-[420px] h-[280px] opacity-30 pointer-events-none"
          strokeColor="rgba(247,247,244,0.22)"
        />
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 bg-[#f54e00] text-white rounded-full px-3.5 py-1 text-[11px] font-mono-clock uppercase tracking-wider font-semibold mb-4">
            <RefereeWhistleIcon size={14} />
            2026 Official FIBA Basketball Rules &amp; OBRI (Valid 1 Oct 2026)
          </span>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight m-0 text-white">
            Official FIBA Rulebook Study Guide
          </h1>
          <p className="text-sm md:text-base text-[#e6e5e0] mt-3 mb-0 leading-relaxed">
            Structured across Rules 1–8 (Articles 1–51) and Appendices A–F. Open any article to switch cleanly between Official Rule Text, OBRI Examples &amp; Interpretations, and Official Referee Signals.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/study" className="btn-on-image no-underline">
            Take a Quiz →
          </Link>
          <Link
            to="/rulebook-pdfs"
            className="bg-white/10 text-white border border-white/30 rounded-full h-11 px-5 text-sm font-medium inline-flex items-center no-underline hover:bg-white hover:text-[#26251e] transition-colors"
          >
            Official FIBA PDFs ↓
          </Link>
        </div>
      </div>

      {/* Main Structured Grid: Sticky Outline Sidebar + Rule Sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-10 items-start">
        {/* Left Sticky Rulebook Outline */}
        <aside className="hidden lg:block lg:sticky lg:top-20 border border-[#e6e5e0] bg-white rounded-xl p-5">
          <div className="text-xs font-mono-clock font-semibold uppercase tracking-wider text-[#f54e00] pb-3 border-b border-[#e6e5e0]">
            Rulebook Contents
          </div>
          <nav aria-label="Rulebook Chapters" className="mt-3 space-y-1">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => jumpToSection(sec.id)}
                className="w-full text-left px-2.5 py-2 bg-transparent border-0 rounded-lg hover:bg-[#fafaf7] cursor-pointer transition-colors block"
              >
                <span className="block text-sm font-medium text-[#26251e] leading-snug">
                  {sec.title}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Primary Content */}
        <div className="min-w-0">
          {/* Search & Expand Controls */}
          <div className="pb-4 border-b border-[#e6e5e0] flex flex-wrap items-center justify-between gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles, sub-points, OBRI examples, or signals (e.g. Article 37, 38-3, signal)..."
              aria-label="Search rulebook articles, examples, and signals"
              className="h-10 w-full sm:w-[420px] px-4 bg-white border border-[#e6e5e0] rounded-full text-sm text-[#26251e] outline-none focus:border-[#f54e00]"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAllVisible}
                className="h-9 px-4 rounded-full border border-[#cfcdc4] bg-white text-xs font-medium text-[#26251e] hover:border-[#26251e] cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="h-9 px-4 rounded-full border border-[#cfcdc4] bg-white text-xs font-medium text-[#5a5852] hover:border-[#26251e] hover:text-[#26251e] cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Rule Sections */}
          <div className="mt-8 space-y-12">
            {loading ? (
              <div className="bg-white border border-[#e6e5e0] rounded-xl p-10 text-center text-sm text-[#5a5852]">
                Loading Official FIBA Rulebook &amp; OBRI from PostgreSQL...
              </div>
            ) : error ? (
              <div className="bg-white border border-[#cf2d56] rounded-xl p-8 text-center text-sm text-[#cf2d56]">
                {error}
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="bg-white border border-[#e6e5e0] rounded-xl p-10 text-center text-sm text-[#5a5852]">
                No rulebook articles, examples, or signals matched "{search}".
              </div>
            ) : (
              filteredSections.map((sec) => (
                <section key={sec.id} id={sec.id} className="scroll-mt-20">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b-2 border-[#26251e]">
                    <div>
                      <h2 className="text-2xl font-medium m-0 text-[#26251e]">
                        {sec.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono-clock font-medium text-[#807d72]">
                      {sec.articles.length} {sec.articles.length === 1 ? 'article' : 'articles'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {sec.articles.map((art) => {
                      const open = isArticleOpen(art);
                      const panelId = `${art.id}-panel`;
                      const tab = getActiveTab(art);
                      const signalsList = (art.signalNumbers ?? [])
                        .map((num) => signalsByNumber[num])
                        .filter((s): s is RefereeSignal => Boolean(s));
                      const examples = art.examples ?? [];
                      const statements = examples.filter((e) => e.kind === 'Statement');
                      const exampleCases = examples.filter((e) => e.kind === 'Example');

                      return (
                        <div
                          key={art.id}
                          className={`border rounded-xl overflow-hidden transition-colors ${
                            open
                              ? 'border-[#26251e] bg-white'
                              : 'border-[#e6e5e0] bg-white hover:border-[#cfcdc4]'
                          }`}
                        >
                          <button
                            type="button"
                            aria-expanded={open}
                            aria-controls={panelId}
                            onClick={() => toggleArticle(art.id)}
                            className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left bg-transparent border-0 cursor-pointer"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="inline-block bg-[#26251e] text-white rounded-full px-3 py-0.5 text-xs font-mono-clock font-medium shrink-0">
                                  {art.articleNumber}
                                </span>
                                <h3 className="text-base md:text-lg font-medium text-[#26251e] m-0">
                                  {art.title}
                                </h3>
                              </div>
                              {art.subtitle && (
                                <p className="text-xs text-[#5a5852] m-0 mt-1.5">
                                  {art.subtitle}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="hidden sm:flex items-center gap-1.5">
                                <span className="bg-[#f7f7f4] text-[#5a5852] rounded-full px-2.5 py-0.5 text-xs font-medium">
                                  {art.subPoints.length}{' '}
                                  {art.subPoints.length === 1 ? 'rule' : 'rules'}
                                </span>
                                {examples.length > 0 && (
                                  <span className="bg-[#f7f7f4] text-[#5a5852] rounded-full px-2.5 py-0.5 text-xs font-medium">
                                    {examples.length}{' '}
                                    {examples.length === 1 ? 'example' : 'examples'}
                                  </span>
                                )}
                                {signalsList.length > 0 && (
                                  <span className="bg-[#dfa88f]/35 text-[#26251e] rounded-full px-2.5 py-0.5 text-xs font-medium">
                                    {signalsList.length}{' '}
                                    {signalsList.length === 1 ? 'signal' : 'signals'}
                                  </span>
                                )}
                              </div>
                              <svg
                                className={`w-5 h-5 text-[#26251e] transition-transform duration-150 ${
                                  open ? 'rotate-180' : ''
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          </button>

                          {open && (
                            <div id={panelId} className="border-t border-[#e6e5e0] bg-white">
                              {/* Structured Article Inner Tabs */}
                              <div className="px-5 py-3 bg-[#fafaf7] border-b border-[#e6e5e0] flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2" role="tablist">
                                  <button
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === 'rules'}
                                    onClick={() => setArticleTab(art.id, 'rules')}
                                    className={`h-8 px-3.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                                      tab === 'rules'
                                        ? 'bg-[#f54e00] text-white border-[#f54e00]'
                                        : 'bg-white text-[#26251e] border-[#cfcdc4] hover:border-[#26251e]'
                                    }`}
                                  >
                                    Official Rule Text ({art.subPoints.length})
                                  </button>

                                  {examples.length > 0 && (
                                    <button
                                      type="button"
                                      role="tab"
                                      aria-selected={tab === 'examples'}
                                      onClick={() => setArticleTab(art.id, 'examples')}
                                      className={`h-8 px-3.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                                        tab === 'examples'
                                          ? 'bg-[#f54e00] text-white border-[#f54e00]'
                                          : 'bg-white text-[#26251e] border-[#cfcdc4] hover:border-[#26251e]'
                                      }`}
                                    >
                                      Examples &amp; OBRI ({examples.length})
                                    </button>
                                  )}

                                  {signalsList.length > 0 && (
                                    <button
                                      type="button"
                                      role="tab"
                                      aria-selected={tab === 'signals'}
                                      onClick={() => setArticleTab(art.id, 'signals')}
                                      className={`h-8 px-3.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                                        tab === 'signals'
                                          ? 'bg-[#f54e00] text-white border-[#f54e00]'
                                          : 'bg-white text-[#26251e] border-[#cfcdc4] hover:border-[#26251e]'
                                      }`}
                                    >
                                      Referee Signals ({signalsList.length})
                                    </button>
                                  )}
                                </div>

                                {signalsList.length > 0 && tab !== 'signals' && art.id !== 'app-a' && (
                                  <button
                                    type="button"
                                    onClick={() => setArticleTab(art.id, 'signals')}
                                    className="text-xs font-medium text-[#f54e00] hover:underline bg-transparent border-0 cursor-pointer p-0"
                                  >
                                    View Signal #{signalsList.map((s) => s.number).slice(0, 3).join(', #')}
                                    {signalsList.length > 3 ? ` (+${signalsList.length - 3})` : ''} →
                                  </button>
                                )}
                              </div>

                              {/* TAB 1: Official Rule Sub-Points (clean clause ledger + inline signal strip) */}
                              {tab === 'rules' && (
                                <div className="p-5 space-y-6">
                                  <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5]">
                                    {art.subPoints.map((sp) => (
                                      <div
                                        key={sp.code}
                                        className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3 md:gap-6 items-start bg-white"
                                      >
                                        <div>
                                          <span className="inline-block bg-[#f5f5f5] text-[#111111] border border-[#e5e5e5] rounded px-2.5 py-1 text-xs font-semibold font-mono">
                                            {sp.code}
                                          </span>
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-sm font-semibold text-[#111111] m-0">
                                            {sp.heading}
                                          </h4>
                                          <p className="text-sm text-[#39393b] leading-relaxed m-0 mt-1.5">
                                            {sp.body}
                                          </p>
                                          {sp.bullets && sp.bullets.length > 0 && (
                                            <ul className="mt-2.5 mb-0 pl-5 space-y-1.5 text-sm text-[#39393b]">
                                              {sp.bullets.map((bullet, idx) => (
                                                <li key={idx} className="leading-relaxed">
                                                  {bullet}
                                                </li>
                                              ))}
                                            </ul>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Quick preview strip of official signals for this article */}
                                  {signalsList.length > 0 && art.id !== 'app-a' && (
                                    <div className="border border-[#cacacb] bg-[#f5f5f5] p-4">
                                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                                          Associated Official Referee Signals
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setArticleTab(art.id, 'signals')}
                                          className="text-xs font-medium text-[#111111] hover:underline bg-transparent border-0 cursor-pointer p-0"
                                        >
                                          Open all {signalsList.length} signals →
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {signalsList.slice(0, 6).map((sig) => (
                                          <button
                                            key={sig.number}
                                            type="button"
                                            onClick={() => setSelectedSignal(sig)}
                                            className="bg-white border border-[#cacacb] hover:border-[#111111] p-2.5 text-left cursor-pointer transition-colors flex flex-col justify-between"
                                          >
                                            <img
                                              src={sig.imagePath}
                                              alt={`Signal ${sig.number}: ${sig.name}`}
                                              loading="lazy"
                                              className="w-full h-28 object-contain bg-[#fafafa]"
                                            />
                                            <div className="mt-2">
                                              <span className="block text-[11px] font-mono font-semibold text-[#707072]">
                                                Signal #{sig.number}
                                              </span>
                                              <span className="block text-xs font-semibold text-[#111111] leading-tight mt-0.5">
                                                {sig.name}
                                              </span>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 2: Official Examples & OBRI Interpretations (Statements banner + 2-column Example Grid) */}
                              {tab === 'examples' && examples.length > 0 && (
                                <div className="p-5 space-y-5 bg-[#fafafa]">
                                  {statements.length > 0 && (
                                    <div className="space-y-3">
                                      {statements.map((st) => (
                                          <div className="bg-white border-2 border-[#26251e] rounded-xl p-4 md:p-5"
                                            key={st.code}
                                          >
                                            <div className="flex flex-wrap items-center gap-2.5">
                                              <span className="inline-block bg-[#f54e00] text-white rounded px-2 py-0.5 text-xs font-semibold font-mono-clock">
                                                {st.code}
                                              </span>
                                              <span className="text-xs font-semibold uppercase tracking-wider text-[#26251e]">
                                                Official OBRI Statement
                                              </span>
                                            </div>
                                            <p className="text-sm text-[#26251e] leading-relaxed m-0 mt-2.5">
                                              {st.text}
                                            </p>
                                          </div>
                                      ))}
                                    </div>
                                  )}

                                  {exampleCases.length > 0 && (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                      {exampleCases.map((ex) => (
                                        <div
                                          key={ex.code}
                                          className="bg-white border border-[#cacacb] flex flex-col justify-between"
                                        >
                                          <div className="p-4">
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="inline-block bg-[#111111] text-white rounded px-2 py-0.5 text-xs font-semibold font-mono">
                                                {ex.code}
                                              </span>
                                              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#707072]">
                                                Example
                                              </span>
                                            </div>
                                            <p className="text-sm text-[#111111] leading-relaxed m-0 mt-2.5">
                                              {ex.text}
                                            </p>
                                          </div>
                                          {ex.interpretation && (
                                            <div className="px-4 py-3 bg-[#f5f5f5] border-t border-[#e5e5e5]">
                                              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#111111] mb-1">
                                                Official Interpretation
                                              </span>
                                              <p className="text-sm text-[#39393b] leading-relaxed m-0">
                                                {ex.interpretation}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* TAB 3: Official Referee Signals (Grouped Visual Gallery for Appendix A or Article-Specific Signals) */}
                              {tab === 'signals' && signalsList.length > 0 && (
                                <div className="p-5 bg-[#fafafa] space-y-8">
                                  {art.id === 'app-a' ? (
                                    signalGroups.map((group) => {
                                      const groupSignals = signals.filter(
                                        (s) => s.category === group
                                      );
                                      return (
                                        <div key={group}>
                                          <div className="flex items-baseline justify-between gap-2 pb-2 mb-4 border-b border-[#111111]">
                                            <h4 className="text-base font-semibold text-[#111111] m-0">
                                              {group}
                                            </h4>
                                            <span className="text-xs text-[#707072]">
                                              Signals {groupSignals[0].number}–
                                              {groupSignals[groupSignals.length - 1].number}
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {groupSignals.map((sig) => (
                                              <button
                                                key={sig.number}
                                                type="button"
                                                onClick={() => setSelectedSignal(sig)}
                                                className="bg-white border border-[#cacacb] hover:border-[#111111] p-3 text-left cursor-pointer transition-colors flex flex-col justify-between"
                                              >
                                                <div>
                                                  <div className="text-xs font-semibold text-[#111111] leading-snug mb-2 min-h-[2rem]">
                                                    {sig.name}
                                                  </div>
                                                  <img
                                                    src={sig.imagePath}
                                                    alt={`Signal ${sig.number}: ${sig.name}`}
                                                    loading="lazy"
                                                    className="w-full h-40 object-contain bg-[#fafafa] border border-[#e5e5e5]"
                                                  />
                                                </div>
                                                <div className="mt-2.5 pt-2 border-t border-[#e5e5e5]">
                                                  <span className="text-[11px] font-mono font-semibold text-[#707072]">
                                                    No. {sig.number}
                                                  </span>
                                                  <p className="text-xs text-[#39393b] leading-snug m-0 mt-0.5">
                                                    {sig.action}
                                                  </p>
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                      {signalsList.map((sig) => (
                                        <button
                                          key={sig.number}
                                          type="button"
                                          onClick={() => setSelectedSignal(sig)}
                                          className="bg-white border border-[#cacacb] hover:border-[#111111] p-3 text-left cursor-pointer transition-colors flex flex-col justify-between"
                                        >
                                          <div>
                                            <span className="inline-block bg-[#111111] text-white rounded px-2 py-0.5 text-[11px] font-mono font-semibold mb-1.5">
                                              Signal #{sig.number}
                                            </span>
                                            <div className="text-xs font-semibold text-[#111111] leading-snug mb-2">
                                              {sig.name}
                                            </div>
                                            <img
                                              src={sig.imagePath}
                                              alt={`Signal ${sig.number}: ${sig.name}`}
                                              loading="lazy"
                                              className="w-full h-40 object-contain bg-[#fafafa] border border-[#e5e5e5]"
                                            />
                                          </div>
                                          <p className="text-xs text-[#39393b] leading-snug m-0 mt-2.5 pt-2 border-t border-[#e5e5e5]">
                                            {sig.action}
                                          </p>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Signal Enlargement Modal */}
      {selectedSignal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Signal ${selectedSignal.number}: ${selectedSignal.name}`}
          onClick={() => setSelectedSignal(null)}
        >
          <div
            className="bg-white border border-[#26251e] rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#e6e5e0]">
              <div>
                <span className="inline-block bg-[#f54e00] text-white rounded-full px-3 py-0.5 text-xs font-medium font-mono-clock">
                  Signal #{selectedSignal.number}
                </span>
                <span className="block text-xs text-[#5a5852] mt-1.5">
                  {selectedSignal.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSignal(null)}
                className="h-8 px-3 rounded-full border border-[#cfcdc4] bg-white text-xs font-medium text-[#26251e] hover:border-[#26251e] cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <h3 className="text-xl font-semibold text-[#26251e] mt-4 mb-3">
              {selectedSignal.name}
            </h3>

            <div className="bg-[#f7f7f4] border border-[#e6e5e0] rounded-xl p-4 flex items-center justify-center">
              <img
                src={selectedSignal.imagePath}
                alt={`Signal ${selectedSignal.number}: ${selectedSignal.name}`}
                className="max-h-80 w-auto object-contain"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#e6e5e0]">
              <span className="block text-xs font-mono-clock font-semibold uppercase tracking-wider text-[#f54e00]">
                Official Hand Mechanic
              </span>
              <p className="text-sm text-[#26251e] m-0 mt-1 leading-relaxed">
                {selectedSignal.action}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
