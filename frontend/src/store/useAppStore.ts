import { create } from 'zustand';
import { LanguageConfig, ExecutionResult, Snippet, User } from '../types';
import { transpileCode } from '../services/api';

interface AppState {
  languages: LanguageConfig[];
  currentLanguage: LanguageConfig | null;
  code: string;
  stdin: string;
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  activeTab: 'console' | 'webpreview';
  user: User | null;
  userStreak: number | null;
  isAuthModalOpen: boolean;
  isLangModalOpen: boolean;
  isHistoryOpen: boolean;
  isEmbedOpen: boolean;
  isFeedbackOpen: boolean;
  activeSnippetId: string | null;
  transpileNotification: string | null;
  pendingLanguage: LanguageConfig | null;
  isConfirmLangSwitchOpen: boolean;
  
  // Actions
  setUserStreak: (streak: number | null) => void;
  setLanguages: (languages: LanguageConfig[]) => void;
  setCurrentLanguage: (lang: LanguageConfig, preserveCode?: boolean) => void;
  loadCodeToEditor: (languageId: string, code: string, stdin?: string, result?: ExecutionResult | null) => void;
  switchLanguageAndTranspile: (lang: LanguageConfig) => Promise<void>;
  requestLanguageSwitch: (targetLang: LanguageConfig) => boolean;
  confirmLanguageSwitch: () => LanguageConfig | null;
  cancelLanguageSwitch: () => void;
  setCode: (code: string) => void;
  setStdin: (stdin: string) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setExecutionResult: (result: ExecutionResult | null) => void;
  setActiveTab: (tab: 'console' | 'webpreview') => void;
  setUser: (user: User | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsLangModalOpen: (open: boolean) => void;
  setIsHistoryOpen: (open: boolean) => void;
  setIsEmbedOpen: (open: boolean) => void;
  setIsFeedbackOpen: (open: boolean) => void;
  setActiveSnippetId: (id: string | null) => void;
  setTranspileNotification: (msg: string | null) => void;
}

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('nexora_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const getInitialStreak = (): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('nexora_streak');
    if (saved) return parseInt(saved, 10);
    const user = localStorage.getItem('nexora_user');
    return user ? 5 : null;
  } catch {
    return null;
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  languages: [],
  currentLanguage: null,
  code: '',
  stdin: '',
  isExecuting: false,
  executionResult: null,
  activeTab: 'console',
  user: getInitialUser(),
  userStreak: getInitialStreak(),
  isAuthModalOpen: false,
  isLangModalOpen: false,
  isHistoryOpen: false,
  isEmbedOpen: false,
  isFeedbackOpen: false,
  activeSnippetId: null,
  transpileNotification: null,
  pendingLanguage: null,
  isConfirmLangSwitchOpen: false,

  setLanguages: (languages) => set({ languages }),
  setCurrentLanguage: (lang, preserveCode = false) =>
    set((state) => ({
      currentLanguage: lang,
      code: preserveCode ? state.code : lang.defaultCode,
      executionResult: preserveCode ? state.executionResult : null,
    })),
  loadCodeToEditor: (languageId, code, stdin = '', result = null) => {
    const state = get();
    const targetLang =
      state.languages.find((l) => l.id.toLowerCase() === languageId.toLowerCase()) ||
      state.currentLanguage;

    set({
      currentLanguage: targetLang,
      code,
      stdin,
      executionResult: result,
      activeTab: 'console',
      isHistoryOpen: false,
    });
  },
  requestLanguageSwitch: (targetLang: LanguageConfig) => {
    if (targetLang.status === 'coming_soon') {
      return false;
    }

    const state = get();
    const sourceLang = state.currentLanguage;
    const currentCode = state.code;

    if (sourceLang && sourceLang.id === targetLang.id) {
      return true;
    }

    const isCodeModified = Boolean(
      sourceLang &&
      currentCode.trim() !== '' &&
      currentCode.trim() !== (sourceLang.defaultCode || '').trim()
    );

    if (isCodeModified) {
      set({
        pendingLanguage: targetLang,
        isConfirmLangSwitchOpen: true,
      });
      return false;
    }

    set({
      currentLanguage: targetLang,
      code: targetLang.defaultCode,
      executionResult: null,
      transpileNotification: null,
      pendingLanguage: null,
      isConfirmLangSwitchOpen: false,
    });
    return true;
  },
  confirmLanguageSwitch: () => {
    const { pendingLanguage } = get();
    if (pendingLanguage && pendingLanguage.status !== 'coming_soon') {
      set({
        currentLanguage: pendingLanguage,
        code: pendingLanguage.defaultCode,
        executionResult: null,
        transpileNotification: null,
        pendingLanguage: null,
        isConfirmLangSwitchOpen: false,
      });
      return pendingLanguage;
    }
    set({ isConfirmLangSwitchOpen: false, pendingLanguage: null });
    return null;
  },
  cancelLanguageSwitch: () => {
    set({ isConfirmLangSwitchOpen: false, pendingLanguage: null });
  },
  switchLanguageAndTranspile: async (targetLang: LanguageConfig) => {
    if (targetLang.status === 'coming_soon') {
      return;
    }

    const state = get();
    const sourceLang = state.currentLanguage;
    const currentCode = state.code;

    if (sourceLang && sourceLang.id !== targetLang.id && currentCode.trim()) {
      try {
        const res = await transpileCode(sourceLang.id, targetLang.id, currentCode);
        if (res && res.transpiledCode) {
          set({
            currentLanguage: targetLang,
            code: res.transpiledCode,
            executionResult: null,
            transpileNotification: `Auto-converted from ${sourceLang.name} to ${targetLang.name}`
          });
          return;
        }
      } catch (e) {
        console.error("Transpilation error:", e);
      }
    }

    set({ currentLanguage: targetLang, code: targetLang.defaultCode, executionResult: null });
  },
  setCode: (code) => set({ code }),
  setStdin: (stdin) => set({ stdin }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setExecutionResult: (result) => set({ executionResult: result }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setUserStreak: (streak) => {
    if (typeof window !== 'undefined') {
      if (streak !== null) {
        localStorage.setItem('nexora_streak', String(streak));
      } else {
        localStorage.removeItem('nexora_streak');
      }
    }
    set({ userStreak: streak });
  },
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('nexora_user', JSON.stringify(user));
        const saved = localStorage.getItem('nexora_streak');
        const streakVal = saved ? parseInt(saved, 10) : 5;
        localStorage.setItem('nexora_streak', String(streakVal));
        set({ user, userStreak: streakVal });
        return;
      } else {
        localStorage.removeItem('nexora_user');
        localStorage.removeItem('nexora_token');
        localStorage.removeItem('nexora_streak');
        set({ user: null, userStreak: null });
        return;
      }
    }
    set({ user, userStreak: user ? 5 : null });
  },
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setIsLangModalOpen: (open) => set({ isLangModalOpen: open }),
  setIsHistoryOpen: (open) => set({ isHistoryOpen: open }),
  setIsEmbedOpen: (open) => set({ isEmbedOpen: open }),
  setIsFeedbackOpen: (open) => set({ isFeedbackOpen: open }),
  setActiveSnippetId: (id) => set({ activeSnippetId: id }),
  setTranspileNotification: (msg) => set({ transpileNotification: msg }),
}));
