import React from 'react';
import { X, Globe, Check } from 'lucide-react';
import { LanguageCode, LanguageMeta, useI18n } from '../services/i18nService';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { lang, setLanguage, languages } = useI18n();

  if (!isOpen) return null;

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-5 shadow-2xl relative text-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#f36c21]/20 border border-[#f36c21]/40 flex items-center justify-center">
              <Globe className="w-4 h-4 text-[#f36c21]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Select Language</h3>
              <p className="text-[11px] text-[#adadad]">Choose your preferred display language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#adadad] hover:text-white rounded-lg bg-[#272727] hover:bg-[#333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {languages.map((item: LanguageMeta) => {
            const isSelected = lang === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleSelectLanguage(item.code)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#f36c21]/15 border-[#f36c21] text-white shadow-md'
                    : 'bg-[#272727] hover:bg-[#333] border-[#333] text-[#adadad] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">{item.flag}</span>
                  <div>
                    <div className="text-xs font-bold">{item.nativeName}</div>
                    <div className="text-[10px] text-[#888]">{item.label}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#f36c21]" />}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="bg-[#141414] p-2.5 rounded-xl border border-[#272727] text-center text-[10px] text-[#888]">
          Language preference is automatically saved for future sessions.
        </div>
      </div>
    </div>
  );
};
