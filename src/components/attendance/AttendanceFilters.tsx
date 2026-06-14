import React from 'react';
import { Search } from 'lucide-react';

export const AttendanceFilters: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search student by name or ID..." 
          className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>
      <input 
        type="date"
        className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none"
        defaultValue={new Date().toISOString().split('T')[0]}
      />
      <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none">
        <option value="">All Departments</option>
        <option value="CS">Computer Science</option>
        <option value="EE">Electrical Engineering</option>
      </select>
      <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 bg-white outline-none">
        <option value="">Select Subject</option>
        <option value="DSA">Data Structures</option>
        <option value="DBMS">Database Systems</option>
      </select>
    </div>
  );
};
