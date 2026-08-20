import React, { useState, useEffect } from 'react';
import {
  Gift,
  X,
  Sparkles,
  Zap,
  Coins,
  Trophy,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardWon: (amount: number, description: string) => void;
  user: any;
}

const SEGMENTS = [
  { label: '₹50 Bonus', amount: 50, color: '#f36c21' },
  { label: '₹100 Cash', amount: 100, color: '#27AE60' },
  { label: '₹500 Jackpot', amount: 500, color: '#9b59b6' },
  { label: '5% Match', amount: 75, color: '#3498db' },
  { label: '₹1,000 Super', amount: 1000, color: '#e74c3c' },
  { label: '2x Token', amount: 150, color: '#f1c40f' },
  { label: '₹200 Free', amount: 200, color: '#1abc9c' },
  { label: '10% Cash', amount: 250, color: '#e67e22' }
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  onRewardWon,
  user
}) => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [wonPrize, setWonPrize] = useState<any | null>(null);
  const [canSpin, setCanSpin] = useState<boolean>(true);
  const [cooldownRemaining, setCooldownRemaining] = useState<string>('');

  useEffect(() => {
    const lastSpin = localStorage.getItem('nexus_last_spin_time');
    if (lastSpin) {
      const diff = Date.now() - parseInt(lastSpin, 10);
      const dayMs = 24 * 60 * 60 * 1000;
      if (diff < dayMs) {
        setCanSpin(false);
        const remainingHours = Math.ceil((dayMs - diff) / (1000 * 60 * 60));
        setCooldownRemaining(`${remainingHours}h remaining`);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning || !canSpin) return;

    setSpinning(true);
    setWonPrize(null);

    // Generate random rotations: at least 5 full spins + random segment
    const prizeIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // We target the prize angle
    const targetAngle = 360 * 5 + (SEGMENTS.length - 1 - prizeIndex) * segmentAngle + segmentAngle / 2;

    setRotation(targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const prize = SEGMENTS[prizeIndex];
      setWonPrize(prize);
      setCanSpin(false);
      localStorage.setItem('nexus_last_spin_time', Date.now().toString());
      setCooldownRemaining('24h remaining');

      if (onRewardWon) {
        onRewardWon(prize.amount, `Daily Lucky Wheel Reward: ${prize.label}`);
      }
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#2d2d2d] rounded-3xl p-6 shadow-2xl relative text-white space-y-5 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f36c21]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#adadad] hover:text-white rounded-lg bg-[#272727] hover:bg-[#333] transition-colors cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="space-y-1 relative z-10">
          <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-black text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>DAILY REWARD ARENA</span>
          </div>
          <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-[#f36c21] via-amber-300 to-white bg-clip-text text-transparent">
            LUCKY SPIN WHEEL
          </h2>
          <p className="text-[11px] text-[#adadad]">Spin daily to win free betting credits & bonus boosts</p>
        </div>

        {/* Wheel Graphic Container */}
        <div className="relative w-64 h-64 mx-auto my-2 z-10">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* Rotating Wheel */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_30px_rgba(243,108,33,0.3)] relative overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
            }}
          >
            {/* SVG Wheel Pie Segments */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {SEGMENTS.map((seg, idx) => {
                const angle = 360 / SEGMENTS.length;
                const startAngle = idx * angle;
                const endAngle = (idx + 1) * angle;
                const rad1 = (startAngle * Math.PI) / 180;
                const rad2 = (endAngle * Math.PI) / 180;
                const x1 = 50 + 50 * Math.sin(rad1);
                const y1 = 50 - 50 * Math.cos(rad1);
                const x2 = 50 + 50 * Math.sin(rad2);
                const y2 = 50 - 50 * Math.cos(rad2);

                return (
                  <g key={idx}>
                    <path
                      d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                      fill={seg.color}
                      stroke="#1e1e1e"
                      strokeWidth="0.5"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Segment Labels */}
            {SEGMENTS.map((seg, idx) => {
              const angle = (360 / SEGMENTS.length) * idx + 360 / SEGMENTS.length / 2;
              return (
                <div
                  key={idx}
                  className="absolute top-0 left-0 w-full h-full flex items-start justify-center pt-3 pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  <span className="text-[9px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase tracking-tighter">
                    {seg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#1e1e1e] border-2 border-amber-400 flex items-center justify-center shadow-2xl z-10">
            <Gift className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* Won Prize Notice */}
        {wonPrize && (
          <div className="p-3 bg-[#27AE60]/20 border border-[#27AE60] rounded-2xl animate-in zoom-in-95 space-y-1">
            <div className="flex items-center justify-center space-x-1 text-[#27AE60] font-black text-xs">
              <Trophy className="w-4 h-4" />
              <span>CONGRATULATIONS! YOU WON</span>
            </div>
            <div className="text-lg font-black text-white">{wonPrize.label}</div>
            <div className="text-[10px] text-[#adadad]">₹{wonPrize.amount} credited to your available balance</div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSpin}
          disabled={spinning || !canSpin}
          className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center space-x-2 ${
            canSpin && !spinning
              ? 'bg-gradient-to-r from-[#f36c21] via-amber-500 to-[#e05b12] text-white hover:scale-[1.02] active:scale-95 cursor-pointer shadow-orange-600/30'
              : 'bg-[#272727] text-[#888] border border-[#333] cursor-not-allowed'
          }`}
        >
          {spinning ? (
            <span>SPINNING WHEEL...</span>
          ) : canSpin ? (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>SPIN WHEEL FOR FREE</span>
            </>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs text-[#888]">
              <Clock className="w-4 h-4" />
              <span>SPUN TODAY ({cooldownRemaining})</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
