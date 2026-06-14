import React from 'react';
import { Search } from 'lucide-react';

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  department: string;
  setDepartment: (s: string) => void;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({ searchTerm, setSearchTerm, department, setDepartment }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or enrollment no..." 
          className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select 
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">All Departments</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Electrical">Electrical</option>
        <option value="Mechanical">Mechanical</option>
      </select>
    </div>
  );
};
