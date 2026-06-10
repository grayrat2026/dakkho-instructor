/**
 * Type definitions for DAKKHO Admin API on Cloudflare Workers
 * All Appwrite references removed — D1 only
 */
export const DEFAULT_CONFIG = {
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
