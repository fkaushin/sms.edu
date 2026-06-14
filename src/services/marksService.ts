/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';
import type { Mark } from '../types';

export const marksService = {
  getMarks: async (studentId?: string): Promise<Mark[]> => {
    let query = supabase
      .from('marks')
      .select(`
        *,
        subjects (name),
        students (first_name, last_name, enrollment_no)
      `)
      .order('created_at', { ascending: false });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((row: any) => ({
      id: row.id,
      studentId: row.student_id,
      subject: row.subjects?.name || 'Unknown',
      score: row.score,
      maxScore: row.max_score,
      grade: row.grade,
      examType: row.exam_type,
      studentName: row.students ? `${row.students.first_name} ${row.students.last_name}` : undefined,
      enrollmentNo: row.students?.enrollment_no
    }));
  },

  addMark: async (markData: Omit<Mark, 'id'> & { subjectId: string }) => {
    const { data, error } = await supabase
      .from('marks')
      .insert({
        student_id: markData.studentId,
        subject_id: markData.subjectId,
        score: markData.score,
        max_score: markData.maxScore,
        grade: markData.grade,
        exam_type: markData.examType
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      await supabase.from('activities').insert({
        user_id: sessionData.session.user.id,
        title: 'Marks Added',
        description: `Added ${markData.examType} marks for student ID: ${markData.studentId}`,
        type: 'SYSTEM'
      });
    }

    return data;
  }
};
