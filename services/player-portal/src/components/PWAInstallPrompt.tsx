import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('nexus_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show for iOS if not standalone and not dismissed
    if (isIosDevice && !dismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('nexus_pwa_dismissed', 'true');
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[9990] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#1e1e1e]/95 backdrop-blur-md border border-[#f36c21]/40 rounded-xl p-3.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-white">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f36c21] to-amber-500 p-1 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
            <img src="/assets/fairplayvip8252.png" alt="NexusVIP App" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-xs text-white truncate">NexusVIP App</span>
              <span className="px-1.5 py-0.2 rounded bg-[#f36c21]/20 text-[#f36c21] text-[9px] font-black uppercase">PWA</span>
            </div>
            <p className="text-[10px] text-[#adadad] truncate">
              {isIOS ? 'Tap Share → "Add to Home Screen"' : 'Install for ultra-fast betting & live scores'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {isIOS ? (
            <button
              onClick={() => alert('To install on iPhone/iPad:\n1. Tap the Share button at the bottom of Safari\n2. Scroll down and select "Add to Home Screen"\n3. Tap Add')}
              className="px-3 py-1.5 rounded-lg bg-[#f36c21] hover:bg-[#e05b12] text-white font-black text-xs uppercase tracking-wider transition-all shadow"
            >
              How-To
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#f36c21] to-amber-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow flex items-center space-x-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg bg-[#272727] text-[#888] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
