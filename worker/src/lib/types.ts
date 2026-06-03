/**
 * Type definitions and constants for DAKKHO Admin API on Cloudflare Workers
 */

// ─── Appwrite Collection IDs ───

export const APPWRITE_COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  VIDEOS: 'videos',
  INSTRUCTORS: 'instructors',
  INSTITUTES: 'institutes',
  ENROLLMENTS: 'enrollments',
  NOTIFICATIONS: 'notifications',
  DISCUSSIONS: 'discussions',
  USER_SETTINGS: 'user_settings',
  BOOKMARKS: 'bookmarks',
  WATCH_PROGRESS: 'watch_progress',
  CATEGORIES: 'categories',
} as const;

// ─── Server Config Types ───

export interface FeatureToggles {
  downloads: boolean;
  bookmarks: boolean;
  certificates: boolean;
  liveSessions: boolean;
  achievements: boolean;
  assignments: boolean;
  discussions: boolean;
  community: boolean;
  leaderboard: boolean;
  studyGroups: boolean;
  peerConnections: boolean;
  feedback: boolean;
  pricing: boolean;
  referral: boolean;
}

export interface HomePageSections {
  sections: string[];
}

export interface SidebarVisibility {
  menu: boolean;
  departments: boolean;
  semesters: boolean;
  exams: boolean;
  community: boolean;
  general: boolean;
}

export interface BottomNavTabs {
  tabs: { id: string; label: string; enabled: boolean; order: number }[];
}

export interface TopBarElements {
  search: boolean;
  notifications: boolean;
  avatar: boolean;
  hamburger: boolean;
}

export interface ContentProtection {
  enabled: boolean;
  noCopy: boolean;
  noRightClick: boolean;
  noScreenshot: boolean;
  noPrint: boolean;
  customContextMenu: boolean;
  watermark: boolean;
  dragProtection: boolean;
}

export interface ServerConfig {
  featureToggles: FeatureToggles;
  homePageSections: HomePageSections;
  sidebarVisibility: SidebarVisibility;
  bottomNavTabs: BottomNavTabs;
  topBarElements: TopBarElements;
  cardStyle: 'glass' | 'flat' | 'rounded';
  contentProtection: ContentProtection;
}

export const DEFAULT_CONFIG: ServerConfig = {
  featureToggles: {
    downloads: true,
    bookmarks: true,
    certificates: true,
    liveSessions: true,
    achievements: true,
    assignments: true,
    discussions: true,
    community: true,
    leaderboard: true,
    studyGroups: true,
    peerConnections: true,
    feedback: true,
    pricing: true,
    referral: true,
  },
  homePageSections: {
    sections: ['hero', 'continue-watching', 'categories', 'new-releases', 'live', 'trending', 'instructors', 'leaderboard', 'recommended'],
  },
  sidebarVisibility: {
    menu: true,
    departments: true,
    semesters: true,
    exams: true,
    community: true,
    general: true,
  },
  bottomNavTabs: {
    tabs: [
      { id: 'home', label: 'Home', enabled: true, order: 0 },
      { id: 'explore', label: 'Explore', enabled: true, order: 1 },
      { id: 'my-courses', label: 'My Courses', enabled: true, order: 2 },
      { id: 'watch-history', label: 'Watch History', enabled: true, order: 3 },
      { id: 'profile', label: 'Profile', enabled: true, order: 4 },
    ],
  },
  topBarElements: {
    search: true,
    notifications: true,
    avatar: true,
    hamburger: true,
  },
  cardStyle: 'glass',
  contentProtection: {
    enabled: true,
    noCopy: true,
    noRightClick: true,
    noScreenshot: true,
    noPrint: true,
    customContextMenu: true,
    watermark: false,
    dragProtection: true,
  },
};

// ─── Admin User Type ───

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ─── D1 Row Types ───

export interface AdminSessionRow {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  role: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  is_active: number;
}

export interface AppConfigRow {
  key: string;
  value: string;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  user_id: string | null;
  user_email: string | null;
  details: string;
  ip_address: string | null;
  created_at: string;
}

// ─── Service Status Types ───

export interface ServiceStatus {
  status: 'connected' | 'error' | 'limited';
  message?: string;
}
