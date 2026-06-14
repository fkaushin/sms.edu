import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, FileText, UserCircle, KeyRound, LogOut, X, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const StudentSidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  
  const allNavItems = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/attendance', icon: CalendarCheck, label: 'My Attendance' },
    { to: '/student/marks', icon: FileText, label: 'My Marks' },
    { to: '/student/profile', icon: UserCircle, label: 'My Profile' },
    { to: '/student/change-password', icon: KeyRound, label: 'Change Password' },
  ];

  // If first login is not completed, only show change password menu option
  const navItems = user?.firstLoginCompleted 
    ? allNavItems 
    : allNavItems.filter(item => item.to === '/student/change-password');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col",
        "bg-white dark:bg-slate-900",
        "border-r border-slate-200 dark:border-slate-800",
        "transform transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">SMS</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Active left bar indicator */}
                  <span className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-600 transition-all duration-200",
                    isActive ? "h-6 opacity-100" : "h-0 opacity-0"
                  )} />
                  
                  {/* Icon */}
                  <item.icon 
                    size={18} 
                    className={cn(
                      "transition-all duration-200 flex-shrink-0",
                      isActive 
                        ? "text-indigo-600 dark:text-indigo-400 scale-110" 
                        : "group-hover:scale-105"
                    )} 
                  />
                  
                  {/* Label */}
                  <span className="flex-1">{item.label}</span>

                  {/* Active dot */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={logout}
            className="group flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
