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
