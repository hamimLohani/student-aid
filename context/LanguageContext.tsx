"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved === "bn") setLanguage("bn");
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage: () => setLanguage((current) => (current === "en" ? "bn" : "en")),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
