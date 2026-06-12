-- ============================================================
-- Migration: Instructor CRUD features
-- - course_resources table (sheets, documents, PDFs per course)
-- - instructor_sessions table (if not exists)
-- - otp_codes table (if not exists)
-- - Add password_migrated column to users
-- - chapters, lessons, course_learning_points (curriculum structure)
-- - course_instructors, course_packages, course_categories (junction/package tables)
-- ============================================================

-- 1. course_resources table (sheets, PDFs, documents attached to courses)
CREATE TABLE IF NOT EXISTS course_resources (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  chapter_id TEXT,
  lesson_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf',
  file_size INTEGER DEFAULT 0,
  is_downloadable INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  uploaded_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_course_resources_course ON course_resources(course_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_chapter ON course_resources(chapter_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_lesson ON course_resources(lesson_id);

-- 2. instructor_sessions table (for instructor auth)
CREATE TABLE IF NOT EXISTS instructor_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  ip_address TEXT,
  device_info TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  is_active INTEGER DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_instructor_sessions_user ON instructor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_sessions_expires ON instructor_sessions(expires_at);

-- 3. otp_codes table (for password reset)
CREATE TABLE IF NOT EXISTS otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  target TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'verification',
  expires_at TEXT NOT NULL,
  verified INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_otp_codes_target ON otp_codes(target);
CREATE INDEX IF NOT EXISTS idx_otp_codes_type ON otp_codes(type);

-- 4. Add password_migrated column to users if not exists
-- NOTE: ALTER TABLE ADD COLUMN is not idempotent in SQLite/D1.
-- If the column already exists, this will error, which is safe to ignore.
-- Skipping ALTER TABLE statements for columns that may already exist.
-- These columns should have been added by previous migrations:
--   ALTER TABLE users ADD COLUMN password_migrated INTEGER DEFAULT 0;
--   ALTER TABLE videos ADD COLUMN lesson_id TEXT;
--   ALTER TABLE videos ADD COLUMN lesson_type TEXT DEFAULT 'lecture';
--   ALTER TABLE courses ADD COLUMN semester TEXT DEFAULT NULL;
--   ALTER TABLE courses ADD COLUMN what_you_learn TEXT DEFAULT '[]';

-- 5. instructor_reviews table (for instructor ratings)
CREATE TABLE IF NOT EXISTS instructor_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instructor_id TEXT NOT NULL,
  course_id TEXT,
  user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(instructor_id, user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_instructor_reviews_instructor ON instructor_reviews(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_reviews_course ON instructor_reviews(course_id);

-- 6. watch_progress table (for student video progress tracking)
CREATE TABLE IF NOT EXISTS watch_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  watch_time INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, video_id)
);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_course ON watch_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_video ON watch_progress(video_id);

-- 7. chapters table (curriculum structure)
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  subject_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chapters_course_id ON chapters(course_id);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id);

-- 8. lessons table (curriculum structure)
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  subject_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT DEFAULT 'video',
  sort_order INTEGER DEFAULT 0,
  is_preview INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  duration INTEGER DEFAULT 0,
  video_url TEXT,
  thumbnail_url TEXT,
  document_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(chapter_id, sort_order);

-- 9. course_learning_points table (for "What You'll Learn")
CREATE TABLE IF NOT EXISTS course_learning_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  point_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_learning_points_course ON course_learning_points(course_id);

-- 10. course_instructors junction table
CREATE TABLE IF NOT EXISTS course_instructors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  instructor_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(course_id, instructor_id)
);
CREATE INDEX IF NOT EXISTS idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_instructor ON course_instructors(instructor_id);

-- 11. course_categories junction table
CREATE TABLE IF NOT EXISTS course_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(course_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_course_categories_course ON course_categories(course_id);
CREATE INDEX IF NOT EXISTS idx_course_categories_category ON course_categories(category_id);

-- 12. course_packages table
CREATE TABLE IF NOT EXISTS course_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  package_type TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  price REAL NOT NULL,
  duration_months INTEGER DEFAULT 6,
  max_users INTEGER DEFAULT 1,
  is_auto_assign INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_course_packages_course ON course_packages(course_id);
CREATE INDEX IF NOT EXISTS idx_course_packages_type ON course_packages(package_type);
CREATE INDEX IF NOT EXISTS idx_course_packages_active ON course_packages(is_active);

-- 13. Indexes for lesson_id on videos (column should exist from previous migration)
CREATE INDEX IF NOT EXISTS idx_videos_lesson_id ON videos(lesson_id);

-- 14. Columns semester and what_you_learn on courses should exist from previous migration
-- (Skipped ALTER TABLE — see note at section 4 above)
