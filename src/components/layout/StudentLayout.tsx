import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'STUDENT') {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  // Force student to update password on first login
  if (!user.firstLoginCompleted && location.pathname !== '/student/change-password') {
    return <Navigate to="/student/change-password" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <StudentSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <Navbar setSidebarOpen={setSidebarOpen} />
      
      <main className="pt-16 md:pl-64 transition-all duration-300">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
