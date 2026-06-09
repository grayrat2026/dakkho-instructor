'use client';

import { usePathname } from 'next/navigation';
import { useAdminStore } from '@/lib/store';
import { apiDelete, clearAuthToken } from '@/lib/api-client';
import { motion } from 'framer-motion';
import {
  LogOut,
  Menu,
  Search,
  Bell,
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  GraduationCap,
  Tags,
  Building2,
  FileQuestion,
  Tag,
  Percent,
  Calendar,
  VideoIcon,
  CreditCard,
  Send,
  Settings,
  Mail,
  BarChart3,
  Cpu,
  Package,
  Trophy,
  ClipboardList,
  ChevronRight,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { LucideIcon } from 'lucide-react';

// ─── Page Configuration ────────────────────────────────────────────────────────

interface PageConfig {
  title: string;
  description: string;
  icon: LucideIcon;
}

const pageConfig: Record<string, PageConfig> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Overview of platform metrics and activity',
    icon: LayoutDashboard,
  },
  users: {
    title: 'Users',
    description: 'Manage student and instructor accounts',
    icon: Users,
  },
  courses: {
    title: 'Courses',
    description: 'Create and manage course content',
    icon: BookOpen,
  },
  videos: {
    title: 'Videos',
    description: 'Upload and organize video lessons',
    icon: Video,
  },
  instructors: {
    title: 'Instructors',
    description: 'Manage instructor profiles and assignments',
    icon: GraduationCap,
  },
  categories: {
    title: 'Categories',
    description: 'Organize courses into categories',
    icon: Tags,
  },
  institutes: {
    title: 'Institutes',
    description: 'Manage affiliated educational institutes',
    icon: Building2,
  },
  technologies: {
    title: 'Technologies',
    description: 'Manage technology departments',
    icon: Cpu,
  },
  'institute-requests': {
    title: 'Institute Requests',
    description: 'Review and approve institute applications',
    icon: FileQuestion,
  },
  coupons: {
    title: 'Coupons',
    description: 'Create and manage discount coupons',
    icon: Tag,
  },
  discounts: {
    title: 'Discounts',
    description: 'Configure automatic discounts',
    icon: Percent,
  },
  events: {
    title: 'Events & Special Days',
    description: 'Schedule and manage events',
    icon: Calendar,
  },
  'live-classes': {
    title: 'Live Classes',
    description: 'Schedule and manage live sessions',
    icon: VideoIcon,
  },
  payments: {
    title: 'Payments',
    description: 'Track and verify payment transactions',
    icon: CreditCard,
  },
  packages: {
    title: 'Packages',
    description: 'Manage course packages and pricing',
    icon: Package,
  },
  achievements: {
    title: 'Achievements',
    description: 'Configure student achievement badges',
    icon: Trophy,
  },
  enrollments: {
    title: 'Enrollments',
    description: 'Track student course enrollments',
    icon: ClipboardList,
  },
  push: {
    title: 'Push Notifications',
    description: 'Send push notifications to users',
    icon: Send,
  },
  notifications: {
    title: 'Notifications',
    description: 'Manage in-app notification logs',
    icon: Bell,
  },
  config: {
    title: 'App Config',
    description: 'Configure app features and settings',
    icon: Settings,
  },
  email: {
    title: 'Email',
    description: 'Manage email templates and delivery',
    icon: Mail,
  },
  analytics: {
    title: 'Analytics',
    description: 'View platform analytics and reports',
    icon: BarChart3,
  },
  settings: {
    title: 'System',
    description: 'System settings and administration',
    icon: Settings,
  },
};

