import React from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendanceService';

interface MarksFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  departmentId: string;
  setDepartmentId: (val: string) => void;
  examType: string;
  setExamType: (val: string) => void;
}

export const MarksFilters: React.FC<MarksFiltersProps> = ({
  searchTerm, setSearchTerm,
  departmentId, setDepartmentId,
  examType, setExamType
}) => {
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: attendanceService.getDepartments
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
      <select 
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none"
      >
        <option value="">All Departments</option>
        {departments.map((dept: any) => (
          <option key={dept.id} value={dept.id}>{dept.name}</option>
        ))}
      </select>
      <select 
        value={examType}
        onChange={(e) => setExamType(e.target.value)}
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none"
      >
        <option value="MIDTERM">Midterm</option>
        <option value="FINAL">Final</option>
        <option value="UNIT_TEST_1">Unit Test 1</option>
        <option value="UNIT_TEST_2">Unit Test 2</option>
      </select>
    </div>
  );
};
