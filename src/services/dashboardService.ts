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
  },

  getAttendanceTrends: async () => {
    // Get past 7 days dates
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .in('date', dates);

    if (error) throw error;

    // Group by date
    const stats = dates.map(date => {
      const dayData = data?.filter(d => d.date === date) || [];
      const total = dayData.length;
      const present = dayData.filter(d => d.status === 'PRESENT' || d.status === 'LATE').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        name: dayName,
        present: percentage
      };
    });

    return stats;
  }
};
