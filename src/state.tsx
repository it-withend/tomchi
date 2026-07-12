import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from './i18n';
import type { FieldConfig } from './engine/irrigation';

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  fields: FieldConfig[];
  activeField: FieldConfig | null;
  setActiveFieldId: (id: string) => void;
  addField: (f: Omit<FieldConfig, 'id'>) => void;
  removeField: (id: string) => void;
  updateField: (id: string, patch: Partial<FieldConfig>) => void;
  tutorialSeen: boolean;
  setTutorialSeen: (v: boolean) => void;
  adding: boolean;
  setAdding: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

const LS_KEY = 'tomchi.v2';
const LS_KEY_V1 = 'tomchi.v1';

function migrateV1(): { lang?: Lang; fields: FieldConfig[] } | null {
  try {
    const raw = localStorage.getItem(LS_KEY_V1);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const fields: FieldConfig[] = s.field
      ? [{ id: 'f1', soil: 'loam', ...s.field }]
      : [];
    localStorage.removeItem(LS_KEY_V1);
    return { lang: s.lang, fields };
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('uz');
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [activeFieldId, setActiveFieldId] = useState<string>('');
  const [tutorialSeen, setTutorialSeen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.lang) setLang(s.lang);
        if (Array.isArray(s.fields)) setFields(s.fields);
        if (s.activeFieldId) setActiveFieldId(s.activeFieldId);
        if (s.tutorialSeen) setTutorialSeen(true);
      } else {
        const v1 = migrateV1();
        if (v1) {
          if (v1.lang) setLang(v1.lang);
          setFields(v1.fields);
          if (v1.fields[0]) setActiveFieldId(v1.fields[0].id);
        }
      }
    } catch { /* corrupted storage — start fresh */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ lang, fields, activeFieldId, tutorialSeen }));
  }, [lang, fields, activeFieldId, tutorialSeen, loaded]);

  const addField = (f: Omit<FieldConfig, 'id'>) => {
    const id = 'f' + Date.now().toString(36);
    setFields((fs) => [...fs, { ...f, id }]);
    setActiveFieldId(id);
    setAdding(false);
  };

  const removeField = (id: string) => {
    setFields((fs) => {
      const rest = fs.filter((f) => f.id !== id);
      if (id === activeFieldId) setActiveFieldId(rest[0]?.id ?? '');
      return rest;
    });
  };

  const updateField = (id: string, patch: Partial<FieldConfig>) =>
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const activeField = fields.find((f) => f.id === activeFieldId) ?? fields[0] ?? null;

  if (!loaded) return null;
  return (
    <Ctx.Provider value={{
      lang, setLang, fields, activeField, setActiveFieldId,
      addField, removeField, updateField,
      tutorialSeen, setTutorialSeen, adding, setAdding,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
