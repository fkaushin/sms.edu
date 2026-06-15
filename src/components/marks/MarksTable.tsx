import React from 'react';
import type { Student } from '../../types';
import { FileEdit } from 'lucide-react';

interface MarksTableProps {
  students: Student[];
  isLoading: boolean;
  onEnterMarks: (student: Student) => void;
}

export const MarksTable: React.FC<MarksTableProps> = ({ students, isLoading, onEnterMarks }) => {
  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading students...</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-medium">Student Name</th>
              <th className="px-6 py-4 font-medium">Enrollment No</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{student.firstName} {student.lastName}</td>
                <td className="px-6 py-4 text-slate-600">{student.enrollmentNo}</td>
                <td className="px-6 py-4 text-slate-600">{student.department}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onEnterMarks(student)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                  >
                    <FileEdit size={14} /> Enter Marks
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No students found in this department.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
