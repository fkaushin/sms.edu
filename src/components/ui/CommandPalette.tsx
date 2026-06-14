import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, CalendarCheck, FileText, Settings, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen || !user) return null;

  const adminCommands = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Attendance', icon: CalendarCheck, path: '/admin/attendance' },
    { name: 'Marks', icon: FileText, path: '/admin/marks' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const studentCommands = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { name: 'My Attendance', icon: CalendarCheck, path: '/student/attendance' },
    { name: 'My Marks', icon: FileText, path: '/student/marks' },
    { name: 'Settings', icon: Settings, path: '/student/profile' },
  ];

  const commands = user.role === 'ADMIN' ? adminCommands : studentCommands;
  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] sm:pt-[25vh]">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex items-center border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            className="h-14 w-full border-0 bg-transparent px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white"
            placeholder="Search commands... (Esc to close)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <p className="p-4 text-center text-sm text-slate-500">No results found.</p>
          ) : (
            filteredCommands.map((command) => (
              <button
                key={command.path}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => handleSelect(command.path)}
              >
                <command.icon className="h-5 w-5" />
                {command.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
