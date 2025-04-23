
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateTimerParams {
  mitarbeiter: string;
  dauer_min?: number;
  special_case?: string;
}

export const useTimers = () => {
  const queryClient = useQueryClient();

  const { data: activeTimers = [], isLoading } = useQuery({
    queryKey: ['active-timers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timer')
        .select('*')
        .in('status', ['aktiv', 'abgelaufen'])
        .order('created_at');

      if (error) {
        toast.error('Fehler beim Laden der Timer');
        throw error;
      }

      return data || [];
    },
  });

  const createTimer = useMutation({
    mutationFn: async ({ mitarbeiter, dauer_min, special_case }: CreateTimerParams) => {
      const { error } = await supabase
        .from('timer')
        .insert([{
          mitarbeiter,
          dauer_min,
          special_case,
          status: 'aktiv'
        }]);

      if (error) {
        toast.error('Fehler beim Erstellen des Timers');
        throw error;
      }
      toast.success('Timer wurde erstellt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timers'] });
    },
  });

  const completeTimer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('timer')
        .update({ status: 'beendet' })
        .eq('id', id);

      if (error) {
        toast.error('Fehler beim Beenden des Timers');
        throw error;
      }
      toast.success('Timer wurde beendet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-timers'] });
    },
  });

  return {
    activeTimers,
    isLoading,
    createTimer,
    completeTimer,
  };
};
