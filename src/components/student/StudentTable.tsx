import React from 'react';
import { Edit, Send, Copy, RefreshCw, Trash2 } from 'lucide-react';
import type { Student } from '../../types';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { toast } from 'sonner';

interface StudentTableProps {
  students: Student[];
}

export const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  const queryClient = useQueryClient();

  const sendCredsMutation = useMutation({
    mutationFn: async (studentId: string) => {
      return studentService.sendCredentials(studentId);
    },
    onSuccess: (data, studentId) => {
      const student = students.find(s => s.id === studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Credentials dispatched to ${studentName}!`);
      
      if (data.tempPassword) {
        // Offer clipboard copy
        navigator.clipboard.writeText(
          `University Email: ${student?.universityEmail}\nTemporary Password: ${data.tempPassword}`
        );
        toast.info('Credentials copied to clipboard!');
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to dispatch credentials');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (studentId: string) => {
      return studentService.deleteStudent(studentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete student');
    }
  });

  const handleDelete = (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`)) {
      deleteMutation.mutate(student.id);
    }
  };

  const handleCopy = (student: Student) => {
    navigator.clipboard.writeText(`University Email: ${student.universityEmail}\nPassword: Password123 (Default)`);
    toast.success('Default credentials details copied to clipboard!');
  };

  const getStatusBadge = (status: Student['accountStatus']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">ACTIVE</span>;
      case 'SUSPENDED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">SUSPENDED</span>;
      case 'PENDING':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">PENDING</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Enrollment No</th>
              <th className="px-6 py-4 font-medium">University Email</th>
              <th className="px-6 py-4 font-medium">Department</th>
              <th className="px-6 py-4 font-medium">Account Status</th>
              <th className="px-6 py-4 font-medium">Credentials Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{student.firstName} {student.lastName}</td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{student.enrollmentNo}</td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{student.universityEmail}</td>
                <td className="px-6 py-4 text-slate-600">{student.department}</td>
                <td className="px-6 py-4">{getStatusBadge(student.accountStatus)}</td>
                <td className="px-6 py-4">
                  {student.credentialsSent ? (
                    <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                      <span>Sent</span>
                      {student.credentialsSentAt && (
                        <span className="text-slate-400 font-normal">
                          ({new Date(student.credentialsSentAt).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-amber-600 text-xs font-medium">Pending Send</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                  <button 
                    onClick={() => sendCredsMutation.mutate(student.id)}
                    disabled={sendCredsMutation.isPending}
                    title={student.credentialsSent ? "Resend Credentials" : "Send Credentials"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {student.credentialsSent ? (
                      <><RefreshCw size={14} /> Resend</>
                    ) : (
                      <><Send size={14} /> Send</>
                    )}
                  </button>
                  <button 
                    onClick={() => handleCopy(student)}
                    title="Copy Default Info"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <Link 
                    to={`/admin/students/${student.id}/edit`} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <Edit size={14} /> Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(student)}
                    disabled={deleteMutation.isPending}
                    title="Delete Student"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
