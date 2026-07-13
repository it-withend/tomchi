import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from './i18n';
import type { FieldConfig, WateringType } from './engine/irrigation';
import { supabaseEnabled, ensureSession } from './lib/supabase';
import { pushField, pushEvent, removeFieldRemote } from './lib/sync';

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  fields: FieldConfig[];
  activeField: FieldConfig | null;
  setActiveFieldId: (id: string) => void;
  addField: (f: Omit<FieldConfig, 'id'>) => void;
  removeField: (id: string) => void;
  updateField: (id: string, patch: Partial<FieldConfig>) => void;
  logWatering: (id: string, type: WateringType) => void;
  syncEnabled: boolean;
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
    let loadedFields: FieldConfig[] = [];
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.lang) setLang(s.lang);
        if (Array.isArray(s.fields)) { setFields(s.fields); loadedFields = s.fields; }
        if (s.activeFieldId) setActiveFieldId(s.activeFieldId);
        if (s.tutorialSeen) setTutorialSeen(true);
      } else {
        const v1 = migrateV1();
        if (v1) {
          if (v1.lang) setLang(v1.lang);
          setFields(v1.fields);
          loadedFields = v1.fields;
          if (v1.fields[0]) setActiveFieldId(v1.fields[0].id);
        }
      }
    } catch { /* corrupted storage — start fresh */ }
    setLoaded(true);
    // Establish the anon owner, then push every existing field so a freshly
    // linked bot sees fields created before sync was enabled.
    if (supabaseEnabled) {
      ensureSession().then((user) => {
        if (user) loadedFields.forEach((f) => void pushField(f));
      });
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LS_KEY, JSON.stringify({ lang, fields, activeFieldId, tutorialSeen }));
  }, [lang, fields, activeFieldId, tutorialSeen, loaded]);

  const addField = (f: Omit<FieldConfig, 'id'>) => {
    const id = 'f' + Date.now().toString(36);
    const field = { ...f, id };
    setFields((fs) => [...fs, field]);
    setActiveFieldId(id);
    setAdding(false);
    void pushField(field);
  };

  const removeField = (id: string) => {
    setFields((fs) => {
      const rest = fs.filter((f) => f.id !== id);
      if (id === activeFieldId) setActiveFieldId(rest[0]?.id ?? '');
      return rest;
    });
    void removeFieldRemote(id);
  };

  const updateField = (id: string, patch: Partial<FieldConfig>) =>
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const logWatering = (id: string, type: WateringType) => {
    const at = new Date().toISOString();
    let updated: FieldConfig | undefined;
    setFields((fs) => fs.map((f) => {
      if (f.id !== id) return f;
      updated = { ...f, log: [...(f.log ?? []), { date: at, type }] };
      return updated;
    }));
    void pushEvent(id, type, at);
    if (updated) void pushField(updated);
  };

  const activeField = fields.find((f) => f.id === activeFieldId) ?? fields[0] ?? null;

  if (!loaded) return null;
  return (
    <Ctx.Provider value={{
      lang, setLang, fields, activeField, setActiveFieldId,
      addField, removeField, updateField, logWatering, syncEnabled: supabaseEnabled,
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
