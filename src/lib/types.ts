// User types
export interface AppwriteUser {
  $id: string;
  email: string;
  fullName: string;
  institute?: string;
  technology?: string;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
  emailVerified: boolean;
  isActive: boolean;
  enrolledCourseIds?: string;
  $createdAt: string;
  $updatedAt: string;
}

// Course types
export interface Course {
  $id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  categoryId?: string;
  instructorId?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: 'bangla' | 'english' | 'hindi';
  duration: number;
  totalVideos: number;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  isFeatured: boolean;
  isPublished: boolean;
  tags?: string;
  $createdAt: string;
  $updatedAt: string;
}

// Video types
export interface Video {
  $id: string;
  title: string;
  slug: string;
  description?: string;
  courseId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: number;
  order: number;
  isPreview: boolean;
  isPublished: boolean;
  $createdAt: string;
  $updatedAt: string;
}

// Instructor types
export interface Instructor {
  $id: string;
  name: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  specialization?: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  $createdAt: string;
  $updatedAt: string;
}

// Institute types
export interface Institute {
  $id: string;
  name: string;
  code?: string;
  address?: string;
  $createdAt: string;
  $updatedAt: string;
}

// Enrollment types
export interface Enrollment {
  $id: string;
  userId: string;
  courseId: string;
  progress: number;
  completed: boolean;
  $createdAt: string;
  $updatedAt: string;
}

// Notification types
export interface Notification {
  $id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'course-update';
  isRead: boolean;
  actionUrl?: string;
  $createdAt: string;
  $updatedAt: string;
}

// Discussion types
export interface Discussion {
  $id: string;
  title: string;
  body: string;
  courseId?: string;
  authorId: string;
  tags?: string;
  isAnswered: boolean;
  repliesCount: number;
  $createdAt: string;
  $updatedAt: string;
}

// Bookmark types
export interface Bookmark {
  $id: string;
  userId: string;
  courseId: string;
  $createdAt: string;
}

// Watch Progress types
export interface WatchProgress {
  $id: string;
  userId: string;
  videoId: string;
  courseId: string;
  progress: number;
  lastPosition: number;
  completed: boolean;
  $createdAt: string;
  $updatedAt: string;
}

// User Settings types
export interface UserSettings {
  $id: string;
  userId: string;
  streamingQuality: 'low' | 'medium' | 'high' | 'original';
  downloadQuality: 'low' | 'medium' | 'high' | 'original';
  autoDownload: boolean;
  wifiOnly: boolean;
  dataSaverMode: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  themeMode: 'light' | 'dark' | 'system';
  appLanguage: string;
  profileVisibility: 'everyone' | 'friends' | 'private';
  $createdAt: string;
  $updatedAt: string;
}

// Category types
export interface Category {
  $id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order?: number;
  courseCount?: number;
  $createdAt: string;
  $updatedAt: string;
}

// Server Config types
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

// Admin Auth types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalVideos: number;
  totalEnrollments: number;
  activeSessions: number;
  newSignupsToday: number;
}
