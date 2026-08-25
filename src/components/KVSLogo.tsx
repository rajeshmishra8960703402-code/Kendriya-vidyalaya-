import React from 'react';
import { AppConfig } from '../types';

interface KVSLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  appConfig?: AppConfig;
}

export const KVSLogo: React.FC<KVSLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  appConfig
}) => {
  const badgeText = 'PM SHRI';
  const shiftText = appConfig?.shiftInfo || 'First Shift';
  const institutionText = appConfig?.institutionName || 'PM SHRI KENDRIYA VIDYALAYA SITAPUR';
  const classText = appConfig?.classInfo || 'Class 11th';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Either custom uploaded logo image or authentic KVS SVG emblem */}
      {appConfig?.customLogoUrl ? (
        <div
          className="relative flex items-center justify-center rounded-2xl overflow-hidden shadow-xs bg-white border border-[#e5e1da] p-0.5 flex-shrink-0"
          style={{ width: size, height: size }}
        >
          <img
            src={appConfig.customLogoUrl}
            alt="School Logo"
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div
          className="relative flex items-center justify-center rounded-2xl overflow-hidden shadow-xs bg-white border border-[#e5e1da] p-0.5 flex-shrink-0"
          style={{ width: size, height: size }}
          title="Kendriya Vidyalaya Sangathan (KVS) Emblem"
        >
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <path id="kvsTopArc" d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
              <path id="kvsBottomArc" d="M 170 106 A 72 72 0 0 1 30 106" fill="none" />
              <linearGradient id="kvsSunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="kvsTirangaSaffron" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9933" />
                <stop offset="100%" stopColor="#E65100" />
              </linearGradient>
              <linearGradient id="kvsTirangaGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
            </defs>

            {/* Outer circles */}
            <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="#0D47A1" strokeWidth="4.5" />
            <circle cx="100" cy="100" r="90" fill="#F8FAFC" stroke="#D97706" strokeWidth="1.8" strokeDasharray="3,2" />
            <circle cx="100" cy="100" r="74" fill="#FFFFFF" stroke="#0D47A1" strokeWidth="2.5" />

            {/* Arc text */}
            <text fontSize="11" fontWeight="900" fill="#0D47A1" letterSpacing="0.8">
              <textPath href="#kvsTopArc" startOffset="50%" textAnchor="middle">
                केन्द्रीय विद्यालय संगठन
              </textPath>
            </text>
            <text fontSize="8.5" fontWeight="800" fill="#0D47A1" letterSpacing="0.5">
              <textPath href="#kvsBottomArc" startOffset="50%" textAnchor="middle">
                KENDRIYA VIDYALAYA SANGATHAN
              </textPath>
            </text>

            {/* 15 Sun Rays */}
            <g fill="url(#kvsSunGrad)" stroke="#B45309" strokeWidth="0.5">
              <polygon points="100,32 103,50 97,50" />
              <polygon points="82,36 89,52 83,54" />
              <polygon points="118,36 117,54 111,52" />
              <polygon points="66,45 76,58 71,62" />
              <polygon points="134,45 129,62 124,58" />
              <polygon points="53,58 66,68 62,72" />
              <polygon points="147,58 138,72 134,68" />
              <polygon points="44,74 58,80 56,85" />
              <polygon points="156,74 144,85 142,80" />
              <polygon points="40,92 56,93 55,98" />
              <polygon points="160,92 145,98 144,93" />
            </g>

            {/* Sun core */}
            <circle cx="100" cy="98" r="26" fill="url(#kvsSunGrad)" stroke="#B45309" strokeWidth="1.5" />
            <path d="M 74 98 Q 100 84 126 98 Z" fill="#FDE68A" opacity="0.8" />

            {/* Tricolor */}
            <path d="M 64 106 Q 100 88 136 106 Q 120 114 100 110 Q 80 114 64 106 Z" fill="url(#kvsTirangaSaffron)" />
            <path d="M 66 112 Q 100 96 134 112 Q 120 120 100 116 Q 80 120 66 112 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
            <path d="M 68 118 Q 100 104 132 118 Q 118 126 100 122 Q 82 126 68 118 Z" fill="url(#kvsTirangaGreen)" />

            {/* Book */}
            <g>
              <path d="M 100 122 Q 80 114 56 120 L 56 142 Q 80 134 100 144 Q 120 134 144 142 L 144 120 Q 120 114 100 122 Z" fill="#0D47A1" />
              <path d="M 98 124 Q 80 116 58 122 L 58 139 Q 80 132 98 141 Z" fill="#FFFFFF" />
              <path d="M 102 124 Q 120 116 142 122 L 142 139 Q 120 132 102 141 Z" fill="#FFFFFF" />
              <line x1="100" y1="122" x2="100" y2="144" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
            </g>

            {/* Motto */}
            <g>
              <path d="M 44 154 Q 100 144 156 154 L 152 165 Q 100 156 48 165 Z" fill="#B91C1C" stroke="#D97706" strokeWidth="0.8" />
              <text x="100" y="161.5" fontSize="6.8" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">
                तत् त्वं पूषन् अपावृणु
              </text>
            </g>
          </svg>
        </div>
      )}

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#4a5d23] bg-[#eef0e7] px-1.5 py-0.5 rounded-md border border-[#4a5d23]/30">
              {badgeText}
            </span>
            <span className="text-[10px] font-bold text-[#8c8577]">
              {shiftText}
            </span>
            <span className="text-[10px] font-semibold text-[#8c8577]">
              • {classText}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-extrabold text-[#2d3a16] tracking-tight leading-tight mt-0.5 truncate">
            {institutionText}
          </h1>
          <span className="text-[10px] font-medium text-[#8c8577] leading-tight truncate">
            Kendriya Vidyalaya Sangathan (Lucknow Region)
          </span>
        </div>
      )}
    </div>
  );
};
