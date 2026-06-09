// ============================================================
// DAKKHO Admin — D1-Native Types (No Appwrite)
// All types use D1-compatible fields (id, created_at, updated_at)
// ============================================================

// ---- User Types ----
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  bio?: string;
  instituteId?: number;
  technology?: string;
  semester?: number;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
  emailVerified: boolean;
  isActive: boolean;
  enrolledCourseIds?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Course Types ----
export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  categoryId?: string;
  instructorId?: string;
  technologyId?: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: 'bangla' | 'english' | 'hindi';
  duration: number;
  totalVideos: number;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  price: number;
  isFeatured: boolean;
  isPublished: boolean;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Video Types ----
export interface Video {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

// ---- Instructor Types ----
export interface Instructor {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  specialization?: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  socialLinks?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Institute Types (D1) ----
export interface Institute {
  id: number;
  name: string;
  name_bn?: string;
  division?: string;
  district?: string;
  eiin_number?: string;
  type: string;
  is_requested: number;
  requested_by?: string;
  approved_by?: string;
  approved_at?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// ---- Technology Types (D1) ----
export interface Technology {
  id: number;
  name: string;
  name_bn?: string;
  short_code?: string;
  description?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// ---- Institute Request Types (D1) ----
export interface InstituteRequest {
  id: number;
  user_id: string;
  user_email?: string;
  user_name?: string;
  institute_name: string;
  institute_name_bn?: string;
  division?: string;
  district?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// ---- Enrollment Types ----
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- Category Types ----
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  parentId?: string;
  order?: number;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Notification Types ----
export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'course-update';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Discussion Types ----
export interface Discussion {
  id: string;
  title: string;
  body: string;
  courseId?: string;
  authorId: string;
  tags?: string;
  isAnswered: boolean;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Bookmark Types ----
export interface Bookmark {
  id: string;
  userId: string;
  courseId: string;
  createdAt: string;
}

// ---- Watch Progress Types ----
export interface WatchProgress {
  id: string;
  userId: string;
  videoId: string;
  courseId: string;
  progress: number;
  lastPosition: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---- User Settings Types ----
export interface UserSettings {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

// ---- Coupon Types (D1) ----
export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount?: number;
  min_purchase: number;
  usage_limit?: number;
  usage_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  applicable_courses?: string;
  applicable_technologies?: string;
  is_active: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ---- Discount Types (D1) ----
export interface Discount {
  id: number;
  name: string;
  name_bn?: string;
  description?: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  applicable_type: string;
  applicable_ids?: string;
  valid_from: string;
  valid_until: string;
  is_auto_apply: number;
  is_active: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ---- Event Types (D1) ----
export interface Event {
  id: number;
  title: string;
  title_bn?: string;
  description?: string;
  description_bn?: string;
  event_type: 'event' | 'special_day' | 'holiday' | 'exam' | 'workshop';
  banner_url?: string;
  start_date: string;
  end_date?: string;
  is_featured: number;
  metadata?: string;
  is_active: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ---- Live Class Types (D1) ----
export interface LiveClass {
  id: number;
  course_id?: string;
  title: string;
  title_bn?: string;
  description?: string;
  instructor_id?: string;
  technology_id?: number;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string;
  platform: 'jitsi' | 'zoom' | 'meet' | 'other';
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  recording_url?: string;
  is_active: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ---- Payment Types (D1) ----
export interface Payment {
  id: number;
  user_id: string;
  package_id?: number;
  course_id?: string;
  amount: number;
  currency: string;
  gateway: string;
  gateway_trx_id?: string;
  gateway_payment_id?: string;
  status: 'pending' | 'verified' | 'rejected' | 'refunded';
  proof_url?: string;
  trx_id_submitted?: string;
  phone_submitted?: string;
  verified_by?: string;
  verified_at?: string;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

// ---- Payment Config Types (D1) ----
export interface PaymentConfig {
  id: number;
  gateway: string;
  is_active: number;
  config: string;
  sandbox_mode: number;
  instructions?: string;
  instructions_bn?: string;
  created_at: string;
  updated_at: string;
}

// ---- Course Package Types (D1) ----
export interface CoursePackage {
  id: number;
  course_id: string;
  package_type: 'basic' | 'standard' | 'premium';
  price: number;
  duration_months: number;
  max_users: number;
  is_auto_assign: number;
  is_active: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ---- User Package Types (D1) ----
export interface UserPackage {
  id: number;
  user_id: string;
  package_id: number;
  course_id: string;
  package_type: string;
  activated_at: string;
  expires_at: string;
  shared_with?: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
}

// ---- Achievement Definition Types (D1) ----
export interface AchievementDefinition {
  id: number;
  slug: string;
  name: string;
  name_bn?: string;
  description: string;
  description_bn?: string;
  category: 'learning' | 'streaks' | 'social' | 'special';
  icon: string;
  xp: number;
  condition_type: string;
  condition_value: string;
  is_active: number;
  created_at: string;
}

// ---- Student Achievement Types (D1) ----
export interface StudentAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  unlocked_at: string;
}

// ---- Student Activity Types (D1) ----
export interface StudentActivity {
  id: number;
  user_id: string;
  activity_type: 'video_watch' | 'quiz_complete' | 'assignment_submit' | 'streak_bonus' | 'enrollment' | 'certificate';
  resource_type: string;
  resource_id?: string;
  title: string;
  description?: string;
  metadata?: string;
  created_at: string;
}

// ---- Audit Log Types (D1) ----
export interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  user_id?: string;
  user_email?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

// ---- Notification Log Types (D1) ----
export interface NotificationLog {
  id: number;
  type: string;
  category: string;
  title?: string;
  message?: string;
  target_type?: string;
  target_id?: string;
  sent_count: number;
  failed_count: number;
  metadata?: string;
  created_by?: string;
  created_at: string;
}

// ---- Push Token Types (D1) ----
export interface PushToken {
  id: number;
  user_id: string;
  push_token: string;
  device_type?: string;
  device_info?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Server Config Types
// ============================================================
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

// ============================================================
// Admin Auth Types
// ============================================================
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ============================================================
// Dashboard Types
// ============================================================
export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalVideos: number;
  totalEnrollments: number;
  activeSessions: number;
  newSignupsToday: number;
  totalRevenue: number;
  pendingPayments: number;
  activePackages: number;
  totalAchievements: number;
}

// ============================================================
// Service Status Types
// ============================================================
export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  message?: string;
}
