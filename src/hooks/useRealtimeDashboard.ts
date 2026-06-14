import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Hook that subscribes to Supabase Realtime channels and invalidates
 * React Query caches so UI updates live.
 */
export function useRealtimeDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['students'] });
          queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['adminStats'] });
          queryClient.invalidateQueries({ queryKey: ['myAttendance'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marks' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['myMarks'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activities' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recentActivities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
