import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface AttendanceCalendarProps {
  attendanceRecords: any[];
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ attendanceRecords }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatus = (day: number) => {
    // Format current day to match record dates (YYYY-MM-DD)
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const recordsForDay = attendanceRecords.filter(r => r.date === dateStr);
    
    if (recordsForDay.length === 0) return 'none';
    
    // If there's any absent record for that day, mark it as absent (or customize logic)
    const hasAbsent = recordsForDay.some(r => r.status === 'ABSENT');
    const hasLate = recordsForDay.some(r => r.status === 'LATE');
    
    if (hasAbsent) return 'absent';
    if (hasLate) return 'late';
    return 'present';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">{d}</div>
          ))}
          {days.map(day => {
            const status = getStatus(day);
            return (
              <div 
                key={day} 
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium border
                  ${status === 'present' ? 'bg-green-50 border-green-200 text-green-700' : 
                    status === 'absent' ? 'bg-red-50 border-red-200 text-red-700' : 
                    status === 'late' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    'bg-slate-50 border-slate-100 text-slate-400'}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
