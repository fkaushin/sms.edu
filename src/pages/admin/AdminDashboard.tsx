import React from 'react';
import { Users, UserCheck, CalendarDays, Activity } from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { AttendanceChart } from '../../components/dashboard/AttendanceChart';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { useRealtimeDashboard } from '../../hooks/useRealtimeDashboard';
import { StatCardSkeleton, ActivitySkeleton } from '../../components/ui/Skeleton';

export const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: dashboardService.getAdminStats
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => dashboardService.getRecentActivities(5)
  });

  // Live updates via Supabase Realtime
  useRealtimeDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, here's what's happening today.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Students" value={stats?.totalStudents?.toString() || '0'} icon={Users} colorClass="text-primary bg-blue-100" />
          <StatCard title="Active Students" value={stats?.activeStudents?.toString() || '0'} icon={UserCheck} colorClass="text-success bg-green-100" />
          <StatCard title="Present Today" value={stats?.presentToday?.toString() || '0'} icon={CalendarDays} colorClass="text-warning bg-yellow-100" />
          <StatCard title="Avg. Attendance" value={`${stats?.averageAttendance || 0}%`} icon={Activity} colorClass="text-purple-600 bg-purple-100" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceChart />
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm col-span-1">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {activitiesLoading ? (
              <>
                <ActivitySkeleton /><ActivitySkeleton /><ActivitySkeleton />
              </>
            ) : activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                   <div>
                     <p className="text-sm font-medium text-slate-900">{act.title}</p>
                     <p className="text-xs text-slate-500">{new Date(act.timestamp).toLocaleString()}</p>
                   </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-sm">No recent activities.</div>
            )}
          </div>
          <button className="w-full mt-6 text-sm text-primary font-medium hover:text-blue-800 transition-colors">
            View all activities
          </button>
        </div>
      </div>
    </div>
  );
};
