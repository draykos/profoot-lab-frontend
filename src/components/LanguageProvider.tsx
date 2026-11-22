import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANG_STORAGE_KEY, LangContext, type Lang } from "@/lib/i18n";
import { safeStorage } from "@/lib/safeStorage";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR-safe: always start "it", then hydrate from storage
  const [lang, setLangState] = useState<Lang>("it");

  useEffect(() => {
    const saved = safeStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "it") setLangState(saved);
    else {
      const nav = typeof navigator !== "undefined" ? navigator.language : "";
      if (nav && !nav.toLowerCase().startsWith("it")) setLangState("en");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    safeStorage.setItem(LANG_STORAGE_KEY, l);
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === "it" ? "en" : "it";
      safeStorage.setItem(LANG_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ lang, setLang, toggle }), [lang, setLang, toggle]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
