import { create } from 'zustand';
import { ServerConfig, DEFAULT_CONFIG, AdminUser } from './types';

interface AdminStore {
  adminUser: AdminUser | null;
  setAdminUser: (user: AdminUser | null) => void;

  serverConfig: ServerConfig;
  setServerConfig: (config: ServerConfig) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  sidebarMobileOpen: boolean;
  setSidebarMobileOpen: (open: boolean) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // New: Global search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // New: Notification count
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  adminUser: null,
  setAdminUser: (user) => set({ adminUser: user }),

  serverConfig: DEFAULT_CONFIG,
  setServerConfig: (config) => set({ serverConfig: config }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  sidebarMobileOpen: false,
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  unreadNotificationCount: 0,
  setUnreadNotificationCount: (count) => set({ unreadNotificationCount: count }),
}));
