import React, { useState, useEffect } from 'react';
import { AttendanceFilters } from '../../components/attendance/AttendanceFilters';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import type { Status } from '../../types';
import { toast } from 'sonner';

export const AttendanceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [attendance, setAttendance] = useState<Record<string, Status>>({});

  const queryClient = useQueryClient();

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const { data: existingAttendance } = useQuery({
    queryKey: ['attendance', date, subjectId],
    queryFn: () => attendanceService.getAttendanceForDate(date, subjectId),
    enabled: !!subjectId && !!date
  });

  useEffect(() => {
    if (existingAttendance) {
      setAttendance(existingAttendance);
    } else {
      setAttendance({});
    }
  }, [existingAttendance, subjectId, date]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    // In students we have `department` name, not ID. Let's find department name using `attendanceService.getDepartments`
    // or we can fetch departments and map. But to simplify, let's assume we fetch departments and filter.
    // However, the `Student` object has `department` (name). If `departmentId` is selected, we need to map it.
    return matchesSearch; // We will filter by department below if possible, but the mock studentService only returns department string name
  });

  // To properly filter by department, we fetch departments to get the name mapping.
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: attendanceService.getDepartments
  });

  const selectedDeptName = departments.find(d => d.id === departmentId)?.name;

  const finalStudents = filteredStudents.filter(s => {
    return selectedDeptName ? s.department === selectedDeptName : true;
  });

  const handleStatusChange = (studentId: string, status: Status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, Status> = { ...attendance };
    finalStudents.forEach(s => newAttendance[s.id] = 'PRESENT');
    setAttendance(newAttendance);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!subjectId) throw new Error('Please select a subject first');
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id,
        subject_id: subjectId,
        date,
        status
      }));
      return attendanceService.markBulkAttendance(records);
    },
    onSuccess: () => {
      toast.success('Attendance saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save attendance');
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Record and manage daily student attendance.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={markAllPresent}
            disabled={finalStudents.length === 0}
            className="border-slate-200 text-slate-700 bg-white"
          >
            Mark All Present
          </Button>
          <Button 
            onClick={() => saveMutation.mutate()} 
            disabled={saveMutation.isPending || !subjectId}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      <AttendanceFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        date={date}
        setDate={setDate}
        departmentId={departmentId}
        setDepartmentId={setDepartmentId}
        subjectId={subjectId}
        setSubjectId={setSubjectId}
      />
      
      {!subjectId ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Please select a department and subject to mark attendance.</p>
        </div>
      ) : (
        <AttendanceTable 
          students={finalStudents}
          attendance={attendance}
          handleStatusChange={handleStatusChange}
          isLoading={isLoadingStudents}
        />
      )}
    </div>
  );
};
