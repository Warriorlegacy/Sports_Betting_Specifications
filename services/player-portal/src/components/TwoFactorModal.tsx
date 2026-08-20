import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  X,
  Copy,
  Check,
  Smartphone,
  Key,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(
    localStorage.getItem('nexus_2fa_enabled') === 'true'
  );
  const [secretKey] = useState<string>('JBSWY3DPEHPK3PXP');
  const [totpInput, setTotpInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpInput.length !== 6) {
      setError('Please enter a valid 6-digit TOTP code');
      return;
    }

    // Mock successful 2FA verification
    setError(null);
    setVerificationSuccess(true);
    setIsEnabled(true);
    localStorage.setItem('nexus_2fa_enabled', 'true');
    setTimeout(() => {
      setVerificationSuccess(false);
      onClose();
    }, 1500);
  };

  const handleDisable = () => {
    setIsEnabled(false);
    localStorage.removeItem('nexus_2fa_enabled');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6 shadow-2xl relative text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Two-Factor Authentication (2FA)</h3>
              <p className="text-[11px] text-[#adadad]">Google Authenticator / Authy Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#adadad] hover:text-white rounded-lg bg-[#272727] hover:bg-[#333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isEnabled ? (
          /* Active State */
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#27AE60]/20 border-2 border-[#27AE60] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#27AE60]" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white">2FA Security is Active</h4>
              <p className="text-xs text-[#adadad] mt-1">
                Your account and high-value withdrawal requests are protected by TOTP verification.
              </p>
            </div>

            <div className="p-3 bg-[#141414] rounded-xl border border-[#272727] text-left text-xs font-mono space-y-1">
              <div className="text-[10px] text-[#888] uppercase font-bold">Emergency Backup Codes</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <span>• 8492-1029</span>
                <span>• 9921-4820</span>
                <span>• 3341-9921</span>
                <span>• 5592-8812</span>
              </div>
            </div>

            <button
              onClick={handleDisable}
              className="w-full py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition-all cursor-pointer"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        ) : (
          /* Setup Form */
          <div className="space-y-4">
            {/* Step 1: QR & Secret Key */}
            <div className="p-3.5 bg-[#141414] rounded-xl border border-[#272727] space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <span className="w-5 h-5 rounded-full bg-[#f36c21] text-white flex items-center justify-center text-[10px] font-black">1</span>
                <span>Scan QR Code with Authenticator</span>
              </div>

              {/* Mock QR Placeholder */}
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-inner">
                <div className="w-full h-full border-4 border-dashed border-black flex flex-col items-center justify-center text-black text-[9px] font-mono text-center p-1 font-bold">
                  <span>[TOTP QR CODE]</span>
                  <span className="text-[8px] mt-1 text-slate-600">otpauth://totp/NexusVIP:{user?.username || 'player'}</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[10px] text-[#888] uppercase font-bold block">Or enter manual key:</span>
                <div className="mt-1 flex items-center justify-center space-x-2">
                  <code className="px-2 py-1 rounded bg-[#222] text-[#f36c21] font-mono text-xs font-bold border border-[#333]">
                    {secretKey}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1 rounded bg-[#272727] hover:bg-[#333] text-[#adadad] hover:text-white transition-colors cursor-pointer"
                    title="Copy Key"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#27AE60]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Verification Input */}
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <span className="w-5 h-5 rounded-full bg-[#f36c21] text-white flex items-center justify-center text-[10px] font-black">2</span>
                <span>Enter 6-Digit TOTP Code</span>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs">
                  {error}
                </div>
              )}

              {verificationSuccess && (
                <div className="p-2.5 rounded-lg bg-[#27AE60]/20 border border-[#27AE60] text-[#27AE60] text-xs font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>2FA Enabled Successfully!</span>
                </div>
              )}

              <input
                type="text"
                maxLength={6}
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full py-2.5 bg-[#141414] border border-[#333] focus:border-[#f36c21] rounded-xl text-center font-mono text-lg font-black text-white tracking-widest outline-none transition-colors"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow cursor-pointer"
              >
                Verify & Activate 2FA
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
