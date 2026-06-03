'use client';

import { useAdminStore } from '@/lib/store';
import { assetUrl } from '@/lib/api-client';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  GraduationCap,
  Building2,
  Bell,
  Settings,
  Mail,
  BarChart3,
  Tags,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'instructors', label: 'Instructors', icon: GraduationCap },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'institutes', label: 'Institutes', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'config', label: 'App Config', icon: Settings },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'System', icon: Wrench },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentPage, setCurrentPage } = useAdminStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-white/[0.06] bg-[rgba(15,15,26,0.95)] backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src={assetUrl('/dakkho-logo.png')} alt="DAKKHO" className="w-7 h-7 object-contain" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-lg font-bold text-white whitespace-nowrap">DAKKHO</h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">Admin Panel</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-dakkho-blue/10 text-dakkho-blue'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-dakkho-blue' : ''}`} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
