import React from 'react';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  section: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ section }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14 space-y-10">
      <div className="pb-5 border-b border-[#e5e5e5]">
        <Link to="/" className="text-xs font-medium text-[#707072] no-underline hover:text-[#111111]">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-medium mt-3 mb-2">
          {section === 'privacy'
            ? 'Privacy Policy & Data Protection'
            : 'Terms of Use & Educational Disclaimer'}
        </h1>
        <p className="text-sm text-[#707072] m-0">Last updated: November 2026</p>
      </div>

      {section === 'privacy' && (
        <div className="space-y-6 text-sm text-[#39393b] leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-[#111111]">1. Data We Collect</h2>
            <p>
              When you register for FIBA Referee Academy, we collect only your full name, email address, securely hashed password, and quiz attempt history so you can track your officiating progress.
            </p>
          </section>
          <section id="cookies">
            <h2 className="text-lg font-medium text-[#111111]">2. Cookies</h2>
            <p>
              Authentication uses a single strictly necessary session cookie to keep you signed in securely. We do not use third-party advertising trackers or sell personal information.
            </p>
          </section>
          <section id="gdpr">
            <h2 className="text-lg font-medium text-[#111111]">3. Your Rights &amp; Data Retention</h2>
            <p>
              You may request access to, correction of, or deletion of your account data at any time. Passwords are never stored in plaintext and cannot be viewed by administrators.
            </p>
          </section>
        </div>
      )}

      {section === 'terms' && (
        <div className="space-y-6 text-sm text-[#39393b] leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-[#111111]">1. Educational Purpose</h2>
            <p>
              FIBA Referee Academy provides rulebook study questions, explanations, and video case reviews for referee training. Official game decisions remain governed by the latest published FIBA Official Basketball Rules and Official Interpretations.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-[#111111]">2. Acceptable Use &amp; Admin Content</h2>
            <p>
              Users may not attempt automated scraping, credential stuffing, or unauthorized uploads. Admin accounts are restricted to authorized instructors uploading lawful basketball officiating training clips.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
