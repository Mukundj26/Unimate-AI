import React from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, LanguageOption } from '../context/LanguageContext.tsx';
import { SupportedLanguage } from '../types.ts';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'pills' | 'compact' | 'banner';
  className?: string;
  label?: string;
  showInfo?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'pills',
  className = '',
  label,
  showInfo = false,
}) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => {
            const isActive = language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                title={`Switch language to ${lang.name} (${lang.nativeName})`}
                className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-2xs border border-indigo-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span className="text-xs leading-none">{lang.flag}</span>
                <span className="hidden sm:inline">{lang.nativeName}</span>
                <span className="sm:hidden">{lang.code.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-slate-50 p-3.5 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span>{label || 'AI Output & Explanation Language / भाषा'}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                Active: {language}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              AI answers, quizzes, resumes, tutor explanations, and study guides will be generated in your selected language.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => {
            const isActive = language === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                <span className={isActive ? 'text-indigo-200 text-[10px]' : 'text-slate-400 text-[10px]'}>
                  ({lang.nativeName})
                </span>
                {isActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default 'pills'
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}>
      {label && (
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span>{label}</span>
        </span>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => {
          const isActive = language === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs font-bold ring-2 ring-indigo-200/50'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
              <span className="text-[10px] text-slate-400 font-normal">({lang.nativeName})</span>
              {isActive && <Check className="w-3 h-3 text-indigo-600 ml-0.5" />}
            </button>
          );
        })}
      </div>
      {showInfo && (
        <span className="text-[11px] text-slate-400 ml-1">
          (AI generates responses in {language})
        </span>
      )}
    </div>
  );
};
