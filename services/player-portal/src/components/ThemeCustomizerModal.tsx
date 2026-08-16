import React, { useState } from 'react';
import { Palette, Check, X, Sparkles, Sliders, Shield, MessageCircle } from 'lucide-react';
import { useTheme, ThemePreset } from '../context/ThemeContext';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { brand, setTheme, updateBrand, themeStyles } = useTheme();
  const [brandNameInput, setBrandNameInput] = useState(brand.brandName);
  const [taglineInput, setTaglineInput] = useState(brand.tagline);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrand({
      brandName: brandNameInput,
      tagline: taglineInput
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Brand & Visual Customizer</h2>
            <p className="text-xs text-slate-400">Switch color themes and configure custom branding</p>
          </div>
        </div>

        {/* Theme Presets Selector */}
        <div className="space-y-3">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
            Select Visual Theme Preset
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(themeStyles) as ThemePreset[]).map((themeKey) => {
              const style = themeStyles[themeKey];
              const isSelected = brand.theme === themeKey;

              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setTheme(themeKey)}
                  className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-slate-800/90 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{style.name}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  {/* Palette Preview Swatches */}
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full shadow" style={{ backgroundColor: style.primary }} />
                    <span className="w-4 h-4 rounded-full shadow" style={{ backgroundColor: style.accent }} />
                    <span className="w-4 h-4 rounded-full shadow border border-slate-700" style={{ backgroundColor: style.bg }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Brand Details */}
        <form onSubmit={handleSaveBrand} className="space-y-4 pt-2 border-t border-slate-800">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
            Custom Brand Identity
          </span>

          <div>
            <label className="text-xs font-semibold text-slate-300">Brand Name</label>
            <input
              type="text"
              value={brandNameInput}
              onChange={(e) => setBrandNameInput(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Tagline / Slogan</label>
            <input
              type="text"
              value={taglineInput}
              onChange={(e) => setTaglineInput(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedNotice ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Branding Updated!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
            >
              Save Branding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
