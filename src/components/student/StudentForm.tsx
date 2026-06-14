import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { toast } from 'sonner';

const studentSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  personalEmail: z.string().email('Invalid personal email address'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  department: z.string().min(2, 'Department is required'),
  year: z.number().min(1).max(4),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Partial<StudentFormValues> & { id?: string };
  isEdit?: boolean;
}

// Maps human-readable department names to seed database UUIDs
const DEPARTMENT_UUIDS: Record<string, string> = {
  'Computer Science': '11111111-1111-1111-1111-111111111111',
  'Information Technology': '22222222-2222-2222-2222-222222222222',
  'Electronics': '33333333-3333-3333-3333-333333333333',
  'Commerce': '44444444-4444-4444-4444-444444444444',
};

export const StudentForm: React.FC<StudentFormProps> = ({ initialData, isEdit }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      gender: 'MALE',
      year: 1,
    }
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: StudentFormValues) => {
      const deptId = DEPARTMENT_UUIDS[data.department] || DEPARTMENT_UUIDS['Computer Science'];

      if (isEdit && initialData?.id) {
        // Edit flow
        return studentService.updateStudent(initialData.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          year: data.year,
        });
      } else {
        // Creation flow (calling invite-student Edge Function via Service)
        const payload = {
          firstName: data.firstName,
          lastName: data.lastName,
          personalEmail: data.personalEmail,
          departmentId: deptId,
          year: data.year,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          action: 'create',
        };
        return studentService.addStudent(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Student ${isEdit ? 'updated' : 'added'} successfully!`);
      navigate('/admin/students');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save student');
    }
  });

  const onSubmit = (data: StudentFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <input {...register('firstName')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary outline-none" />
            {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
            <input {...register('lastName')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary outline-none" />
            {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName.message}</p>}
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Personal Gmail / Email</label>
              <input type="email" {...register('personalEmail')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary outline-none" />
              {errors.personalEmail && <p className="text-danger text-xs mt-1">{errors.personalEmail.message}</p>}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input type="date" {...register('dateOfBirth')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary outline-none" />
            {errors.dateOfBirth && <p className="text-danger text-xs mt-1">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select {...register('gender')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white outline-none">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.gender && <p className="text-danger text-xs mt-1">{errors.gender.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone (Optional)</label>
            <input {...register('phone')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address (Optional)</label>
            <textarea {...register('address')} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary outline-none" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select {...register('department')} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white outline-none">
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Commerce">Commerce</option>
            </select>
            {errors.department && <p className="text-danger text-xs mt-1">{errors.department.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <input type="number" min="1" max="4" {...register('year', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary outline-none" />
            {errors.year && <p className="text-danger text-xs mt-1">{errors.year.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={() => navigate('/admin/students')} disabled={mutation.isPending}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEdit ? 'Update Student' : 'Save Student'}
        </Button>
      </div>
    </form>
  );
};
