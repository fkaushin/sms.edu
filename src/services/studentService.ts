/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';
import type { Student, Gender, AccountStatus } from '../types';

export interface SupabaseStudent {
  id: string;
  first_name: string;
  last_name: string;
  enrollment_no: string;
  date_of_birth: string;
  gender: Gender;
  phone?: string;
  address?: string;
  department_id: string;
  departments?: { name: string };
  year: number;
  is_active: boolean;
  personal_email: string;
  university_email: string;
  credentials_sent: boolean;
  credentials_sent_at?: string;
  first_login_completed: boolean;
  account_status: AccountStatus;
}

const mapStudent = (data: SupabaseStudent): Student => ({
  id: data.id,
  userId: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  enrollmentNo: data.enrollment_no,
  dateOfBirth: data.date_of_birth,
  gender: data.gender,
  phone: data.phone,
  address: data.address,
  department: data.departments?.name || 'Unknown',
  year: data.year,
  isActive: data.is_active,
  personalEmail: data.personal_email,
  universityEmail: data.university_email,
  credentialsSent: data.credentials_sent,
  credentialsSentAt: data.credentials_sent_at,
  firstLoginCompleted: data.first_login_completed,
  accountStatus: data.account_status,
});

export const studentService = {
  getStudents: async (): Promise<Student[]> => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        departments (name)
      `)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return (data as any[]).map(mapStudent);
  },

  getStudentById: async (id: string): Promise<Student> => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        departments (name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapStudent(data as any);
  },

  addStudent: async (studentData: any) => {
    // Calling our edge function
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(studentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add student');
    }

    return response.json();
  },

  updateStudent: async (id: string, studentData: Partial<Student>) => {
    const updatePayload: any = {};
    if (studentData.firstName) updatePayload.first_name = studentData.firstName;
    if (studentData.lastName) updatePayload.last_name = studentData.lastName;
    if (studentData.enrollmentNo) updatePayload.enrollment_no = studentData.enrollmentNo;
    if (studentData.dateOfBirth) updatePayload.date_of_birth = studentData.dateOfBirth;
    if (studentData.gender) updatePayload.gender = studentData.gender;
    if (studentData.phone !== undefined) updatePayload.phone = studentData.phone;
    if (studentData.address !== undefined) updatePayload.address = studentData.address;
    if (studentData.year !== undefined) updatePayload.year = studentData.year;
    // Note: updating department requires mapping name to id if passing name, 
    // usually we'd pass departmentId in a real scenario.
    
    const { data, error } = await supabase
      .from('students')
      .update(updatePayload)
      .eq('id', id)
      .select(`*, departments (name)`)
      .single();

    if (error) throw error;
    
    // Log activity
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      await supabase.from('activities').insert({
        user_id: sessionData.session.user.id,
        title: 'Student Updated',
        description: `Student record updated for ${updatePayload.first_name || 'student'}`,
        type: 'SYSTEM'
      });
    }

    return mapStudent(data as any);
  },

  deactivateStudent: async (id: string) => {
    const { data, error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id)
      .select(`*, departments (name)`)
      .single();

    if (error) throw error;
    return mapStudent(data as any);
  },

  deleteStudent: async (id: string) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  sendCredentials: async (studentId: string): Promise<{ success: boolean; tempPassword?: string }> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action: 'send_credentials', studentId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send credentials');
    }

    return response.json();
  },

  sendCredentialsBulk: async (): Promise<number> => {
    const { data: students, error } = await supabase
      .from('students')
      .select('id')
      .eq('account_status', 'PENDING');

    if (error) throw error;
    if (!students || students.length === 0) return 0;

    let successCount = 0;
    for (const student of students) {
      try {
        await studentService.sendCredentials(student.id);
        successCount++;
      } catch (err) {
        console.error(`Failed bulk send for student ${student.id}:`, err);
      }
    }
    return successCount;
  },

  completeFirstLogin: async (studentId: string) => {
    const { error } = await supabase
      .from('students')
      .update({
        first_login_completed: true,
        account_status: 'ACTIVE'
      })
      .eq('id', studentId);

    if (error) throw error;
    return true;
  }
};
