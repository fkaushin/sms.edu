import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Send, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StudentTable } from '../../components/student/StudentTable';
import { StudentFilters } from '../../components/student/StudentFilters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { toast } from 'sonner';

export const StudentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('');
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      return studentService.sendCredentialsBulk();
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Dispatched credentials to ${count} pending students successfully!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to dispatch bulk credentials');
    }
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = department ? s.department === department : true;
    return matchesSearch && matchesDept;
  });

  const pendingCount = students.filter(s => s.accountStatus === 'PENDING').length;

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading students...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Failed to load students.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all registered students in the system.</p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button
              variant="ghost"
              disabled={bulkMutation.isPending}
              onClick={() => bulkMutation.mutate()}
              className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {bulkMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Send Credentials to All Pending ({pendingCount})
            </Button>
          )}
          <Link to="/admin/students/new">
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      <StudentFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        department={department}
        setDepartment={setDepartment}
      />

      <StudentTable students={filteredStudents} />
    </div>
  );
};
