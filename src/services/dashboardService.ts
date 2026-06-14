/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export const dashboardService = {
  getAdminStats: async () => {
    // Total Students
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    // Active Students
    const { count: activeStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Present Today
    const today = new Date().toISOString().split('T')[0];
    const { count: presentToday } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('date', today)
      .eq('status', 'PRESENT');

    return {
      totalStudents: totalStudents || 0,
      activeStudents: activeStudents || 0,
      presentToday: presentToday || 0,
      averageAttendance: 85, // This would require a more complex query in real world
    };
  },

  getRecentActivities: async (limit = 5) => {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles (email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data.map((act: any) => ({
      id: act.id,
      title: act.title,
      description: act.description,
      type: act.type,
      timestamp: act.created_at,
    }));
  }
};
