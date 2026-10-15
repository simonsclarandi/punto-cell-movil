import React, { createContext, useContext, useState } from 'react';
import { COLORS } from '../constants/theme'; // Tu paleta actual

const ThemeContext = createContext({
  theme: COLORS,
  toggleTheme: () => {},
  isDark: false
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = COLORS; // Aquí en el futuro podés condicionalmente devolver colores oscuros

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setIsDark(!isDark), isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);