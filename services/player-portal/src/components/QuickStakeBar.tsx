import React, { useState, useEffect } from 'react';
import { Settings2, Check, X, Coins } from 'lucide-react';

interface QuickStakeBarProps {
  currentStake: number;
  onSelectStake: (amount: number) => void;
}

const DEFAULT_STAKES = [100, 500, 1000, 2500, 5000, 10000];

export const QuickStakeBar: React.FC<QuickStakeBarProps> = ({
  currentStake,
  onSelectStake
}) => {
  const [stakes, setStakes] = useState<number[]>(() => {
    const saved = localStorage.getItem('nexus_quick_stakes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_STAKES;
      }
    }
    return DEFAULT_STAKES;
  });

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingValues, setEditingValues] = useState<number[]>([...stakes]);

  const handleSaveStakes = () => {
    setStakes([...editingValues]);
    localStorage.setItem('nexus_quick_stakes', JSON.stringify(editingValues));
    setIsEditOpen(false);
  };

  const handleResetDefaults = () => {
    setEditingValues([...DEFAULT_STAKES]);
  };

  return (
    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1 select-none">
      <span className="text-[10px] uppercase font-bold text-[#888] shrink-0 mr-1 flex items-center gap-1">
        <Coins className="w-3 h-3 text-[#f36c21]" />
        <span>Quick Stake:</span>
      </span>

      {stakes.map((val, idx) => {
        const isSelected = currentStake === val;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectStake(val)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
              isSelected
                ? 'bg-[#f36c21] text-white shadow font-black'
                : 'bg-[#272727] hover:bg-[#333] text-[#adadad] hover:text-white border border-[#333]'
            }`}
          >
            +{val >= 1000 ? `${val / 1000}k` : val}
          </button>
        );
      })}

      {/* Edit Stakes Button */}
      <button
        type="button"
        onClick={() => {
          setEditingValues([...stakes]);
          setIsEditOpen(true);
        }}
        className="p-1 rounded-lg bg-[#272727] hover:bg-[#333] text-[#888] hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
        title="Customize Stake Buttons"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>

      {/* Edit Stakes Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2.5">
              <div className="flex items-center space-x-2">
                <Settings2 className="w-4 h-4 text-[#f36c21]" />
                <h4 className="font-black text-sm">Edit Quick Stakes</h4>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-[#888] hover:text-white rounded bg-[#272727]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {editingValues.map((val, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[10px] text-[#888] uppercase font-bold">Button {idx + 1}</label>
                  <input
                    type="number"
                    min={10}
                    value={val}
                    onChange={(e) => {
                      const newVals = [...editingValues];
                      newVals[idx] = Math.max(10, parseInt(e.target.value, 10) || 100);
                      setEditingValues(newVals);
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#333] rounded-lg text-xs font-mono font-bold text-white outline-none focus:border-[#f36c21]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-2 rounded-xl bg-[#272727] hover:bg-[#333] text-[11px] font-bold text-[#adadad]"
              >
                Reset Default
              </button>
              <button
                type="button"
                onClick={handleSaveStakes}
                className="px-4 py-2 rounded-xl bg-[#f36c21] hover:bg-[#e05b12] text-white text-[11px] font-black uppercase tracking-wider"
              >
                Save Stakes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
