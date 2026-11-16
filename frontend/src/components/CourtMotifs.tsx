import React from 'react';

export const BasketballCrest: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <circle cx="18" cy="18" r="16.5" fill="#f54e00" stroke="#26251e" strokeWidth="2" />
    <path
      d="M2.5 18H33.5M18 1.5V34.5M7 6.5C11.5 11.5 11.5 24.5 7 29.5M29 6.5C24.5 11.5 24.5 24.5 29 29.5"
      stroke="#26251e"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const RefereeWhistleIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={className}
  >
    <path
      d="M4 11.5C4 8.46 6.46 6 9.5 6H20V10.5H15.8C15.93 10.98 16 11.48 16 12C16 15.31 13.31 18 10 18C6.69 18 4 15.09 4 11.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="12" r="2.2" fill="currentColor" />
    <path d="M12.5 6V3.5M15.5 6L17 4M9.5 6L8 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const FibaHalfCourtSvg: React.FC<{ className?: string; strokeColor?: string }> = ({
  className = '',
  strokeColor = 'rgba(255,255,255,0.16)',
}) => (
  <svg
    viewBox="0 0 560 360"
    fill="none"
    aria-hidden="true"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Boundary & centre circle */}
    <rect x="20" y="20" width="520" height="320" stroke={strokeColor} strokeWidth="2" />
    <circle cx="280" cy="20" r="64" stroke={strokeColor} strokeWidth="2" />
    {/* Restricted paint lane (key) */}
    <rect x="192" y="160" width="176" height="180" stroke={strokeColor} strokeWidth="2" />
    {/* Free throw circle */}
    <path d="M214 160 A66 66 0 0 1 346 160" stroke={strokeColor} strokeWidth="2" />
    <path
      d="M214 160 A66 66 0 0 0 346 160"
      stroke={strokeColor}
      strokeWidth="2"
      strokeDasharray="7 7"
    />
    {/* 3-point arc (6.75m stylized) */}
    <path d="M56 340 V255 C56 135 156 58 280 58 C404 58 504 135 504 255 V340" stroke={strokeColor} strokeWidth="2" />
    {/* No-Charge Semi-Circle (1.30m) + Backboard + Orange Rim */}
    <path d="M236 296 A44 44 0 0 1 324 296" stroke="#f54e00" strokeOpacity="0.6" strokeWidth="2.2" />
    <line x1="246" y1="312" x2="314" y2="312" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
    <circle cx="280" cy="296" r="10" stroke="#f54e00" strokeOpacity="0.75" strokeWidth="2.4" />
  </svg>
);

export const CourtKeyDiagramIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 21V11H16V21" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="11" r="4" stroke="#f54e00" strokeWidth="1.6" />
    <circle cx="12" cy="17" r="1.8" fill="#f54e00" />
  </svg>
);

export const ShotClockIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M7.5 14.5H10.5M7.5 9.5H10.5V12H7.5V14.5M14 9.5V12.5H16.5M16.5 9.5V14.5" stroke="#f54e00" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
