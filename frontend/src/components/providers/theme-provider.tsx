'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Apply theme to both <html> and <body> for maximum compatibility
  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove('light', 'dark', 'neon');
    body.classList.remove('light', 'dark', 'neon');
    root.setAttribute('data-theme', t);
    body.setAttribute('data-theme', t);
    if (t === 'dark' || t === 'neon') {
      root.classList.add(t);
      body.classList.add(t);
    }
  };

  useEffect(() => {
    const saved = (localStorage.getItem('azota-theme') as Theme) || 'dark';
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('azota-theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
