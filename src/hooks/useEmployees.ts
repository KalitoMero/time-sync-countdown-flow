
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postgres } from '@/integrations/postgres/client';
import { toast } from 'sonner';

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      try {
        const result = await postgres
          .from('mitarbeiter')
          .select('*')
          .order('name')
          .execute();

        return result.rows || [];
      } catch (error) {
        toast.error('Fehler beim Laden der Mitarbeiter');
        console.error('Error loading employees:', error);
        throw error;
      }
    },
  });

  const addEmployee = useMutation({
    mutationFn: async (name: string) => {
      try {
        await postgres
          .from('mitarbeiter')
          .insert([{ name }])
          .execute();

        toast.success(`Mitarbeiter ${name} wurde hinzugefügt`);
      } catch (error) {
        toast.error('Fehler beim Hinzufügen des Mitarbeiters');
        console.error('Error adding employee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      try {
        await postgres
          .from('mitarbeiter')
          .update({ name })
          .eq('id', id)
          .execute();

        toast.success('Mitarbeiter wurde aktualisiert');
      } catch (error) {
        toast.error('Fehler beim Aktualisieren des Mitarbeiters');
        console.error('Error updating employee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: number) => {
      try {
        await postgres
          .from('mitarbeiter')
          .delete()
          .eq('id', id)
          .execute();

        toast.success('Mitarbeiter wurde gelöscht');
      } catch (error) {
        toast.error('Fehler beim Löschen des Mitarbeiters');
        console.error('Error deleting employee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return {
    employees,
    isLoading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
