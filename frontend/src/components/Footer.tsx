import React from 'react';
import { Link } from 'react-router-dom';
import { BasketballCrest } from './CourtMotifs';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 bg-white border-t border-[#e6e5e0]">
      <div className="h-1.5 w-full referee-stripes opacity-85" />
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-12 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <BasketballCrest size={26} />
              <span className="font-semibold text-sm text-[#26251e]">FIBA REF ACADEMY</span>
            </div>
            <p className="text-xs text-[#5a5852] leading-relaxed m-0">
              Court-tested video officiating exam prep aligned with the 2026 Official FIBA Basketball Rules &amp; OBRI Interpretations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#26251e] m-0 mb-3">
              Contact Information
            </h4>
            <ul className="list-none p-0 m-0 space-y-2 text-[#5a5852] text-xs">
              <li>Support: support@fibaref.org</li>
              <li>Instructor Desk: officials@fibaref.org</li>
              <li>Hours: Mon–Fri, 09:00–17:00 CET</li>
              <li>Liaison: National Federation Referee Support</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#26251e] m-0 mb-3">
              Platform
            </h4>
            <ul className="list-none p-0 m-0 space-y-2 text-[#5a5852] text-xs">
              <li>
                <Link to="/" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  Home &amp; Licensing Pathway
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  Referee Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  Create Referee Account
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  Admin Question &amp; Video Studio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#26251e] m-0 mb-3">
              Privacy &amp; Legal
            </h4>
            <ul className="list-none p-0 m-0 space-y-2 text-[#5a5852] text-xs">
              <li>
                <Link to="/privacy" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  Privacy Policy &amp; Data Processing
                </Link>
              </li>
              <li>
                <Link to="/privacy#cookies" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  Cookies
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  Terms of Service &amp; Educational Use
                </Link>
              </li>
              <li>
                <Link to="/privacy#gdpr" className="text-[#5a5852] hover:text-[#f54e00] no-underline">
                  GDPR User Rights &amp; Data Retention
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#e6e5e0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#807d72]">
          <span>
            © 2026 FIBA Referee Academy · Independent educational training platform referencing Official FIBA Basketball Rules.
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="text-[#807d72] hover:text-[#26251e] no-underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-[#807d72] hover:text-[#26251e] no-underline">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
