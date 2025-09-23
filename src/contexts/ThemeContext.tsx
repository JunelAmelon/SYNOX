import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // 'appliedTheme' est le thème réellement appliqué ('light' ou 'dark'), résolu à partir de 'system'
  appliedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  const [appliedTheme, setAppliedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (currentTheme: Theme) => {
      let finalTheme: 'light' | 'dark';

      if (currentTheme === 'system') {
        finalTheme = systemPrefersDark.matches ? 'dark' : 'light';
      } else {
        finalTheme = currentTheme;
      }

      root.classList.remove('light', 'dark');
      root.classList.add(finalTheme);
      setAppliedTheme(finalTheme);
    };

    applyTheme(theme);

    // Écouter les changements de préférence système
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    systemPrefersDark.addEventListener('change', handleSystemChange);

    return () => {
      systemPrefersDark.removeEventListener('change', handleSystemChange);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  const value = useMemo(() => ({
    theme,
    setTheme,
    appliedTheme,
  }), [theme, appliedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
