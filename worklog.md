---
Task ID: 1
Agent: Main Agent
Task: Add instructor CRUD API endpoints + Build instructor CRUD UI + Add instructors to D1

Work Log:
- Added 13 new instructor CRUD endpoints to worker/src/routes/instructor.ts:
  - POST /courses (create course)
  - PUT /courses/:id (update own course)
  - DELETE /courses/:id (delete draft course)
  - GET /courses/:id/curriculum (full curriculum with chapters + lessons + resources)
  - POST /courses/:id/chapters (create chapter)
  - PUT /courses/:id/chapters/:chapterId (update chapter)
  - DELETE /courses/:id/chapters/:chapterId (delete chapter + lessons)
  - POST /courses/:id/lessons (create lesson)
  - PUT /courses/:id/lessons/:lessonId (update lesson)
  - DELETE /courses/:id/lessons/:lessonId (delete lesson)
  - GET /courses/:id/resources (list resources)
  - POST /courses/:id/resources (upload resource to R2)
  - DELETE /courses/:id/resources/:resourceId (delete resource)
- Added helper functions: slugify(), verifyCourseOwnership(), getInstructorId()
- Created migration-instructor-crud.sql with course_resources, instructor_sessions, otp_codes, instructor_reviews, watch_progress tables
- Executed migration on remote D1 database
- Deployed worker to Cloudflare

- Updated instructor-api-client.ts with 11 new API methods and 3 new types (ChapterItem, LessonItem, ResourceItem)
- Created CourseEditor.tsx (1519 lines) with 4 tabs: Details, Curriculum, Resources, Preview
- Updated InstructorShell.tsx with course-editor route and "Create Course" button
- Updated Courses.tsx with "Create New Course" button
- Updated CourseDetail.tsx with "Edit Course" button

- Created seed-instructors.sql with 5 instructors
- Seeded instructors to D1: JOTISH Chandro, Himadri Shekhor, Engr. Aminul Islam, Dr. Nadia Rahman, Fahim Shahriar
- All instructors have email @dakkho.pro.bd, password: Dakkho@2026

- Built and deployed student app to Cloudflare Pages

Stage Summary:
- Instructor CRUD API fully functional (tested with curl)
- Instructor login works for all 5 instructors
- Course creation, chapter creation, lesson creation all verified working
- Frontend deployed with CourseEditor page
- Sites: https://dakkho-student.pages.dev/ (student/instructor), https://dakkho-admin-api.dakkho-admin.workers.dev (API)
