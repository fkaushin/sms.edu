import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, FileText,
  BarChart3, Settings, LogOut, X, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/admin',            end: true,  icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students',   end: false, icon: Users,           label: 'Students' },
    { to: '/admin/attendance', end: false, icon: CalendarCheck,   label: 'Attendance' },
    { to: '/admin/marks',      end: false, icon: FileText,        label: 'Marks' },
    { to: '/admin/reports',    end: false, icon: BarChart3,       label: 'Reports' },
    { to: '/admin/settings',   end: false, icon: Settings,        label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col',
        'bg-white border-r border-slate-200',
        'transform transition-transform duration-300 ease-in-out md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">SMS Admin</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200 ease-in-out',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Active left bar */}
                  <span className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-600 transition-all duration-200',
                    isActive ? 'h-6 opacity-100' : 'h-0 opacity-0'
                  )} />

                  {/* Icon */}
                  <item.icon
                    size={18}
                    className={cn(
                      'flex-shrink-0 transition-all duration-200',
                      isActive ? 'text-blue-600 scale-110' : 'group-hover:scale-105'
                    )}
                  />

                  {/* Label */}
                  <span className="flex-1">{item.label}</span>

                  {/* Active pulse dot */}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={logout}
            className="group flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
