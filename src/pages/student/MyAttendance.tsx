import React from 'react';
import { AttendanceSummaryCards } from '../../components/attendance/AttendanceSummaryCards';
import { AttendanceCalendar } from '../../components/attendance/AttendanceCalendar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendanceService';
import { useAuth } from '../../contexts/AuthContext';

export const MyAttendance: React.FC = () => {
  const { user } = useAuth();
  
  const { data: attendanceHistory = [], isLoading } = useQuery({
    queryKey: ['myAttendance', user?.id],
    queryFn: () => attendanceService.getAttendance(user?.id),
    enabled: !!user?.id
  });
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">View your attendance history and statistics.</p>
      </div>

      <AttendanceSummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AttendanceCalendar />
        </div>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">Loading history...</td>
                    </tr>
                  ) : attendanceHistory.length > 0 ? (
                    attendanceHistory.map(record => (
                      <tr key={record.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{record.date}</td>
                        <td className="px-4 py-3 text-slate-600">{record.subject}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No attendance history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
