import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export const AttendanceCalendar: React.FC = () => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const getStatus = (day: number) => {
    if (day % 7 === 0) return 'absent';
    if (day % 15 === 0) return 'late';
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
                    'bg-yellow-50 border-yellow-200 text-yellow-700'}`}
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
