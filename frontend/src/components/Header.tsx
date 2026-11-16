import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BasketballCrest, RefereeWhistleIcon } from './CourtMotifs';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkClass = (path: string) =>
    `h-full inline-flex items-center text-sm font-medium no-underline transition-colors ${
      location.pathname === path
        ? 'text-[#f54e00] border-b-2 border-[#f54e00]'
        : 'text-[#26251e] hover:text-[#f54e00]'
    }`;

  return (
    <>
      {/* Scorer's Table Utility Bar */}
      <div className="w-full bg-[#26251e] text-[#f7f7f4] h-9 px-6 lg:px-12 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f54e00] inline-block" />
            <span className="font-mono-clock tracking-tight text-[11px] uppercase">
              2026 FIBA Official Rules &amp; OBRI
            </span>
          </span>
          <span className="text-[#5a5852] hidden sm:inline">|</span>
          <span className="text-[#cfcdc4] hidden sm:inline-flex items-center gap-1.5">
            <RefereeWhistleIcon size={13} className="text-[#f54e00]" />
            Video-Assisted Officiating Console
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="text-[#cfcdc4] hover:text-white no-underline">
            Privacy
          </Link>
        </div>
      </div>

      {/* Primary Arena Header */}
      <header className="sticky top-0 z-30 bg-[#f7f7f4]/95 backdrop-blur-sm hairline-bottom">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-[#26251e] no-underline shrink-0">
            <BasketballCrest size={34} />
            <div className="leading-tight">
              <span className="block font-semibold text-base tracking-tight text-[#26251e]">
                FIBA REF ACADEMY
              </span>
              <span className="block text-[10px] font-mono-clock uppercase tracking-widest text-[#807d72]">
                Court · Whistle · Judgment
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 h-full">
            <Link to="/" className={navLinkClass('/')}>
              Home
            </Link>
            {!user && (
              <>
                <a
                  href="/#about-platform"
                  className="h-full inline-flex items-center text-sm font-medium text-[#26251e] no-underline hover:text-[#f54e00]"
                >
                  About
                </a>
                <a
                  href="/#become-official"
                  className="h-full inline-flex items-center text-sm font-medium text-[#26251e] no-underline hover:text-[#f54e00]"
                >
                  Licensing Pathway
                </a>
              </>
            )}
            {user && (
              <>
                <Link to="/rules" className={navLinkClass('/rules')}>
                  Study Rules
                </Link>
                <Link to="/study" className={navLinkClass('/study')}>
                  Take a Quiz
                </Link>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className={navLinkClass('/admin')}>
                Admin Studio
              </Link>
            )}
          </nav>

          {/* Right Cluster */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <span className="hidden sm:inline-flex items-center gap-2 bg-white border border-[#e6e5e0] text-[#26251e] rounded-full px-3.5 py-1.5 text-xs font-medium">
                  <span>{user.fullName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono-clock uppercase text-white ${
                      user.role === 'ADMIN' ? 'bg-[#f54e00]' : 'bg-[#26251e]'
                    }`}
                  >
                    {user.role}
                  </span>
                </span>
                <Link to="/rules" className="md:hidden btn-secondary !h-9 !px-3.5 !text-xs no-underline">
                  Rules
                </Link>
                <Link to="/study" className="md:hidden btn-primary !h-9 !px-3.5 !text-xs no-underline">
                  Quiz
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="md:hidden btn-secondary !h-9 !px-4 !text-xs no-underline">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-dark !h-9 !px-5 !text-xs">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !h-9 !px-5 !text-sm no-underline">
                  Login
                </Link>
                <Link to="/register" className="btn-primary !h-9 !px-5 !text-sm no-underline">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
