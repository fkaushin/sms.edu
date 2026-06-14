import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';

export const AttendanceTable: React.FC = () => {
  const { data: mockStudents = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    mockStudents.forEach(s => newAttendance[s.id] = 'PRESENT');
    setAttendance(newAttendance);
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading students...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={markAllPresent} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
          Mark All Present
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Enrollment No</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 text-slate-600">{student.enrollmentNo}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${attendance[student.id] === 'PRESENT' ? 'bg-success text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${attendance[student.id] === 'ABSENT' ? 'bg-danger text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Absent
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${attendance[student.id] === 'LATE' ? 'bg-warning text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Late
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
