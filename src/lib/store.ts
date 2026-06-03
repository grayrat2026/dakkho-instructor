import { create } from 'zustand';
import { ServerConfig, DEFAULT_CONFIG, AdminUser } from './types';

interface AdminStore {
  adminUser: AdminUser | null;
  setAdminUser: (user: AdminUser | null) => void;

  serverConfig: ServerConfig;
  setServerConfig: (config: ServerConfig) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  currentPage: string;
  setCurrentPage: (page: string) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  adminUser: null,
  setAdminUser: (user) => set({ adminUser: user }),

  serverConfig: DEFAULT_CONFIG,
  setServerConfig: (config) => set({ serverConfig: config }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
