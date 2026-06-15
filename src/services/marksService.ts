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
  },

  getStudentMarksForExam: async (studentId: string, examType: string) => {
    const { data, error } = await supabase
      .from('marks')
      .select('*')
      .eq('student_id', studentId)
      .eq('exam_type', examType);

    if (error) throw error;
    return data || [];
  },

  saveBulkMarks: async (records: { student_id: string; subject_id: string; score: number; max_score: number; exam_type: string; grade: string }[]) => {
    if (!records.length) return;

    const studentId = records[0].student_id;
    const examType = records[0].exam_type;
    const subjectIds = records.map(r => r.subject_id);

    // Delete existing records for these subjects and exam type for this student
    const { error: deleteError } = await supabase
      .from('marks')
      .delete()
      .eq('student_id', studentId)
      .eq('exam_type', examType)
      .in('subject_id', subjectIds);

    if (deleteError) throw deleteError;

    // Insert new records
    const { error: insertError } = await supabase
      .from('marks')
      .insert(records);

    if (insertError) throw insertError;

    // Log activity
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      await supabase.from('activities').insert({
        user_id: sessionData.session.user.id,
        title: 'Bulk Marks Entered',
        description: `Entered ${examType} marks for ${records.length} subjects for student ${studentId}.`,
        type: 'SYSTEM'
      });
    }

    return true;
  }
};
