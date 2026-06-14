/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: string;
}

export const activityService = {
  getActivities: async (limit = 50): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      timestamp: row.created_at,
    }));
  }
};
