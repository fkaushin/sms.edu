import React from 'react';
import { AttendanceFilters } from '../../components/attendance/AttendanceFilters';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { Button } from '../../components/ui/Button';

export const AttendanceManagement: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Record and manage daily student attendance.</p>
        </div>
        <Button onClick={() => alert('Attendance Saved!')}>Save Attendance</Button>
      </div>

      <AttendanceFilters />
      <AttendanceTable />
    </div>
  );
};
