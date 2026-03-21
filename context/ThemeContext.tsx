"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: true,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;

    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
