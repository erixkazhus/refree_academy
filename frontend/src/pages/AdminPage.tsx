import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiClientError } from '../api/client';
import { FibaHalfCourtSvg, RefereeWhistleIcon } from '../components/CourtMotifs';
import { useAuth } from '../context/AuthContext';
import { AdminOption, AdminQuestion } from '../types';

const RULEBOOK_CATEGORIES = [
  'Rule 1 · The Game',
  'Rule 2 · Court & Equipment',
  'Rule 3 · Teams',
  'Rule 4 · Playing Regulations',
  'Rule 5 · Violations',
  'Rule 6 · Fouls',
  'Rule 7 · General Provisions',
  'Rule 8 · Officials',
  'Appendices A–F',
];

const DIFFICULTIES = ['FIBA Level 1', 'FIBA Level 2', 'FIBA Level 3'];
const PAGE_SIZE = 20;

const emptyOptions = (): AdminOption[] => [
  { optionLabel: '', correct: true, explanation: '' },
  { optionLabel: '', correct: false, explanation: '' },
  { optionLabel: '', correct: false, explanation: '' },
  { optionLabel: '', correct: false, explanation: '' },
];

export const AdminPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // Filter & server-side pagination for the 1,884+ existing questions
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [listPage, setListPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalAllQuestions, setTotalAllQuestions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pagedSupportedRef = useRef(true);

  // Inline playable video toggle per existing question row
  const [playingQuestionId, setPlayingQuestionId] = useState<number | null>(null);
  const [busyVideoId, setBusyVideoId] = useState<number | null>(null);

  // Modal state (used for both Create New Question and Edit Question)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [ruleReference, setRuleReference] = useState('');
  const [category, setCategory] = useState('Rule 6 · Fouls');
  const [difficulty, setDifficulty] = useState('FIBA Level 2');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<AdminOption[]>(emptyOptions());

  // Video handling inside modal (local playable blob URL or attached existing videoUrl)
  const [modalVideoFile, setModalVideoFile] = useState<File | null>(null);
  const [modalLocalPreviewUrl, setModalLocalPreviewUrl] = useState<string | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalErrorMsg, setModalErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!modalVideoFile) {
      setModalLocalPreviewUrl(null);
      return;
    }
    const objUrl = URL.createObjectURL(modalVideoFile);
    setModalLocalPreviewUrl(objUrl);
    return () => {
      URL.revokeObjectURL(objUrl);
    };
  }, [modalVideoFile]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  const loadQuestions = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    setLoadingList(true);
    setErrorMsg(null);
    try {
      if (pagedSupportedRef.current) {
        try {
          const data = await api.adminListPagedQuestions({
            category: sectionFilter,
            search: debouncedSearch,
            page: listPage,
            size: PAGE_SIZE,
          });
          setQuestions(data.items);
          setTotalElements(data.totalElements);
          setTotalPages(Math.max(1, data.totalPages));
          setTotalAllQuestions(
            data.categories.reduce((acc, item) => acc + item.count, 0)
          );
          return;
        } catch (pagedErr) {
          if (!(pagedErr instanceof ApiClientError) || (pagedErr.status !== 404 && pagedErr.status !== 405)) {
            throw pagedErr;
          }
          pagedSupportedRef.current = false;
        }
      }

      // Fallback when running against a local backend container that has not been rebuilt with /paged yet
      const all = await api.adminListQuestions();
      const qLower = debouncedSearch.toLowerCase();
      const filtered = all.filter((item) => {
        if (sectionFilter !== 'All' && item.category !== sectionFilter) return false;
        if (!qLower) return true;
        return (
          String(item.id).includes(qLower) ||
          item.title.toLowerCase().includes(qLower) ||
          item.ruleReference.toLowerCase().includes(qLower) ||
          item.prompt.toLowerCase().includes(qLower)
        );
      });
      const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      const clamped = Math.min(listPage, pages - 1);
      setQuestions(filtered.slice(clamped * PAGE_SIZE, (clamped + 1) * PAGE_SIZE));
      setTotalElements(filtered.length);
      setTotalPages(pages);
      setTotalAllQuestions(all.length);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load admin questions.');
    } finally {
      setLoadingList(false);
    }
  }, [user?.role, sectionFilter, debouncedSearch, listPage]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, saving]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setRuleReference('');
    setCategory('Rule 6 · Fouls');
    setDifficulty('FIBA Level 2');
    setPrompt('');
    setOptions(emptyOptions());
    setModalVideoFile(null);
    setExistingVideoUrl(null);
    setRemoveExistingVideo(false);
    setModalErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (q: AdminQuestion) => {
    setEditingId(q.id);
    setTitle(q.title);
    setRuleReference(q.ruleReference);
    setCategory(q.category);
    setDifficulty(q.difficulty);
    setPrompt(q.prompt);
    setOptions(
      q.options.map((o) => ({
        optionLabel: o.optionLabel,
        correct: o.correct,
        explanation: o.explanation,
      }))
    );
    setModalVideoFile(null);
    setExistingVideoUrl(q.videoUrl);
    setRemoveExistingVideo(false);
    setModalErrorMsg(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setModalVideoFile(null);
    setExistingVideoUrl(null);
    setRemoveExistingVideo(false);
    setModalErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setStatusMsg(null);
    setModalErrorMsg(null);
    try {
      const payload = { title, ruleReference, category, difficulty, prompt, options };
      let saved: AdminQuestion;

      if (editingId) {
        saved = await api.adminUpdateQuestion(editingId, payload);
        if (modalVideoFile) {
          saved = await api.adminUploadVideo(saved.id, modalVideoFile);
        } else if (removeExistingVideo && existingVideoUrl) {
          saved = await api.adminRemoveVideo(saved.id);
        }
        setQuestions((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        setStatusMsg(`Updated question #${saved.id}${modalVideoFile ? ` with video "${modalVideoFile.name}"` : removeExistingVideo ? ' and removed its video' : ''}.`);
      } else {
        saved = await api.adminCreateQuestion(payload);
        if (modalVideoFile) {
          saved = await api.adminUploadVideo(saved.id, modalVideoFile);
        }
        setListPage(0);
        await loadQuestions();
        setStatusMsg(
          modalVideoFile
            ? `Created question #${saved.id} with playable video "${modalVideoFile.name}".`
            : `Created new FIBA rulebook question #${saved.id}.`
        );
      }

      closeModal();
    } catch (err) {
      setModalErrorMsg(err instanceof ApiClientError ? err.message : 'Failed to save question or video.');
    } finally {
      setSaving(false);
    }
  };

  const handleRowVideoUpload = async (questionId: number, file: File) => {
    setErrorMsg(null);
    setStatusMsg(null);
    setBusyVideoId(questionId);
    try {
      const updated = await api.adminUploadVideo(questionId, file);
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setPlayingQuestionId(questionId);
      setStatusMsg(`Attached video "${file.name}" to question #${questionId}.`);
    } catch (err) {
      setErrorMsg(err instanceof ApiClientError ? err.message : 'Video upload failed.');
    } finally {
      setBusyVideoId(null);
    }
  };

  const handleRowVideoRemove = async (questionId: number) => {
    setErrorMsg(null);
    setStatusMsg(null);
    setBusyVideoId(questionId);
    try {
      const updated = await api.adminRemoveVideo(questionId);
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      if (playingQuestionId === questionId) {
        setPlayingQuestionId(null);
      }
      setStatusMsg(`Removed attached video from question #${questionId}.`);
    } catch (err) {
      setErrorMsg(err instanceof ApiClientError ? err.message : 'Failed to remove video.');
    } finally {
      setBusyVideoId(null);
    }
  };

  const handleDelete = async (questionId: number) => {
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await api.adminDeleteQuestion(questionId);
      if (playingQuestionId === questionId) setPlayingQuestionId(null);
      if (editingId === questionId) closeModal();
      await loadQuestions();
      setStatusMsg(`Deleted question #${questionId}.`);
    } catch (err) {
      setErrorMsg(err instanceof ApiClientError ? err.message : 'Delete failed.');
    }
  };

  const safePage = Math.min(listPage, totalPages - 1);
  const pagedQuestions = questions;

  const activeModalVideoSrc =
    modalLocalPreviewUrl ?? (!removeExistingVideo ? existingVideoUrl : null);

  if (authLoading) {
    return <div className="max-w-[1440px] mx-auto px-6 py-16 text-sm text-[#707072]">Checking permissions...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="border border-[#cacacb] bg-white p-8">
          <h1 className="text-2xl font-medium m-0 mb-2">Admin Access Required</h1>
          <p className="text-sm text-[#707072] mb-6">
            Only authenticated accounts with the <strong>ADMIN</strong> role can edit FIBA questions, manage explanations, or upload foul videos.
          </p>
          <Link to="/login" className="btn-primary no-underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
      {/* Admin Studio Top Header + Create New Question Button */}
      <div className="relative overflow-hidden bg-[#26251e] text-white rounded-2xl p-8 flex flex-wrap items-center justify-between gap-4 border border-[#26251e]">
        <FibaHalfCourtSvg
          className="hidden md:block absolute right-48 -bottom-10 w-[300px] h-[200px] opacity-25 pointer-events-none"
          strokeColor="rgba(247,247,244,0.25)"
        />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-clock font-semibold uppercase tracking-wider text-[#f54e00]">
            <RefereeWhistleIcon size={14} />
            Role: ADMIN · Official Case Management
          </span>
          <h1 className="text-3xl font-medium mt-1.5 mb-0 text-white">
            Admin Question &amp; Video Studio
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="relative z-10 btn-primary !h-11 !px-6 !text-sm"
        >
          + Create New Question
        </button>
      </div>

      {statusMsg && (
        <div className="mt-6 p-4 rounded-xl border border-[#1f8a65] bg-white text-sm text-[#1f8a65] font-medium">
          {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mt-6 p-4 rounded-xl border border-[#cf2d56] bg-white text-sm text-[#cf2d56] font-medium">
          {errorMsg}
        </div>
      )}

      {/* Search & Section Filter Bar for Existing Questions */}
      <div className="mt-8 bg-white border border-[#e6e5e0] rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium m-0">
            Manage Existing Rules &amp; Videos ({totalElements.toLocaleString()}
            {totalAllQuestions > 0 && totalElements !== totalAllQuestions
              ? ` of ${totalAllQuestions.toLocaleString()}`
              : ''}
            )
          </h2>
          <p className="text-xs text-[#707072] mt-1 m-0">
            Play attached video clips inline, add/replace or remove videos, or edit questions and rulebook explanations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sectionFilter}
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setListPage(0);
            }}
            className="h-10 px-3 rounded-full bg-[#f5f5f5] border border-[#cacacb] text-xs font-medium text-[#111111]"
          >
            <option value="All">All Rulebook Sections</option>
            {RULEBOOK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setListPage(0);
            }}
            placeholder="Search ID, title, rule or prompt..."
            className="h-10 px-4 rounded-full bg-[#f5f5f5] border border-[#cacacb] text-sm w-64 focus:bg-white focus:border-[#111111] focus:outline-none"
          />
        </div>
      </div>

      {/* Existing Questions & Video Controls List */}
      <div className="mt-6 space-y-4">
        {loadingList ? (
          <div className="border border-[#e5e5e5] bg-white p-10 text-center text-sm text-[#707072]">
            Loading questions...
          </div>
        ) : pagedQuestions.length === 0 ? (
          <div className="border border-[#e5e5e5] bg-white p-10 text-center text-sm text-[#707072]">
            No questions match the current filter.
          </div>
        ) : (
          pagedQuestions.map((q) => {
            const isPlaying = playingQuestionId === q.id;
            const isBusy = busyVideoId === q.id;
            return (
              <div key={q.id} className="border border-[#e6e5e0] bg-white rounded-xl p-6 hover:border-[#cfcdc4] transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="text-xs font-mono-clock font-medium text-[#807d72]">
                      #{q.id} · {q.category} · {q.ruleReference} · {q.difficulty}
                    </div>
                    <div className="text-lg font-medium text-[#26251e]">{q.title}</div>
                    <p className="text-sm text-[#5a5852] m-0">{q.prompt}</p>
                    <div className={`text-xs pt-1 font-mono-clock font-medium ${q.videoUrl ? 'text-[#1f8a65]' : 'text-[#807d72]'}`}>
                      {q.videoUrl ? 'Video clip attached' : 'No video attached'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {q.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setPlayingQuestionId(isPlaying ? null : q.id)}
                        className={`!h-10 !px-4 !text-xs ${
                          isPlaying ? 'btn-primary' : 'btn-dark'
                        }`}
                      >
                        {isPlaying ? 'Hide Video' : '▶ Play Video'}
                      </button>
                    )}

                    <label className="btn-secondary !h-10 !px-4 !text-xs cursor-pointer">
                      {isBusy ? 'Uploading...' : q.videoUrl ? 'Replace Video' : '+ Add Video'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        disabled={isBusy}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) handleRowVideoUpload(q.id, file);
                        }}
                      />
                    </label>

                    {q.videoUrl && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRowVideoRemove(q.id)}
                        className="h-10 px-4 rounded-full border border-[#cf2d56] text-[#cf2d56] bg-white text-xs font-medium cursor-pointer hover:bg-[#cf2d56] hover:text-white disabled:opacity-40"
                      >
                        Remove Video
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditModal(q)}
                      className="btn-secondary !h-10 !px-4 !text-xs"
                    >
                      Edit Question &amp; Answers
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="h-10 px-4 rounded-full border border-[#cfcdc4] text-[#5a5852] bg-white text-xs font-medium cursor-pointer hover:border-[#cf2d56] hover:text-[#cf2d56]"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline Playable Video Player when Play Video is toggled */}
                {isPlaying && q.videoUrl && (
                  <div className="mt-5 pt-5 border-t border-[#e5e5e5]">
                    <div className="max-w-2xl bg-black border border-[#111111]">
                      <video
                        key={q.videoUrl}
                        src={q.videoUrl}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        className="w-full aspect-video"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white border border-[#e5e5e5] px-6 py-4">
          <span className="text-xs text-[#707072]">
            Page {safePage + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setListPage((p) => Math.max(0, p - 1))}
              className="btn-secondary !h-9 !px-4 !text-xs disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setListPage((p) => Math.min(totalPages - 1, p + 1))}
              className="btn-primary !h-9 !px-4 !text-xs disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Modal Window for Create New Question / Edit Question + Playable Video Upload */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
          onClick={() => {
            if (!saving) closeModal();
          }}
        >
          <div
            className="bg-white border border-[#26251e] rounded-2xl overflow-hidden w-full max-w-4xl my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#26251e] text-white border-b border-[#3d3b31]">
              <div>
                <p className="text-[11px] font-mono-clock uppercase tracking-widest text-[#f54e00] m-0">
                  Admin Question &amp; Video Studio
                </p>
                <h2 className="text-xl font-medium m-0 mt-0.5 text-white">
                  {editingId ? `Edit Question #${editingId}` : 'Create New FIBA Rulebook Question'}
                </h2>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                className="bg-white/10 text-white border border-white/25 rounded-full h-9 px-4 text-xs font-medium hover:bg-white hover:text-[#26251e] cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {modalErrorMsg && (
                <div className="p-4 border border-[#d30005] bg-[#f5f5f5] text-sm text-[#d30005] font-medium">
                  {modalErrorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#707072] mb-1">Case Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="No-Charge Semi-Circle Contact"
                    className="w-full h-11 px-3 border border-[#cacacb] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#707072] mb-1">FIBA Rule Reference</label>
                  <input
                    type="text"
                    required
                    value={ruleReference}
                    onChange={(e) => setRuleReference(e.target.value)}
                    placeholder="Art. 33.10 & OBRI 33-3"
                    className="w-full h-11 px-3 border border-[#cacacb] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#707072] mb-1">Quiz Section</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3 border border-[#cacacb] text-sm bg-white"
                  >
                    {!RULEBOOK_CATEGORIES.includes(category) && (
                      <option value={category}>{category}</option>
                    )}
                    {RULEBOOK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#707072] mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-11 px-3 border border-[#cacacb] text-sm bg-white"
                  >
                    {!DIFFICULTIES.includes(difficulty) && (
                      <option value={difficulty}>{difficulty}</option>
                    )}
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#707072] mb-1">Question Prompt</label>
                <textarea
                  required
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the game situation..."
                  className="w-full p-3 border border-[#cacacb] text-sm"
                />
              </div>

              {/* Video Upload & Live Playable Preview inside Modal */}
              <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-[#111111]">
                      Case Video Clip (MP4 / WebM)
                    </div>
                    <div className="text-xs text-[#707072] mt-0.5">
                      {modalVideoFile
                        ? `Selected file: ${modalVideoFile.name} (${(modalVideoFile.size / 1048576).toFixed(2)} MB)`
                        : !removeExistingVideo && existingVideoUrl
                        ? 'Video clip currently attached'
                        : 'No video selected. Upload an MP4 or WebM clip to preview and attach it.'}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="btn-primary !h-9 !px-4 !text-xs cursor-pointer">
                      {activeModalVideoSrc ? 'Replace Video' : '+ Upload Video'}
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) {
                            setModalVideoFile(file);
                            setRemoveExistingVideo(false);
                          }
                        }}
                      />
                    </label>

                    {activeModalVideoSrc && (
                      <button
                        type="button"
                        onClick={() => {
                          if (modalVideoFile) {
                            setModalVideoFile(null);
                          } else {
                            setRemoveExistingVideo(true);
                          }
                        }}
                        className="h-9 px-4 rounded-full border border-[#d30005] text-[#d30005] bg-white text-xs font-medium cursor-pointer hover:bg-[#d30005] hover:text-white"
                      >
                        Remove Video
                      </button>
                    )}
                  </div>
                </div>

                {activeModalVideoSrc && (
                  <div className="bg-black border border-[#111111]">
                    <video
                      key={activeModalVideoSrc}
                      src={activeModalVideoSrc}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[280px] aspect-video"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-xs font-medium uppercase tracking-wider text-[#707072]">
                  Answer Options &amp; Official Rulebook Explanations (Mark Exactly One Correct)
                </div>
                {options.map((opt, idx) => (
                  <div key={idx} className="bg-[#f5f5f5] p-4 border border-[#e5e5e5] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-[#111111]">Option {idx + 1}</span>
                      <label className="inline-flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={opt.correct}
                          onChange={() =>
                            setOptions((prev) =>
                              prev.map((item, i) => ({ ...item, correct: i === idx }))
                            )
                          }
                        />
                        Mark as Correct Answer
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={opt.optionLabel}
                      onChange={(e) =>
                        setOptions((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, optionLabel: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Answer text..."
                      className="w-full h-10 px-3 bg-white border border-[#cacacb] text-sm"
                    />
                    <textarea
                      required
                      rows={2}
                      value={opt.explanation}
                      onChange={(e) =>
                        setOptions((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, explanation: e.target.value } : item
                          )
                        )
                      }
                      placeholder={
                        opt.correct
                          ? 'Explain why this answer is CORRECT according to FIBA Rules...'
                          : 'Explain why this answer is INCORRECT according to FIBA Rules...'
                      }
                      className="w-full p-3 bg-white border border-[#cacacb] text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
