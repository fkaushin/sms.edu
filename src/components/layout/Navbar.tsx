import React from 'react';
import { Menu, Bell, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 fixed top-0 right-0 left-0 md:left-64 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold">
            <UserIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};
