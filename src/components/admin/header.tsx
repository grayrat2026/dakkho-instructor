'use client';

import { useAdminStore } from '@/lib/store';
import { apiDelete, clearAuthToken } from '@/lib/api-client';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function Header() {
  const { adminUser, setAdminUser, sidebarCollapsed, toggleSidebar, currentPage } = useAdminStore();
  const { toast } = useToast();

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

  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace(/-/g, ' ');

  return (
    <motion.header
      initial={false}
      animate={{ paddingLeft: sidebarCollapsed ? 72 + 24 : 256 + 24 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed top-0 right-0 left-0 z-30 h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[rgba(15,15,26,0.8)] backdrop-blur-xl"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden text-muted-foreground hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-white">{pageTitle}</h2>
          <p className="text-xs text-muted-foreground">DAKKHO Admin Panel</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <span>{adminUser?.email}</span>
        </div>
        <Avatar className="h-8 w-8 border border-dakkho-blue/30">
          <AvatarFallback className="bg-dakkho-blue/20 text-dakkho-blue text-xs font-semibold">
            {adminUser?.name?.charAt(0)?.toUpperCase() || adminUser?.email?.charAt(0)?.toUpperCase() || 'A'}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-dakkho-danger"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </motion.header>
  );
}
