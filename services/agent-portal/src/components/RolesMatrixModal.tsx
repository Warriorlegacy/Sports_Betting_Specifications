import React from 'react';
import { Shield, X, Check, Award, Lock, Zap, ArrowRight } from 'lucide-react';

interface RolesMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RolesMatrixModal: React.FC<RolesMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const roles = [
    {
      role: 'ADMIN',
      level: 'Level 0',
      title: 'Global Platform Admin (Root)',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Supreme exchange administrator with full platform ownership, credit genesis, and market settlement power.',
      responsibilities: [
        'Maintain overall platform liquidity and exchange reserve solvency',
        'Add & manage multiple Bank accounts and UPI/QR code deposit gateways',
        'Oversee global risk exposure and execute market settlement / voiding',
        'Audit and approve/reject player deposits and withdrawals'
      ],
      powers: [
        'Unlimited Genesis Credit Allocation',
        'Create Super Master, Master, Agent, and Player accounts',
        'Full Bank & UPI/QR gateway configuration',
        'Deposit & Withdrawal Approve / Reject clearing',
        'Reset credentials & reassign roles for any account',
        'Market Kill-Switch & Settlement controls'
      ]
    },
    {
      role: 'SUPER_MASTER',
      level: 'Level 1',
      title: 'Super Master (Regional Agency)',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      description: 'Regional franchise distributor overseeing multi-territory Master agencies.',
      responsibilities: [
        'Distribute credit lines to regional Masters within assigned credit limits',
        'Oversee regional betting volume turnover and downline risk exposure',
        'Monitor performance and compliance of downline agencies'
      ],
      powers: [
        'Create & provision Master accounts',
        'Allocate and recall credit to direct Master agencies',
        'View regional bet records and downline risk summaries',
        'Suspend or activate subordinate Master accounts'
      ]
    },
    {
      role: 'MASTER',
      level: 'Level 2',
      title: 'Master (City / Franchise Agency)',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'City / territory agency operator managing retail bookmakers and agents.',
      responsibilities: [
        'Manage local network of retail bookmakers and agents',
        'Distribute credit lines to direct retail agents',
        'Monitor city-wide daily turnover and exposure'
      ],
      powers: [
        'Create & provision retail Agent accounts',
        'Allocate and recall credit to direct Agents',
        'Inspect downline agent player bets and risk positions',
        'Suspend or activate subordinate Agent accounts'
      ]
    },
    {
      role: 'AGENT',
      level: 'Level 3',
      title: 'Retail Agent (Local Bookmaker)',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Direct retail point-of-contact onboarding players and managing retail player balances.',
      responsibilities: [
        'Direct customer onboarding and player relationship management',
        'Distribute betting credit to verified players',
        'Monitor retail player bet placement and settle cash balances'
      ],
      powers: [
        'Create direct Player (USER) accounts with starter credit',
        'Allocate and recall credit to player accounts',
        'Inspect live bets of direct players',
        'Suspend or activate player accounts'
      ]
    },
    {
      role: 'USER',
      level: 'Level 4',
      title: 'Player / Bettor (End Trader)',
      badge: 'bg-slate-700 text-slate-300 border-slate-600',
      description: 'Direct exchange trader placing Back/Lay bets, building parlays, and trading live sports.',
      responsibilities: [
        'Deposit funds via Admin bank accounts or UPI QR codes',
        'Place responsible sports bets and manage open liabilities',
        'Request timely withdrawals of winnings'
      ],
      powers: [
        'Place Back and Lay bets on live sports exchange',
        'Cash out open positions early for guaranteed profit/loss',
        'Submit deposit requests with 12-digit UTR',
        'Submit IMPS/UPI withdrawal requests'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#1e1e1e] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-[#f36c21] border border-[#f36c21]/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">5-Tier Role & Authority Matrix</h3>
              <p className="text-xs text-zinc-400">Clear specification of roles, responsibilities, abilities, and powers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#242424] hover:bg-[#333] text-zinc-400 hover:text-white border border-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {roles.map((r) => (
            <div
              key={r.role}
              className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                    r.role === 'ADMIN'
                      ? 'bg-orange-500/20 text-[#f36c21] border-[#f36c21]/30'
                      : r.badge
                  }`}>
                    {r.level} • {r.role}
                  </span>
                  <h4 className="font-bold text-sm text-white">{r.title}</h4>
                </div>
                <span className="text-xs text-zinc-400 italic">{r.description}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                {/* Responsibilities */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#1e1e1e] border border-zinc-800">
                  <span className="text-[11px] uppercase font-bold text-zinc-400 block tracking-wider">
                    Core Responsibilities
                  </span>
                  <ul className="space-y-1 text-zinc-300">
                    {r.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-[#f36c21] font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Abilities & Powers */}
                <div className="space-y-1.5 p-3 rounded-xl bg-[#1e1e1e] border border-zinc-800">
                  <span className="text-[11px] uppercase font-bold text-emerald-400 block tracking-wider">
                    Abilities & System Powers
                  </span>
                  <ul className="space-y-1 text-zinc-300">
                    {r.powers.map((pow, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pow}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e0540b] hover:from-[#ff7a33] hover:to-[#f36c21] text-white font-bold text-xs shadow-lg shadow-orange-600/25 transition-all"
          >
            Close Role Matrix
          </button>
        </div>
      </div>
    </div>
  );
};

