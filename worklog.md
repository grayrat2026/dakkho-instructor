---
Task ID: 1
Agent: Main
Task: Implement Lazy + Progressive image loading for all images in student app

Work Log:
- Investigated all image rendering patterns across 15+ files in the student app
- Found 10 raw <img> tags across 9 files, 5 next/image usages (logo only), 4 Radix AvatarImage usages
- Created `/student-app/src/components/shared/ProgressiveImage.tsx` component with:
  - IntersectionObserver-based lazy loading (loads 200px before viewport entry)
  - Progressive blur-up: shimmer placeholder → smooth crossfade to actual image
  - Error fallback with gradient placeholders
  - Minimum blur time for smooth transition feel
- Added `bg-shimmer` and `shimmerSlide` CSS animations to `globals.css`
- Replaced all raw `<img>` tags in 9 files:
  - SearchPage.tsx (course thumbnail + instructor avatar)
  - EditProfilePage.tsx (user avatar)
  - ProfilePage.tsx (user avatar)
  - CourseDetailPage.tsx (2x instructor avatars)
  - WatchHistoryPage.tsx (video + course thumbnails)
  - InstructorProfilePage.tsx (cover image + avatar)
  - CourseCardGrid.tsx (course thumbnail)
  - MyCoursesPage.tsx (course thumbnail)
  - FeaturedInstructors.tsx (instructor avatar)
- Updated Radix AvatarImage with `loading="lazy"` and `decoding="async"`
- Build successful, committed, pushed to GitHub, deployed to Cloudflare

Stage Summary:
- ProgressiveImage component created and integrated across all pages
- Student app built and deployed to dakkho-student.pages.dev
- All images now use lazy loading + progressive blur-up
- README updated with new feature documentation
