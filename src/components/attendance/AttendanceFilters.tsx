import React from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendanceService';

interface AttendanceFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  departmentId: string;
  setDepartmentId: (val: string) => void;
  subjectId: string;
  setSubjectId: (val: string) => void;
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  searchTerm, setSearchTerm,
  date, setDate,
  departmentId, setDepartmentId,
  subjectId, setSubjectId
}) => {
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: attendanceService.getDepartments
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', departmentId],
    queryFn: () => attendanceService.getSubjects(departmentId),
    enabled: true
  });

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search student by name or ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>
      <input 
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none"
      />
      <select 
        value={departmentId}
        onChange={(e) => {
          setDepartmentId(e.target.value);
          setSubjectId(''); // Reset subject when dept changes
        }}
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none"
      >
        <option value="">All Departments</option>
        {departments.map((dept: any) => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>
      <select 
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none"
      >
        <option value="">Select Subject</option>
        {subjects.map((sub: any) => (
          <option key={sub.id} value={sub.id}>{sub.name}</option>
        ))}
      </select>
    </div>
  );
};
