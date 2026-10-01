'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  variant?: 'light' | 'dark';
  className?: string;
}

export function Logo({
  size = 'md',
  showText = true,
  subtitle,
  variant = 'light',
  className = '',
}: LogoProps) {
  // Dimensions
  const dimMap = {
    sm: { box: 'w-7 h-7', img: 28, text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10', img: 40, text: 'text-xl', sub: 'text-xs' },
    lg: { box: 'w-12 h-12', img: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', img: 64, text: 'text-3xl', sub: 'text-sm' },
  };

  const dim = dimMap[size];
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Emblem: Dynamic Flight 'V' with Verified Stamp */}
      <div
        className={`${dim.box} relative shrink-0 rounded-xl overflow-hidden shadow-sm border ${
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200/80 bg-white'
        } flex items-center justify-center transition-transform hover:scale-105`}
      >
        <Image
          src="/logo.jpg"
          alt="Logo Visa Gestion"
          width={dim.img}
          height={dim.img}
          className="object-cover w-full h-full rounded-xl"
          priority
        />
      </div>

      {/* Typography */}
      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-extrabold tracking-tight font-sans ${dim.text} ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Visa Gestion
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
              B2B
            </span>
          </div>
          {subtitle !== undefined ? (
            <p className={`${dim.sub} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          ) : (
            <p className={`${dim.sub} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Hub sécurisé pour agences
            </p>
          )}
        </div>
      )}
    </div>
  );
}
