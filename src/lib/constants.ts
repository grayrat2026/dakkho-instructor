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

export const R2_BUCKETS = {
  VIDEOS: process.env.R2_BUCKET_VIDEOS || 'dakkho-videos',
  THUMBNAILS: process.env.R2_BUCKET_THUMBNAILS || 'dakkho-thumbnails',
  AVATARS: process.env.R2_BUCKET_AVATARS || 'dakkho-avatars',
  RESOURCES: process.env.R2_BUCKET_RESOURCES || 'dakkho-resources',
} as const;

export const TECHNOLOGIES = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Communication',
  'Information Technology',
  'Chemical Engineering',
  'Biotechnology',
  'Aerospace Engineering',
  'Marine Engineering',
  'Textile Engineering',
  'Architecture',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Statistics',
  'Economics',
  'Business Administration',
  'Accounting',
  'Finance',
] as const;

export const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export const LANGUAGES = ['bangla', 'english', 'hindi'] as const;
export const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error', 'announcement', 'course-update'] as const;
