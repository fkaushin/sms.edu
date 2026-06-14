import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CommandPalette } from './components/ui/CommandPalette';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy load layouts
const AdminLayout = React.lazy(() => import('./components/layout/AdminLayout').then(m => ({ default: m.AdminLayout })));
const StudentLayout = React.lazy(() => import('./components/layout/StudentLayout').then(m => ({ default: m.StudentLayout })));

// Lazy load pages
const Login = React.lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const StudentList = React.lazy(() => import('./pages/admin/StudentList').then(m => ({ default: m.StudentList })));
const StudentAdd = React.lazy(() => import('./pages/admin/StudentAdd').then(m => ({ default: m.StudentAdd })));
const StudentEdit = React.lazy(() => import('./pages/admin/StudentEdit').then(m => ({ default: m.StudentEdit })));
const AttendanceManagement = React.lazy(() => import('./pages/admin/AttendanceManagement').then(m => ({ default: m.AttendanceManagement })));
const MarksManagement = React.lazy(() => import('./pages/admin/MarksManagement').then(m => ({ default: m.MarksManagement })));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports').then(m => ({ default: m.AdminReports })));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const MyAttendance = React.lazy(() => import('./pages/student/MyAttendance').then(m => ({ default: m.MyAttendance })));
const MyMarks = React.lazy(() => import('./pages/student/MyMarks').then(m => ({ default: m.MyMarks })));
const StudentProfile = React.lazy(() => import('./pages/student/StudentProfile').then(m => ({ default: m.StudentProfile })));
const StudentChangePassword = React.lazy(() => import('./pages/student/StudentChangePassword').then(m => ({ default: m.StudentChangePassword })));

// Loading Fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sms-theme">
      <AuthProvider>
        <BrowserRouter>
          <CommandPalette />
          <Toaster position="top-right" richColors />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="students">
                    <Route index element={<StudentList />} />
                    <Route path="new" element={<StudentAdd />} />
                    <Route path=":id/edit" element={<StudentEdit />} />
                  </Route>
                  <Route path="attendance" element={<AttendanceManagement />} />
                  <Route path="marks" element={<MarksManagement />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="/student" element={<StudentLayout />}>
                  <Route index element={<Navigate to="/student/dashboard" replace />} />
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="attendance" element={<MyAttendance />} />
                  <Route path="marks" element={<MyMarks />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="change-password" element={<StudentChangePassword />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
