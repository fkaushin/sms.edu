/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';
import type { Attendance, Status } from '../types';

export const attendanceService = {
  getAttendance: async (studentId?: string): Promise<Attendance[]> => {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        subjects (name),
        students (first_name, last_name, enrollment_no)
      `)
      .order('date', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      date: row.date,
      status: row.status as Status,
      subject: row.subjects?.name || 'Unknown',
      studentName: row.students ? `${row.students.first_name} ${row.students.last_name}` : undefined,
      enrollmentNo: row.students?.enrollment_no
    }));
  },

  getDepartments: async () => {
    const { data, error } = await supabase.from('departments').select('id, name').order('name');
    if (error) throw error;
    return data || [];
  },

  getSubjects: async (departmentId?: string) => {
    let query = supabase.from('subjects').select('id, name, department_id').order('name');
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getAttendanceForDate: async (date: string, subjectId: string) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('date', date)
      .eq('subject_id', subjectId);

    if (error) throw error;
    const recordMap: Record<string, Status> = {};
    if (data) {
      data.forEach((record) => {
        recordMap[record.student_id] = record.status as Status;
      });
    }
    return recordMap;
  },

  markBulkAttendance: async (records: {student_id: string, subject_id: string, date: string, status: Status}[]) => {
    if (!records.length) return;

    // Supabase upsert works with array of objects
    const { error } = await supabase
      .from('attendance')
      .upsert(records, { onConflict: 'student_id,subject_id,date' });

    if (error) throw error;

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      await supabase.from('activities').insert({
        user_id: sessionData.session.user.id,
        title: 'Bulk Attendance Recorded',
        description: `Marked attendance for ${records.length} students.`,
        type: 'SYSTEM'
      });
    }
    
    return true;
  },

  markAttendance: async (studentId: string, subjectId: string, date: string, status: Status) => {
    const { data, error } = await supabase
      .from('attendance')
      .upsert({
        student_id: studentId,
        subject_id: subjectId,
        date,
        status
      }, { onConflict: 'student_id,subject_id,date' })
      .select()
      .single();

    if (error) throw error;
    
    // Log activity
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      await supabase.from('activities').insert({
        user_id: sessionData.session.user.id,
        title: 'Attendance Marked',
        description: `Marked attendance as ${status} for student ID: ${studentId}`,
        type: 'SYSTEM'
      });
    }

    return data;
  }
};
