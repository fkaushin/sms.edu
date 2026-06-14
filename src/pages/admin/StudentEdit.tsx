import React from 'react';
import { StudentForm } from '../../components/student/StudentForm';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { Button } from '../../components/ui/Button';

export const StudentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: student, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id!)
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading student...</div>;
  }

  if (isError || !student) {
    return <div className="p-8 text-center text-red-500">Student not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link to="/admin/students" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Students
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Edit Student</h1>
          <p className="text-sm text-slate-500 mt-1">Update information for {student.firstName} {student.lastName}.</p>
        </div>
        <Button variant="danger">Deactivate</Button>
      </div>
      
      <StudentForm initialData={student} isEdit={true} />
    </div>
  );
};
