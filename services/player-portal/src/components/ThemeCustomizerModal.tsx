import React, { useState } from 'react';
import { Palette, Check, X, Sparkles, Sliders, Shield, MessageCircle, ExternalLink } from 'lucide-react';
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
      <div className="w-full max-w-xl bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 shadow-2xl relative z-10 space-y-6 max-h-[90vh] overflow-y-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-white rounded-lg bg-[#272727] hover:bg-[#333] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f36c21] to-[#BB973B] flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Platform Theme & Whitelabel Presets</h2>
            <p className="text-xs text-[#adadad]">1-Click switch between 4 reverse-engineered benchmark platforms</p>
          </div>
        </div>

        {/* Theme Presets Selector */}
        <div className="space-y-3">
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#adadad] block">
            Select Live Benchmark Replica Theme
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
                  className={`p-3.5 rounded-xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#f36c21] bg-[#242424] shadow-lg shadow-[#f36c21]/20 scale-[1.01]'
                      : 'border-[#2d2d2d] bg-[#161616] hover:border-[#3d3d3d]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{style.name}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#f36c21] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#888] mb-2 font-mono">{style.platformRef}</div>

                  {/* Palette Preview Swatches */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#262626]">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-3.5 h-3.5 rounded-full shadow" title="Primary" style={{ backgroundColor: style.primary }} />
                      <span className="w-3.5 h-3.5 rounded-full shadow" title="Back Odds" style={{ backgroundColor: style.backOdds }} />
                      <span className="w-3.5 h-3.5 rounded-full shadow" title="Lay Odds" style={{ backgroundColor: style.layOdds }} />
                      <span className="w-3.5 h-3.5 rounded-full shadow border border-[#444]" title="Background" style={{ backgroundColor: style.bg }} />
                    </div>
                    <span className="text-[9px] text-[#aaa]">{style.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Brand Details */}
        <form onSubmit={handleSaveBrand} className="space-y-4 pt-2 border-t border-[#2d2d2d]">
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#adadad] block">
            Whitelabel Identity Details
          </span>

          <div>
            <label className="text-xs font-semibold text-[#ddd]">Brand Name</label>
            <input
              type="text"
              value={brandNameInput}
              onChange={(e) => setBrandNameInput(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 bg-[#121212] border border-[#333] rounded-lg text-xs text-white focus:outline-none focus:border-[#f36c21]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#ddd]">Tagline / Slogan</label>
            <input
              type="text"
              value={taglineInput}
              onChange={(e) => setTaglineInput(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 bg-[#121212] border border-[#333] rounded-lg text-xs text-white focus:outline-none focus:border-[#f36c21]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedNotice ? (
              <span className="text-xs text-[#27AE60] font-bold flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Theme & Whitelabel Updated!</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#f36c21] hover:bg-[#e05b11] text-white font-bold text-xs shadow-md transition-all uppercase"
            >
              Save Whitelabel Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
