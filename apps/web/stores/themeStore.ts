import { create } from 'zustand';

interface ThemeState {
  theme: 'light';
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme?: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  sidebarCollapsed: false,
  mobileDrawerOpen: false,

  toggleTheme: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('elevateos-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
    set({ theme: 'light' });
  },

  setTheme: (_theme?: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('elevateos-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
    set({ theme: 'light' });
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  setMobileDrawerOpen: (mobileDrawerOpen) => set({ mobileDrawerOpen }),
}));
