import React from 'react';
import { CalendarCheck, FileText, TrendingUp, Clock, Award, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: student } = useQuery({
    queryKey: ['studentProfile', user?.id],
    queryFn: () => studentService.getStudentById(user!.id),
    enabled: !!user?.id,
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ['studentDashboardStats', user?.id],
    queryFn: () => studentService.getStudentDashboardStats(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const attendance = stats?.attendancePercentage ?? 0;
  const averageMarks = stats?.averageMarks ?? 0;
  const totalSubjects = stats?.performanceSnapshot?.length ?? 0;

  const getActivityIcon = (type: string) => {
    if (type.toLowerCase().includes('mark') || type.toLowerCase().includes('grade')) return Award;
    if (type.toLowerCase().includes('absent')) return CalendarCheck;
    return FileText;
  };

  const getActivityColor = (type: string) => {
    if (type.toLowerCase().includes('mark') || type.toLowerCase().includes('grade')) return 'text-amber-500 bg-amber-100';
    if (type.toLowerCase().includes('absent')) return 'text-red-500 bg-red-100';
    return 'text-green-500 bg-green-100';
  };

  const getSubjectColor = (index: number) => {
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const firstName = capitalize(student?.firstName);
  const lastName = capitalize(student?.lastName);
  const welcomeName = lastName.length >= 4 ? lastName : (firstName || 'Student');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {welcomeName}!</h1>
          <p className="text-blue-100 max-w-2xl">
            {attendance >= 80 
              ? 'Your attendance is currently excellent. Keep up the good work!' 
              : 'Your attendance is falling behind. Please try to attend more classes.'}
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8">
          <Award size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-lg">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Overall Attendance</p>
            <p className="text-2xl font-bold text-slate-900">{attendance}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Average Marks</p>
            <p className="text-2xl font-bold text-slate-900">{averageMarks}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Enrolled Subjects</p>
            <p className="text-2xl font-bold text-slate-900">{totalSubjects}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {stats?.recentActivities.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent activities found.</p>
              ) : (
                stats?.recentActivities.map((activity: any, i: number) => {
                  const Icon = getActivityIcon(activity.title);
                  const colorClass = getActivityColor(activity.title);
                  return (
                    <div key={i} className="flex gap-4">
                      <div className={`mt-1 p-2 rounded-full h-8 w-8 flex items-center justify-center ${colorClass}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{activity.title}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Performance Snapshot</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats?.performanceSnapshot.length === 0 ? (
                <p className="text-slate-500 text-sm">No performance data available yet.</p>
              ) : (
                stats?.performanceSnapshot.map((stat: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{stat.subject}</span>
                      <span className="font-bold text-slate-900">{stat.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${getSubjectColor(i)}`} style={{ width: `${stat.score}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
