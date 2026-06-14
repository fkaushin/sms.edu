import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, FileText, UserCircle, KeyRound, LogOut, X } from 'lucide-react';
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
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <span className="text-xl font-bold text-primary">SMS Student</span>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-primary" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-danger hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
