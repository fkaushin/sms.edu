import React, { useState } from 'react';
import { MarksFilters } from '../../components/marks/MarksFilters';
import { MarksTable } from '../../components/marks/MarksTable';
import { MarksEntryModal } from '../../components/marks/MarksEntryModal';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import type { Student } from '../../types';

export const MarksManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [examType, setExamType] = useState('MIDTERM');
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: attendanceService.getDepartments
  });

  const selectedDeptName = departments.find(d => d.id === departmentId)?.name;

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptName ? s.department === selectedDeptName : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marks Management</h1>
          <p className="text-sm text-slate-500 mt-1">Select a student to enter their examination marks.</p>
        </div>
      </div>

      <MarksFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentId={departmentId}
        setDepartmentId={setDepartmentId}
        examType={examType}
        setExamType={setExamType}
      />

      {!departmentId ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Please select a department to view students.</p>
        </div>
      ) : (
        <MarksTable 
          students={filteredStudents}
          isLoading={isLoading}
          onEnterMarks={setSelectedStudent}
        />
      )}

      {selectedStudent && (
        <MarksEntryModal 
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          departmentId={departmentId}
          examType={examType}
        />
      )}
    </div>
  );
};
