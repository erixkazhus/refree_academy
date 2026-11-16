import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CourtKeyDiagramIcon,
  FibaHalfCourtSvg,
  RefereeWhistleIcon,
  ShotClockIcon,
} from '../components/CourtMotifs';

export const UserHomePage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const accuracy =
    user.totalAttempts > 0
      ? Math.round((user.correctAttempts / user.totalAttempts) * 100)
      : 0;

  return (
    <main className="max-w-[1440px] mx-auto px-6 lg:px-12">
      {/* Signed-In Referee Arena Hero Banner */}
      <section className="mt-6 relative bg-[#1b1a15] text-white overflow-hidden rounded-2xl border border-[#26251e] px-8 py-12 md:px-14 md:py-16">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
          src="/videos/authorized_user_background.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1a15]/95 via-[#1b1a15]/75 to-[#1b1a15]/45 pointer-events-none" />
        <FibaHalfCourtSvg
          className="hidden lg:block absolute right-10 -bottom-6 w-[440px] h-[290px] opacity-40 pointer-events-none"
          strokeColor="rgba(247,247,244,0.22)"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#f54e00] text-white rounded-full px-3.5 py-1 text-xs font-medium mb-5">
              <RefereeWhistleIcon size={14} />
              <span className="font-mono-clock uppercase tracking-wider text-[11px]">
                Referee Portal · {user.role}
              </span>
            </div>

            <h1 className="display-campaign text-4xl sm:text-6xl md:text-[66px] text-white m-0">
              WELCOME BACK,
              <br />
              {user.fullName}.
            </h1>

            <p className="mt-4 text-base text-[#e6e5e0] max-w-2xl leading-relaxed">
              Choose how you want to train today: test your judgment with real foul &amp; violation video cases, or study the complete Official FIBA Basketball Rules article by article.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/study" className="btn-on-image no-underline">
                Take a Quiz →
              </Link>
              <Link
                to="/rules"
                className="bg-white/10 backdrop-blur-sm text-white border border-white/35 rounded-full h-11 px-6 text-sm font-medium inline-flex items-center no-underline hover:bg-white hover:text-[#26251e] transition-colors"
              >
                Study Rules (Official FIBA Rulebook)
              </Link>
            </div>
          </div>

          {/* Scoreboard Game-Clock Telemetry Card */}
          <div className="bg-[#181813]/95 border border-[#3d3b31] rounded-xl overflow-hidden min-w-[270px]">
            <div className="h-1.5 w-full referee-stripes" />
            <div className="p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono-clock uppercase tracking-wider text-[#cfcdc4]">
                  Game Calls Accuracy
                </span>
                <span className="w-2 h-2 rounded-full bg-[#1f8a65]" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-mono-clock font-bold text-white">{accuracy}%</span>
                <span className="text-xs text-[#f54e00] font-mono-clock uppercase">Rating</span>
              </div>
              <div className="mt-2 pt-3 border-t border-[#302f28] text-xs font-mono-clock text-[#cfcdc4]">
                {user.correctAttempts} correct / {user.totalAttempts} answered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primary Action Cards: Take a Quiz & Study Rules */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden border border-[#26251e] bg-[#26251e] text-white rounded-xl p-8 flex flex-col justify-between">
          <FibaHalfCourtSvg
            className="absolute -right-12 -bottom-10 w-[280px] h-[200px] opacity-30 pointer-events-none"
            strokeColor="rgba(247,247,244,0.22)"
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[#f54e00] text-white rounded-full px-3 py-1 text-[11px] font-mono-clock uppercase tracking-wider font-semibold">
                Interactive Video Exam
              </span>
              <ShotClockIcon className="text-[#cfcdc4]" />
            </div>
            <h2 className="text-2xl font-medium mt-4 mb-2 text-white">
              Take a Quiz
            </h2>
            <p className="text-sm text-[#e6e5e0] leading-relaxed m-0">
              Watch 1,864+ real match clips side-by-side with Official FIBA 2026 questions across Rules 1–8 and Appendices A–F, with immediate rulebook feedback on every call.
            </p>
          </div>
          <div className="relative z-10 mt-8">
            <Link to="/study" className="btn-primary no-underline">
              Take a Quiz →
            </Link>
          </div>
        </div>

        <div className="border border-[#e6e5e0] bg-white rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[#fafaf7] border border-[#e6e5e0] text-[#26251e] rounded-full px-3 py-1 text-[11px] font-mono-clock uppercase tracking-wider font-semibold">
                Complete Rulebook Reference
              </span>
              <CourtKeyDiagramIcon className="text-[#26251e]" />
            </div>
            <h2 className="text-2xl font-medium mt-4 mb-2 text-[#26251e]">
              Study Rules
            </h2>
            <p className="text-sm text-[#5a5852] leading-relaxed m-0">
              Read all 8 Official FIBA Basketball Rules (Articles 1–51), OBRI Examples &amp; Interpretations, and 72 official Referee Hand Signals — plus download official 2026 PDFs.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/rules" className="btn-dark no-underline">
              Study Official FIBA Rules →
            </Link>
            <Link to="/rulebook-pdfs" className="btn-secondary no-underline">
              Official PDFs ↓
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};
