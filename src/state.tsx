import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from './i18n';
import type { FieldConfig } from './engine/irrigation';

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  field: FieldConfig | null;
  setField: (f: FieldConfig | null) => void;
}

const Ctx = createContext<AppState | null>(null);

const LS_KEY = 'tomchi.v1';

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('uz');
  const [field, setField] = useState<FieldConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.lang) setLang(s.lang);
        if (s.field) setField(s.field);
      }
    } catch { /* corrupted storage — start fresh */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ lang, field }));
  }, [lang, field, loaded]);

  if (!loaded) return null;
  return <Ctx.Provider value={{ lang, setLang, field, setField }}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
