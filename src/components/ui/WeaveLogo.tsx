import React from 'react';

interface WeaveLogoProps {
  className?: string;
  markOnly?: boolean;
  tone?: 'dark' | 'light';
}

/**
 * Custom architectural crest and wordmark for EduVerify.
 * Combines a precision octagonal trust seal, interwoven APAAR ledger threads,
 * and a champagne-gold verification keystone.
 */
export const WeaveLogo: React.FC<WeaveLogoProps> = ({
  className = '',
  markOnly = false,
  tone = 'dark',
}) => {
  const isLight = tone === 'light';

  return (
    <span className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#1C1A17] via-[#2A2621] to-[#141311] border border-[#C5A059]/60 shadow-sm shrink-0 overflow-hidden">
        {/* Subtle warm gold inner sheen */}
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_25%_20%,#E6C885,transparent_65%)]"
        />
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer octagonal verification shield */}
          <path
            d="M14 2.2L22.5 5.8V13.8C22.5 19.4 18.8 23.8 14 25.8C9.2 23.8 5.5 19.4 5.5 13.8V5.8L14 2.2Z"
            stroke="#D4AF37"
            strokeWidth="1.4"
            fill="rgba(197, 160, 89, 0.08)"
          />
          {/* Inner architectural ledger strata */}
          <path
            d="M9.2 10.2H18.8M9.2 14H15.2M9.2 17.8H13.5"
            stroke="#FAF6EE"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Golden verification check & keystone */}
          <path
            d="M14.2 16.8L16.4 19L20.2 13.8"
            stroke="#E6C675"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="6.4" r="1.4" fill="#E6C675" />
        </svg>
      </span>

      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display font-bold tracking-tight text-lg ${
              isLight ? 'text-[#FAF7F0]' : 'text-[#23201B]'
            }`}
          >
            Edu<span className="text-[#B88938]">Verify</span>
          </span>
          <span
            className={`font-mono text-[9px] uppercase tracking-[0.22em] mt-0.5 ${
              isLight ? 'text-[#D4AF37]/85' : 'text-[#7A7265]'
            }`}
          >
            APAAR · TRUST LEDGER
          </span>
        </span>
      )}
    </span>
  );
};
