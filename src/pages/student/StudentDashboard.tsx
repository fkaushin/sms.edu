import React from 'react';
import { CalendarCheck, FileText, TrendingUp, Clock, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email ? user.email.split('@')[0] : 'Student'}!</h1>
          <p className="text-blue-100 max-w-2xl">
            You have 2 upcoming assignments this week and your attendance is currently excellent. Keep up the good work!
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
            <p className="text-2xl font-bold text-slate-900">92%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Average Marks</p>
            <p className="text-2xl font-bold text-slate-900">85%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Tasks</p>
            <p className="text-2xl font-bold text-slate-900">3</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Recent Activities</h2>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {[
                { title: 'Math Midterm Graded', time: '2 hours ago', icon: Award, color: 'text-amber-500', bg: 'bg-amber-100' },
                { title: 'Absent for Physics', time: 'Yesterday', icon: CalendarCheck, color: 'text-red-500', bg: 'bg-red-100' },
                { title: 'Assignment Submitted', time: '3 days ago', icon: FileText, color: 'text-green-500', bg: 'bg-green-100' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`mt-1 p-2 rounded-full h-8 w-8 flex items-center justify-center ${activity.bg} ${activity.color}`}>
                    <activity.icon size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Performance Snapshot</h2>
            <button className="text-sm text-primary font-medium hover:underline">Details</button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { subject: 'Mathematics', score: 95, color: 'bg-green-500' },
                { subject: 'Physics', score: 82, color: 'bg-blue-500' },
                { subject: 'Chemistry', score: 78, color: 'bg-amber-500' },
                { subject: 'English', score: 88, color: 'bg-purple-500' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{stat.subject}</span>
                    <span className="font-bold text-slate-900">{stat.score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${stat.color}`} style={{ width: `${stat.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
