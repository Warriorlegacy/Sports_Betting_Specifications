import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreset = 'FAIRPLAY_VIP' | 'ALLPANEL_ICE' | 'RUDRA_MYSPORTS' | 'LOTUS_DATAFAIR';

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
  brandName: 'NEXUSVIP SPORTSBOOK',
  tagline: 'Live Exchange & Multi-Tier Control Desk',
  supportTelegram: 'https://t.me/nexusvip_support',
  supportWhatsApp: 'https://wa.me/916202442690',
  primaryColor: '#f36c21',
  accentColor: '#27AE60',
  theme: 'FAIRPLAY_VIP'
};

export const THEME_STYLES: Record<
  ThemePreset,
  {
    name: string;
    platformRef: string;
    primary: string;
    accent: string;
    backOdds: string;
    layOdds: string;
    bg: string;
    surface: string;
    border: string;
    badge: string;
  }
> = {
  FAIRPLAY_VIP: {
    name: 'Fairplay VIP (Default)',
    platformRef: 'fairplayvip.in (Vue / Hurry2)',
    primary: '#f36c21',
    accent: '#27AE60',
    backOdds: '#a5d9fe',
    layOdds: '#f8d0ce',
    bg: '#121212',
    surface: '#1e1e1e',
    border: '#2d2d2d',
    badge: 'Fairplay VIP Orange & Betfair Blue/Pink'
  },
  ALLPANEL_ICE: {
    name: 'Skyexchange / Allpanel7 / Diam9',
    platformRef: 'allpanel7.com / diam9.com (ICE Exchange)',
    primary: '#BB973B',
    accent: '#EAB50E',
    backOdds: '#a88835',
    layOdds: '#DE191E',
    bg: '#0C2013',
    surface: '#233529',
    border: '#38483d',
    badge: 'Dark Green & Pure Gold'
  },
  RUDRA_MYSPORTS: {
    name: 'Rudra888 Exchange',
    platformRef: 'rudra888.in (MySportsFeed)',
    primary: '#fd2954',
    accent: '#0495e3',
    backOdds: '#fd2954',
    layOdds: '#0495e3',
    bg: '#18182d',
    surface: '#222241',
    border: '#33334f',
    badge: 'Dark Navy & Hot Pink/Cyan Odds'
  },
  LOTUS_DATAFAIR: {
    name: 'Lotusrun365 DataFair',
    platformRef: 'lotusrun365.com (DataFairPlay)',
    primary: '#034C6F',
    accent: '#107A85',
    backOdds: '#72bbef',
    layOdds: '#faa9ba',
    bg: '#0a1622',
    surface: '#132838',
    border: '#1b3b52',
    badge: 'Teal Navy & 7-Fancy Desk'
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
      try {
        const parsed = JSON.parse(saved);
        if (THEME_STYLES[parsed.theme as ThemePreset]) {
          return parsed;
        }
      } catch (e) {
        /* fallback */
      }
    }
    return DEFAULT_BRAND;
  });

  useEffect(() => {
    localStorage.setItem('nexus_brand_config', JSON.stringify(brand));
    // Apply body style attributes for live dynamic theme switching
    const currentTheme = THEME_STYLES[brand.theme] || THEME_STYLES.FAIRPLAY_VIP;
    document.documentElement.style.setProperty('--theme-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--theme-accent', currentTheme.accent);
    document.documentElement.style.setProperty('--theme-bg', currentTheme.bg);
    document.documentElement.style.setProperty('--theme-surface', currentTheme.surface);
    document.documentElement.style.setProperty('--theme-border', currentTheme.border);
    document.documentElement.style.setProperty('--back-odds-color', currentTheme.backOdds);
    document.documentElement.style.setProperty('--lay-odds-color', currentTheme.layOdds);
  }, [brand]);

  const setTheme = (theme: ThemePreset) => {
    const target = THEME_STYLES[theme] || THEME_STYLES.FAIRPLAY_VIP;
    setBrand((prev) => ({
      ...prev,
      theme,
      primaryColor: target.primary,
      accentColor: target.accent
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
