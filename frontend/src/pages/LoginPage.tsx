import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../api/client';
import { BasketballCrest, FibaHalfCourtSvg } from '../components/CourtMotifs';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const profile = await api.login(email, password);
      setUser(profile);
      navigate(profile.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to reach authentication service.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-14">
      <div className="border border-[#e6e5e0] bg-white rounded-2xl overflow-hidden">
        {/* Arena Dark Court Header */}
        <div className="relative bg-[#26251e] text-white p-7 overflow-hidden">
          <FibaHalfCourtSvg
            className="absolute -right-8 -bottom-6 w-[240px] h-[160px] opacity-35 pointer-events-none"
            strokeColor="rgba(247,247,244,0.25)"
          />
          <div className="relative z-10 flex items-center gap-3 mb-3">
            <BasketballCrest size={28} />
            <span className="text-[11px] font-mono-clock uppercase tracking-widest text-[#f54e00] font-semibold">
              FIBA Referee Academy
            </span>
          </div>
          <h1 className="relative z-10 text-2xl md:text-3xl font-medium m-0 text-white">
            Sign In to Your Account
          </h1>
          <p className="relative z-10 text-xs md:text-sm text-[#cfcdc4] mt-1.5 mb-0">
            Access Official FIBA rulebook video case studies, track your quiz accuracy, or manage rules as an Admin.
          </p>
        </div>

        <div className="p-7 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg border border-[#cf2d56] bg-[#fafaf7] text-sm text-[#cf2d56] font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-[#5a5852] mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="referee@fibaref.org"
                className="w-full h-11 px-4 rounded-lg border border-[#cfcdc4] text-sm text-[#26251e] outline-none focus:border-[#f54e00]"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-medium text-[#5a5852] mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-4 rounded-lg border border-[#cfcdc4] text-sm text-[#26251e] outline-none focus:border-[#f54e00]"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing In...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e6e5e0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a5852]">
            <span>New to FIBA Referee Academy?</span>
            <Link to="/register" className="text-[#f54e00] font-semibold underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