const defaultPageConfig: PageConfig = {
  title: 'Dashboard',
  description: 'Overview of platform metrics and activity',
  icon: LayoutDashboard,
};

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const {
    adminUser,
    setAdminUser,
    setSidebarMobileOpen,
    searchQuery,
    setSearchQuery,
    unreadNotificationCount,
  } = useAdminStore();
  const { toast } = useToast();

  // Resolve current page from pathname
  const currentPage = (() => {
    const clean = (pathname || '').replace(/^\/+|\/+$/g, '');
    const segments = clean.split('/');
    const twoSeg = segments.length >= 2 ? `${segments[0]}-${segments[1]}` : '';
    if (pageConfig[twoSeg]) return twoSeg;
    const first = segments[0] || 'dashboard';
    return pageConfig[first] ? first : 'dashboard';
  })();

  const config = pageConfig[currentPage] || defaultPageConfig;
  const PageIcon = config.icon;

  const handleLogout = async () => {
    try {
      await apiDelete('/auth/logout');
      clearAuthToken();
      setAdminUser(null);
      toast({ title: 'Logged out', description: 'You have been signed out' });
    } catch {
      toast({ title: 'Error', description: 'Failed to logout', variant: 'destructive' });
    }
  };

  const userInitial =
    adminUser?.name?.charAt(0)?.toUpperCase() ||
    adminUser?.email?.charAt(0)?.toUpperCase() ||
    'A';

  return (
    <header className="fixed top-0 right-0 left-0 z-30 h-16 flex items-center border-b border-white/[0.05] bg-[rgba(9,9,24,0.8)] backdrop-blur-xl">
      <motion.div
        className="w-full h-full flex items-center justify-between px-4 md:px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Left Section ─────────────────────────────────────────────── */}
        <motion.div
          className="flex items-center gap-3 min-w-0"
          variants={itemVariants}
        >
          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-white h-10 w-10 flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb-style page title */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 text-muted-foreground/60 text-sm">
              <span className="hidden sm:inline">DAKKHO</span>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-dakkho-blue/10 flex items-center justify-center flex-shrink-0">
                <PageIcon className="h-4 w-4 text-dakkho-blue" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-white leading-tight truncate">
                  {config.title}
                </h2>
                <p className="text-[11px] text-muted-foreground/70 leading-tight truncate hidden md:block">
                  {config.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Center Section — Search Bar (desktop only) ───────────────── */}
        <motion.div
          className="hidden lg:flex items-center flex-1 max-w-md mx-8"
          variants={itemVariants}
        >
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-dakkho-blue/70 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full h-10 pl-10 pr-20 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm text-sm text-white placeholder:text-muted-foreground/40 outline-none transition-all duration-200 focus:border-dakkho-blue/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-dakkho-blue/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden xl:inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] text-[10px] text-muted-foreground/50 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        </motion.div>

        {/* ── Right Section ────────────────────────────────────────────── */}
        <motion.div
          className="flex items-center gap-1 sm:gap-2"
          variants={itemVariants}
        >
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            title="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadNotificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[9px] font-bold text-white leading-none"
              >
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </motion.span>
            )}
          </Button>

          {/* Separator */}
          <div className="h-6 w-px bg-white/[0.06] mx-1 hidden sm:block" />

          {/* User Avatar + Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-dakkho-blue/30">
                <div className="relative flex-shrink-0">
                  <div className="rounded-full p-[1.5px] bg-gradient-to-tr from-dakkho-blue via-purple-500 to-dakkho-blue">
                    <Avatar className="h-8 w-8 border-2 border-[rgba(9,9,24,0.8)]">
                      <AvatarFallback className="bg-dakkho-blue/20 text-dakkho-blue text-xs font-semibold">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-sm font-medium text-white leading-tight truncate max-w-[120px]">
                    {adminUser?.name || 'Admin'}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 leading-tight capitalize truncate max-w-[120px]">
                    {adminUser?.role || 'Administrator'}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-[rgba(15,15,26,0.95)] backdrop-blur-xl border-white/[0.08] shadow-xl shadow-black/20"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-white">
                    {adminUser?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {adminUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                className="text-muted-foreground focus:text-white focus:bg-white/5 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout button — visible on mobile as icon only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="md:hidden text-muted-foreground hover:text-red-400 h-10 w-10"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </header>
  );
}
