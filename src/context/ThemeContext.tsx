import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type ThemeType = 'dark' | 'light' | 'cyberpunk' | 'sunset';

export interface ThemeColors {
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentSecondary: string;
    glass: string;
    glassBorder: string;
    // Background gradient colors for LiquidBackground
    gradientStart: string;
    gradientMid: string;
    gradientEnd: string;
    // Blob colors
    blobPrimary: string;
    blobSecondary: string;
    blobTertiary: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
    dark: {
        background: '#0a0a14',
        backgroundSecondary: '#16162a',
        text: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.6)',
        accent: '#8b5cf6',
        accentSecondary: '#a78bfa',
        glass: 'rgba(255, 255, 255, 0.06)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        gradientStart: '#1a0a2e',
        gradientMid: '#0f3460',
        gradientEnd: '#16082a',
        blobPrimary: 'rgba(139, 92, 246, 0.4)',
        blobSecondary: 'rgba(6, 182, 212, 0.45)',
        blobTertiary: 'rgba(236, 72, 153, 0.4)',
    },
    light: {
        background: '#f8fafc',
        backgroundSecondary: '#e2e8f0',
        text: '#1e293b',
        textSecondary: 'rgba(30, 41, 59, 0.6)',
        accent: '#7c3aed',
        accentSecondary: '#8b5cf6',
        glass: 'rgba(0, 0, 0, 0.04)',
        glassBorder: 'rgba(0, 0, 0, 0.08)',
        gradientStart: '#ddd6fe',
        gradientMid: '#bfdbfe',
        gradientEnd: '#e0e7ff',
        blobPrimary: 'rgba(124, 58, 237, 0.2)',
        blobSecondary: 'rgba(14, 165, 233, 0.25)',
        blobTertiary: 'rgba(219, 39, 119, 0.2)',
    },
    cyberpunk: {
        background: '#0d0d1a',
        backgroundSecondary: '#1a1a2e',
        text: '#00ff88',
        textSecondary: 'rgba(0, 255, 136, 0.6)',
        accent: '#ff00ff',
        accentSecondary: '#00ffff',
        glass: 'rgba(0, 255, 200, 0.08)',
        glassBorder: 'rgba(0, 255, 136, 0.2)',
        gradientStart: '#0a0015',
        gradientMid: '#150030',
        gradientEnd: '#001a1a',
        blobPrimary: 'rgba(255, 0, 255, 0.35)',
        blobSecondary: 'rgba(0, 255, 255, 0.4)',
        blobTertiary: 'rgba(255, 255, 0, 0.3)',
    },
    sunset: {
        background: '#1a0a0a',
        backgroundSecondary: '#2e1a1a',
        text: '#fff5e6',
        textSecondary: 'rgba(255, 245, 230, 0.6)',
        accent: '#f97316',
        accentSecondary: '#fb923c',
        glass: 'rgba(251, 146, 60, 0.08)',
        glassBorder: 'rgba(251, 146, 60, 0.15)',
        gradientStart: '#2d0a0a',
        gradientMid: '#451a1a',
        gradientEnd: '#1a0505',
        blobPrimary: 'rgba(249, 115, 22, 0.45)',
        blobSecondary: 'rgba(239, 68, 68, 0.4)',
        blobTertiary: 'rgba(236, 72, 153, 0.35)',
    },
};

interface ThemeContextType {
    theme: ThemeType;
    colors: ThemeColors;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'wordcloud_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeType>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && (saved === 'dark' || saved === 'light' || saved === 'cyberpunk' || saved === 'sunset')) {
                return saved as ThemeType;
            }
        } catch {
            // Ignore storage errors
        }
        return 'dark';
    });

    // Persist theme to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Ignore storage errors
        }
    }, [theme]);

    // Apply CSS variables for theme colors
    useEffect(() => {
        const colors = themes[theme];
        const root = document.documentElement;

        root.style.setProperty('--theme-bg', colors.background);
        root.style.setProperty('--theme-bg-secondary', colors.backgroundSecondary);
        root.style.setProperty('--theme-text', colors.text);
        root.style.setProperty('--theme-text-secondary', colors.textSecondary);
        root.style.setProperty('--theme-accent', colors.accent);
        root.style.setProperty('--theme-accent-secondary', colors.accentSecondary);
        root.style.setProperty('--theme-glass', colors.glass);
        root.style.setProperty('--theme-glass-border', colors.glassBorder);
    }, [theme]);

    const setTheme = useCallback((newTheme: ThemeType) => {
        setThemeState(newTheme);
    }, []);

    const value = {
        theme,
        colors: themes[theme],
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
