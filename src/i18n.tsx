import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// Ana sayfa için hafif TR/EN dil desteği. Metinler bileşenlerin içinde `t('Türkçe', 'English')`
// şeklinde yan yana yazılır; ek kütüphane ya da ayrı sözlük dosyası yok.
export type Lang = 'tr' | 'en';

const STORAGE_KEY = 'av-lang';

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'tr';
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'tr' || fromUrl === 'en') return fromUrl;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'tr' || saved === 'en') return saved;
  } catch {
    /* depolama kapalı olabilir */
  }
  // Tarayıcı dili Türkçe değilse İngilizce aç.
  const nav = (navigator.languages?.[0] ?? navigator.language ?? 'tr').toLowerCase();
  return nav.startsWith('tr') ? 'tr' : 'en';
}

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (tr: string, en: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* depolama kapalı olabilir */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? 'Agora Voice — Izmir Choir' : "Agora Voice - İzmir'in Korosu";
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t: (tr, en) => (lang === 'en' ? en : tr) }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang, LangProvider içinde kullanılmalı');
  return ctx;
}
