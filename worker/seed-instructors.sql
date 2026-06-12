-- ============================================================
-- Seed Instructors - JOTISH Chandro, Himadri Shekhor & others
-- Also creates corresponding users table entries for auth
-- ============================================================

-- 1. Create instructor users in the users table (role = 'instructor')
-- Password for all: "Dakkho@2026" (hashed with PBKDF2)
-- We'll use a placeholder hash and let the first login reset handle it
-- For now, we use SHA-256 of "Dakkho@2026" as initial hash
-- SHA-256("Dakkho@2026") = will be set via API

-- JOTISH Chandro - instructor
INSERT OR IGNORE INTO users (id, email, full_name, role, password_hash, is_active, email_verified, password_migrated)
VALUES (
  'instructor-jotish',
  'jotish.chandro@dakkho.pro.bd',
  'JOTISH Chandro',
  'instructor',
  '7cd9bc0865fbb74dab47b9034e35fdbe7c5c22c49764622b86e5952e96209f56',
  1, 1, 1
);

-- Himadri Shekhor - instructor
INSERT OR IGNORE INTO users (id, email, full_name, role, password_hash, is_active, email_verified, password_migrated)
VALUES (
  'instructor-himadri',
  'himadri.shekhor@dakkho.pro.bd',
  'Himadri Shekhor',
  'instructor',
  '7cd9bc0865fbb74dab47b9034e35fdbe7c5c22c49764622b86e5952e96209f56',
  1, 1, 1
);

-- Engr. Aminul Islam - instructor (founder)
INSERT OR IGNORE INTO users (id, email, full_name, role, password_hash, is_active, email_verified, password_migrated)
VALUES (
  'instructor-aminul',
  'aminul.islam@dakkho.pro.bd',
  'Engr. Aminul Islam',
  'instructor',
  '7cd9bc0865fbb74dab47b9034e35fdbe7c5c22c49764622b86e5952e96209f56',
  1, 1, 1
);

-- Dr. Nadia Rahman - instructor
INSERT OR IGNORE INTO users (id, email, full_name, role, password_hash, is_active, email_verified, password_migrated)
VALUES (
  'instructor-nadia',
  'nadia.rahman@dakkho.pro.bd',
  'Dr. Nadia Rahman',
  'instructor',
  '7cd9bc0865fbb74dab47b9034e35fdbe7c5c22c49764622b86e5952e96209f56',
  1, 1, 1
);

-- Fahim Shahriar - instructor
INSERT OR IGNORE INTO users (id, email, full_name, role, password_hash, is_active, email_verified, password_migrated)
VALUES (
  'instructor-fahim',
  'fahim.shahriar@dakkho.pro.bd',
  'Fahim Shahriar',
  'instructor',
  '7cd9bc0865fbb74dab47b9034e35fdbe7c5c22c49764622b86e5952e96209f56',
  1, 1, 1
);

-- 2. Create instructor profiles in the instructors table
INSERT OR IGNORE INTO instructors (id, name, email, bio, avatar_url, specialization, rating, total_students, total_courses, social_links, is_active)
VALUES (
  'instructor-jotish',
  'JOTISH Chandro',
  'jotish.chandro@dakkho.pro.bd',
  'Experienced instructor specializing in Computer Science and Technology. Passionate about making technical education accessible to polytechnic students across Bangladesh.',
  NULL,
  'Computer Science & Technology',
  0, 0, 0, '{}', 1
);

INSERT OR IGNORE INTO instructors (id, name, email, bio, avatar_url, specialization, rating, total_students, total_courses, social_links, is_active)
VALUES (
  'instructor-himadri',
  'Himadri Shekhor',
  'himadri.shekhor@dakkho.pro.bd',
  'Dedicated instructor with expertise in Electrical and Electronics Technology. Committed to providing hands-on learning experiences for diploma engineering students.',
  NULL,
  'Electrical & Electronics Technology',
  0, 0, 0, '{}', 1
);

INSERT OR IGNORE INTO instructors (id, name, email, bio, avatar_url, specialization, rating, total_students, total_courses, social_links, is_active)
VALUES (
  'instructor-aminul',
  'Engr. Aminul Islam',
  'aminul.islam@dakkho.pro.bd',
  'Founder & CEO of DAKKHO. A visionary engineer dedicated to transforming technical education in Bangladesh through technology and innovation.',
  NULL,
  'Civil Engineering & Technology',
  4.8, 500, 12, '{"linkedin":"https://linkedin.com/in/aminulislam","facebook":"https://facebook.com/aminulislam"}', 1
);

INSERT OR IGNORE INTO instructors (id, name, email, bio, avatar_url, specialization, rating, total_students, total_courses, social_links, is_active)
VALUES (
  'instructor-nadia',
  'Dr. Nadia Rahman',
  'nadia.rahman@dakkho.pro.bd',
  'Chief Academic Officer at DAKKHO. PhD in Education Technology with over 10 years of teaching experience at leading polytechnic institutes.',
  NULL,
  'Education Technology',
  4.9, 800, 15, '{"linkedin":"https://linkedin.com/in/nadiarahman"}', 1
);

INSERT OR IGNORE INTO instructors (id, name, email, bio, avatar_url, specialization, rating, total_students, total_courses, social_links, is_active)
VALUES (
  'instructor-fahim',
  'Fahim Shahriar',
  'fahim.shahriar@dakkho.pro.bd',
  'Lead Developer and Instructor at DAKKHO. Full-stack developer with a passion for teaching web development and software engineering.',
  NULL,
  'Web Development & Software Engineering',
  4.7, 350, 8, '{"linkedin":"https://linkedin.com/in/fahimshahriar","github":"https://github.com/fahimshahriar"}', 1
);
