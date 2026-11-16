import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CourtKeyDiagramIcon,
  FibaHalfCourtSvg,
  RefereeWhistleIcon,
  ShotClockIcon,
} from '../components/CourtMotifs';
import { UserHomePage } from './UserHomePage';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <UserHomePage />;
  }

  return (
    <main className="max-w-[1440px] mx-auto px-6 lg:px-12">
      {/* Arena Hero Banner with Half-Court Lines Overlay & Video */}
      <section className="mt-6 relative bg-[#1b1a15] text-white overflow-hidden rounded-2xl border border-[#26251e]">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none"
          src="/videos/refree_main_background.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1a15]/95 via-[#1b1a15]/75 to-[#1b1a15]/45 pointer-events-none" />
        <FibaHalfCourtSvg
          className="hidden lg:block absolute right-0 bottom-0 w-[480px] h-[320px] opacity-65 pointer-events-none"
          strokeColor="rgba(247,247,244,0.22)"
        />

        <div className="relative z-10 px-8 py-14 md:px-14 md:py-20 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#f54e00] text-white rounded-full px-3.5 py-1 text-xs font-medium mb-5">
            <RefereeWhistleIcon size={14} />
            <span className="font-mono-clock uppercase tracking-wider text-[11px]">
              Official FIBA Basketball Rules &amp; Interpretations
            </span>
          </div>

          <h1 className="display-campaign text-5xl sm:text-7xl md:text-[80px] text-white m-0">
            MASTER THE
            <br />
            OFFICIAL CALL.
          </h1>

          <p className="mt-5 text-base md:text-lg text-[#e6e5e0] max-w-2xl leading-relaxed font-normal">
            FIBA Referee Academy is a video-assisted basketball officiating platform. Watch real match fouls and violations side-by-side with Official FIBA Rulebook questions, and learn immediately why every call is right or wrong.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" className="btn-on-image no-underline">
              Create Referee Account →
            </Link>
            <Link
              to="/login"
              className="bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-full h-11 px-6 text-sm font-medium inline-flex items-center no-underline hover:bg-white hover:text-[#26251e] transition-colors"
            >
              Sign In to Court Console
            </Link>
          </div>
        </div>
      </section>

      {/* Brief Platform Overview */}
      <section id="about-platform" className="mt-16 pt-12 border-t border-[#e6e5e0]">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-mono-clock font-semibold text-[#f54e00] uppercase tracking-widest m-0">
              About This Platform
            </p>
            <h2 className="text-[28px] md:text-[36px] font-medium tracking-tight text-[#26251e] mt-1 mb-0">
              Built for FIBA Referees &amp; Candidates
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 bg-white border border-[#e6e5e0] rounded-full px-4 py-1.5 text-xs font-mono-clock text-[#5a5852]">
            1,864+ Game Clips · Rules 1–8
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#e6e5e0] rounded-xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="bg-[#dfa88f]/40 text-[#26251e] rounded-full px-3 py-1 text-[11px] font-mono-clock font-semibold uppercase tracking-wider">
                  01 · What It Is
                </span>
                <CourtKeyDiagramIcon className="text-[#26251e]" />
              </div>
              <h3 className="text-lg font-semibold text-[#26251e] mt-0 mb-2">
                Official Rulebook Training Hub
              </h3>
              <p className="text-sm text-[#5a5852] leading-relaxed m-0">
                A dedicated learning environment grounded in the Official FIBA Basketball Rules and Interpretations (OBRI), uniting real match video footage with structured officiating exams.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e6e5e0] rounded-xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="bg-[#9fbbe0]/45 text-[#26251e] rounded-full px-3 py-1 text-[11px] font-mono-clock font-semibold uppercase tracking-wider">
                  02 · What It Does
                </span>
                <ShotClockIcon className="text-[#26251e]" />
              </div>
              <h3 className="text-lg font-semibold text-[#26251e] mt-0 mb-2">
                Side-by-Side Video &amp; Feedback
              </h3>
              <p className="text-sm text-[#5a5852] leading-relaxed m-0">
                Displays the foul or violation clip right next to each question with slow-motion replay. Selecting an answer immediately explains why it is correct—or why that specific choice breaks the rule.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e6e5e0] rounded-xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="bg-[#9fc9a2]/45 text-[#26251e] rounded-full px-3 py-1 text-[11px] font-mono-clock font-semibold uppercase tracking-wider">
                  03 · Why It Is Useful
                </span>
                <RefereeWhistleIcon size={22} className="text-[#f54e00]" />
              </div>
              <h3 className="text-lg font-semibold text-[#26251e] mt-0 mb-2">
                Faster Court Recognition
              </h3>
              <p className="text-sm text-[#5a5852] leading-relaxed m-0">
                Trains split-second judgment on grey-area calls like the no-charge semi-circle, gather steps, and fast-break criteria—while letting instructors upload fresh game clips in Admin Studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a FIBA Game Official — Licensing & Qualification Pathway */}
      <section id="become-official" className="mt-16 pt-12 border-t border-[#e6e5e0]">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-mono-clock font-semibold text-[#f54e00] uppercase tracking-widest m-0">
              FIBA Game Officials Licensing (GOL)
            </p>
            <h2 className="text-[28px] md:text-[36px] font-medium tracking-tight text-[#26251e] mt-1 mb-0">
              How to Become a Licensed FIBA Game Official
            </h2>
          </div>
          <span className="bg-white border border-[#e6e5e0] text-[#26251e] rounded-full px-4 py-1.5 text-xs font-mono-clock font-medium">
            2-Year International Licensing Cycle
          </span>
        </div>

        {/* Core Process + Nomination Rule */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 relative overflow-hidden bg-[#26251e] text-white rounded-xl p-8 flex flex-col justify-between">
            <FibaHalfCourtSvg
              className="absolute -right-12 -bottom-10 w-[340px] h-[220px] opacity-35 pointer-events-none"
              strokeColor="rgba(247,247,244,0.25)"
            />
            <div className="relative z-10">
              <span className="inline-block bg-[#f54e00] text-white rounded-full px-3 py-1 text-[11px] font-mono-clock uppercase tracking-wider font-semibold mb-5">
                National Federation Nomination
              </span>
              <h3 className="text-2xl font-medium m-0 mb-3 text-white">
                Pathway Through Your National Federation
              </h3>
              <p className="text-sm text-[#e6e5e0] leading-relaxed m-0">
                Individual referees cannot apply to FIBA directly. Candidates must be active officials in good standing within their country and be proposed and registered by their{' '}
                <strong className="text-white font-semibold">National Member Federation</strong> via the FIBA Management and Administration Platform (MAP) during each two-year licensing cycle.
              </p>
            </div>
            <div className="relative z-10 mt-8 pt-6 border-t border-[#3d3b31] text-xs text-[#cfcdc4] leading-relaxed">
              Tip: Contact your domestic National Basketball Federation Referee Commission to learn about local evaluation timelines, internal fitness benchmarks, and nomination requirements.
            </div>
          </div>

          {/* 4-Phase Qualification Steps */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                step: 'Step 01',
                title: 'Domestic Activity & Nomination',
                body: 'Officiate regularly in top domestic leagues and earn nomination from your National Federation into the FIBA licensing cycle.',
              },
              {
                step: 'Step 02',
                title: 'Rules & Mechanics Exams',
                body: 'Demonstrate mastery of the Official FIBA Basketball Rules, Official Interpretations (OBRI), and 2- and 3-person officiating mechanics.',
              },
              {
                step: 'Step 03',
                title: 'Fitness & Medical Evaluation',
                body: 'Complete the mandatory FIBA physical fitness shuttle test and submit medical clearance verifying readiness for international tempo.',
              },
              {
                step: 'Step 04',
                title: 'FIBA Verification & Licensing',
                body: 'FIBA verifies candidate results and awards a two-year license tier, alongside dedicated Women in Basketball allocations to expand female representation.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border border-[#e6e5e0] bg-white rounded-xl p-6 hover:border-[#cfcdc4] transition-colors"
              >
                <div className="text-[11px] font-mono-clock font-semibold uppercase tracking-wider text-[#f54e00]">
                  {item.step}
                </div>
                <h4 className="text-base font-semibold text-[#26251e] mt-2 mb-2">{item.title}</h4>
                <p className="text-sm text-[#5a5852] m-0 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Three FIBA License Categories */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e6e5e0] rounded-xl overflow-hidden">
            <div className="h-2 w-full bg-[#26251e]" />
            <div className="p-6">
              <span className="text-xs font-mono-clock font-semibold uppercase tracking-wider text-[#26251e]">
                Black License
              </span>
              <p className="text-sm text-[#5a5852] mt-2 mb-0 leading-relaxed">
                Highest-tier referee certification authorizing appointments across global and flagship international competitions, senior championships, and Olympic-level tournaments.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e6e5e0] rounded-xl overflow-hidden">
            <div className="h-2 w-full bg-[#1f8a65]" />
            <div className="p-6">
              <span className="text-xs font-mono-clock font-semibold uppercase tracking-wider text-[#1f8a65]">
                Green License
              </span>
              <p className="text-sm text-[#5a5852] mt-2 mb-0 leading-relaxed">
                Continental and international club competition tier enabling officials to work senior regional qualifiers, youth world cups, and continental club leagues.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#e6e5e0] rounded-xl overflow-hidden">
            <div className="h-2 w-full bg-[#cfcdc4]" />
            <div className="p-6">
              <span className="text-xs font-mono-clock font-semibold uppercase tracking-wider text-[#5a5852]">
                White License
              </span>
              <p className="text-sm text-[#5a5852] mt-2 mb-0 leading-relaxed">
                Entry international category for newly licensed FIBA officials building experience across sub-regional events, youth championships, and friendly internationals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
