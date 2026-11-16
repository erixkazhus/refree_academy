import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiClientError } from '../api/client';
import { BasketballCrest, FibaHalfCourtSvg } from '../components/CourtMotifs';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const profile = await api.register(fullName, email, password);
      setUser(profile);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else {
        setError('Unable to reach registration service.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-14">
      <div className="border border-[#e6e5e0] bg-white rounded-2xl overflow-hidden">
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
            Create Referee Account
          </h1>
          <p className="relative z-10 text-xs md:text-sm text-[#cfcdc4] mt-1.5 mb-0">
            Register as a referee candidate to study Official FIBA video cases and save your quiz performance.
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
              <label htmlFor="reg-name" className="block text-xs font-medium text-[#5a5852] mb-1.5">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Petrov"
                className="w-full h-11 px-4 rounded-lg border border-[#cfcdc4] text-sm text-[#26251e] outline-none focus:border-[#f54e00]"
              />
              {fieldErrors.fullName && <p className="text-xs text-[#cf2d56] mt-1 mb-0">{fieldErrors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-[#5a5852] mb-1.5">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="referee@example.com"
                className="w-full h-11 px-4 rounded-lg border border-[#cfcdc4] text-sm text-[#26251e] outline-none focus:border-[#f54e00]"
              />
              {fieldErrors.email && <p className="text-xs text-[#cf2d56] mt-1 mb-0">{fieldErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-[#5a5852] mb-1.5">
                Password (10+ chars, uppercase, lowercase, digit &amp; symbol)
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="StrongFibaPass#2026"
                className="w-full h-11 px-4 rounded-lg border border-[#cfcdc4] text-sm text-[#26251e] outline-none focus:border-[#f54e00]"
              />
              {fieldErrors.password && <p className="text-xs text-[#cf2d56] mt-1 mb-0">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-medium text-[#5a5852] mb-1.5">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full h-11 px-4 rounded-lg border border-[#cfcdc4] text-sm text-[#26251e] outline-none focus:border-[#f54e00]"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating Account...' : 'Register'}
            </button>

            <p className="text-xs text-[#5a5852] m-0 leading-relaxed">
              By registering, you acknowledge our{' '}
              <Link to="/privacy" className="text-[#26251e] underline">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link to="/terms" className="text-[#26251e] underline">
                Terms of Service
              </Link>
              .
            </p>
          </form>

          <div className="mt-6 pt-5 border-t border-[#e6e5e0] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a5852]">
            <span>Already have an account?</span>
            <Link to="/login" className="text-[#f54e00] font-semibold underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
