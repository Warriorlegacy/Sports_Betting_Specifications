import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreset = 'CYBER_ONYX' | 'EMERALD_VIP' | 'ROYAL_SAPPHIRE' | 'MIDNIGHT_CRIMSON';

export interface BrandConfig {
  brandName: string;
  tagline: string;
  supportTelegram: string;
  supportWhatsApp: string;
  primaryColor: string;
  accentColor: string;
  theme: ThemePreset;
}

const DEFAULT_BRAND: BrandConfig = {
  brandName: 'NEXUS SPORTSBOOK',
  tagline: 'Live Exchange & Multi-Tier Sportsbook',
  supportTelegram: 'https://t.me/nexus_support',
  supportWhatsApp: 'https://wa.me/919999999999',
  primaryColor: '#3b82f6',
  accentColor: '#10b981',
  theme: 'CYBER_ONYX'
};

const THEME_STYLES: Record<ThemePreset, { name: string; primary: string; accent: string; bg: string; border: string }> = {
  CYBER_ONYX: {
    name: 'Cyber Onyx (Electric Cyan)',
    primary: '#3b82f6',
    accent: '#38bdf8',
    bg: '#060911',
    border: '#1e293b'
  },
  EMERALD_VIP: {
    name: 'Emerald Gold VIP',
    primary: '#059669',
    accent: '#eab308',
    bg: '#04120c',
    border: '#064e3b'
  },
  ROYAL_SAPPHIRE: {
    name: 'Royal Sapphire',
    primary: '#2563eb',
    accent: '#60a5fa',
    bg: '#050b1a',
    border: '#1e3a8a'
  },
  MIDNIGHT_CRIMSON: {
    name: 'Midnight Crimson',
    primary: '#e11d48',
    accent: '#fb7185',
    bg: '#0c0509',
    border: '#881337'
  }
};

interface ThemeContextType {
  brand: BrandConfig;
  setTheme: (theme: ThemePreset) => void;
  updateBrand: (updates: Partial<BrandConfig>) => void;
  themeStyles: typeof THEME_STYLES;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brand, setBrand] = useState<BrandConfig>(() => {
    const saved = localStorage.getItem('nexus_brand_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_BRAND;
  });

  useEffect(() => {
    localStorage.setItem('nexus_brand_config', JSON.stringify(brand));
    // Apply body style attributes for live dynamic theme switching
    const currentTheme = THEME_STYLES[brand.theme] || THEME_STYLES.CYBER_ONYX;
    document.documentElement.style.setProperty('--theme-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--theme-accent', currentTheme.accent);
    document.documentElement.style.setProperty('--theme-bg', currentTheme.bg);
  }, [brand]);

  const setTheme = (theme: ThemePreset) => {
    setBrand((prev) => ({
      ...prev,
      theme,
      primaryColor: THEME_STYLES[theme].primary,
      accentColor: THEME_STYLES[theme].accent
    }));
  };

  const updateBrand = (updates: Partial<BrandConfig>) => {
    setBrand((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ brand, setTheme, updateBrand, themeStyles: THEME_STYLES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
