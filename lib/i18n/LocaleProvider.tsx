"use client";

// Plan E3.4 — client-side locale context for the dashboard chrome. Holds the
// current UI locale, persists it (localStorage + cookie), and applies the
// document `dir`/`lang` for RTL support. No routing / next-intl involvement.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DICT, type UiLocale } from "./dictionaries";

const STORAGE_KEY = "mg.uiLocale";
const COOKIE_KEY = "mg.uiLocale";

interface LocaleContextValue {
  locale: UiLocale;
  setLocale: (locale: UiLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function persist(locale: UiLocale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // localStorage may be unavailable (private mode); cookie is the fallback.
  }
  try {
    // 1 year, lax — readable by the server on subsequent navigations.
    document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    // ignore
  }
}

function readStoredLocale(): UiLocale | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr" || stored === "ar") return stored;
  } catch {
    // ignore
  }
  return null;
}

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: UiLocale;
}) {
  const [locale, setLocaleState] = useState<UiLocale>(initialLocale);

  // On mount, prefer a previously persisted client choice over the server hint.
  // Done in an effect (not during render) and only when it actually differs.
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored && stored !== locale) {
      setLocaleState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply document direction + language whenever the locale changes. This is a
  // DOM side-effect only — no setState here.
  useEffect(() => {
    const root = document.documentElement;
    root.dir = locale === "ar" ? "rtl" : "ltr";
    root.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: UiLocale) => {
    setLocaleState(next);
    persist(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Defensive default so a stray consumer outside the provider still renders.
    return { locale: "en", setLocale: () => {} };
  }
  return ctx;
}

/** Returns a translator that falls back to the key, then to English. */
export function useT(): (key: string) => string {
  const { locale } = useLocale();
  return useCallback(
    (key: string) => DICT[locale]?.[key] ?? DICT.en[key] ?? key,
    [locale],
  );
}
