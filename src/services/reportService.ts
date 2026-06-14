/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface Report {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  createdAt: string;
}

export const reportService = {
  getReports: async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      fileUrl: row.file_url,
      createdAt: row.created_at,
    }));
  },

  createReport: async (title: string, type: string, fileUrl: string) => {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        title,
        type,
        file_url: fileUrl
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      await supabase.from('activities').insert({
        user_id: sessionData.session.user.id,
        title: 'Report Generated',
        description: `Generated new report: ${title}`,
        type: 'DOCUMENT'
      });
    }

    return data;
  }
};
