import React from 'react';
import { StudentForm } from '../../components/student/StudentForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentAdd: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/admin/students" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Students
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add New Student</h1>
        <p className="text-sm text-slate-500 mt-1">Fill in the information below to enroll a new student.</p>
      </div>
      
      <StudentForm />
    </div>
  );
};
