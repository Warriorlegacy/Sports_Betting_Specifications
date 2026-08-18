import React, { useState, useEffect } from 'react';
import { X, Check, Sliders, DollarSign, Sparkles, RefreshCw, Layers } from 'lucide-react';

const STORAGE_KEY = 'nexus_custom_quick_stakes';
export const DEFAULT_QUICK_STAKES = [100, 500, 1000, 2500, 5000, 10000];

export function getSavedQuickStakes(): number[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === 6) {
        return parsed.map((n) => Number(n) || 100);
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_QUICK_STAKES;
}

export function saveQuickStakes(stakes: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stakes));
  } catch {
    // ignore
  }
}

interface QuickStakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStakes: number[]) => void;
}

export const QuickStakeModal: React.FC<QuickStakeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [stakes, setStakes] = useState<number[]>(getSavedQuickStakes());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStakes(getSavedQuickStakes());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleChange = (index: number, val: string) => {
    const num = Math.max(10, parseInt(val) || 0);
    const updated = [...stakes];
    updated[index] = num;
    setStakes(updated);
  };

  const handleApplyPreset = (preset: number[]) => {
    setStakes(preset);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveQuickStakes(stakes);
    onSave(stakes);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  const presets = [
    { label: 'Low Stakes', values: [50, 100, 250, 500, 1000, 2500] },
    { label: 'Standard (Default)', values: [100, 500, 1000, 2500, 5000, 10000] },
    { label: 'High Roller VIP', values: [1000, 5000, 10000, 25000, 50000, 100000] }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-5 shadow-2xl space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d2d2d]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f36c21] to-amber-400 flex items-center justify-center shadow">
              <Sliders className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-white">Edit Quick Stake Buttons</h3>
              <p className="text-[11px] text-[#adadad]">Configure your 6 one-click betting values</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#272727] text-[#adadad] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#adadad] uppercase block">Quick Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p.values)}
                className="px-2 py-1.5 rounded-lg bg-[#272727] hover:bg-[#333] border border-[#383838] text-[10px] font-bold text-[#e0e0e0] transition-colors text-center truncate"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Custom Stake Inputs */}
        <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-[#2d2d2d]">
          <label className="text-[10px] font-bold text-amber-400 uppercase block">
            Custom Button Values (₹ INR)
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {stakes.map((val, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[9px] text-[#8e8e8e] font-mono block">Button {idx + 1}</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-[#8e8e8e]">₹</span>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={val}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="w-full bg-[#141414] border border-[#444] focus:border-[#f36c21] rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={() => setStakes(DEFAULT_QUICK_STAKES)}
              className="px-3 py-2 rounded-lg bg-[#272727] hover:bg-[#333] text-xs font-bold text-[#adadad] flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] text-white font-black text-xs uppercase flex items-center justify-center space-x-1.5 shadow transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Button Values</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
