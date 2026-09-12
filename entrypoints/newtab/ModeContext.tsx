import { createContext, useContext, useState, type ReactNode } from 'react';

export type Mode = 'view' | 'edit';

interface ModeContextValue {
  mode: Mode;
  toggleMode: () => void;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('view');

  const toggleMode = () => setMode((m) => (m === 'view' ? 'edit' : 'view'));

  return (
    <ModeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return ctx;
}