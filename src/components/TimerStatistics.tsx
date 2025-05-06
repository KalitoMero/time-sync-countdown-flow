
import React, { useState } from 'react';
import { useTimerStatistics } from '@/hooks/useTimerStatistics';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FilterPeriod = 'week' | 'month' | 'year' | 'all';

const TimerStatistics: React.FC = () => {
  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { completedTimers, isLoading, filterTimersByPeriod, calculateStatistics } = useTimerStatistics();

  const filteredTimers = filterTimersByPeriod(period, currentDate);
  const statistics = calculateStatistics(filteredTimers);

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (period === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (period === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (period === 'year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (period === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (period === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (period === 'year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const getPeriodLabel = (): string => {
    switch (period) {
      case 'week':
        return `KW ${format(currentDate, 'w', { locale: de })} - ${format(currentDate, 'yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: de });
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return 'Alle Zeiten';
    }
  };

  const renderTimerStatus = (timer: any) => {
    if (timer.special_case === 'morgen vor 8') {
      return <span className="text-workshop">Morgen vor 8</span>;
    }

    if (!timer.confirmed_at || !timer.dauer_min) {
      return <span className="text-gray-500">Unbekannt</span>;
    }

    const createdAt = new Date(timer.created_at).getTime();
    const confirmedAt = new Date(timer.confirmed_at).getTime();
    const targetTime = createdAt + (timer.dauer_min * 60 * 1000);

    return confirmedAt <= targetTime 
      ? <span className="text-green-500">Rechtzeitig</span>
      : <span className="text-red-500">Zu spät</span>;
  };

  if (isLoading) {
    return <div className="text-center py-8">Lade Statistiken...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              variant={period === 'week' ? 'default' : 'outline'} 
              onClick={() => setPeriod('week')}
              className={period === 'week' ? 'bg-workshop' : ''}
            >
              KW
            </Button>
            <Button 
              variant={period === 'month' ? 'default' : 'outline'} 
              onClick={() => setPeriod('month')}
              className={period === 'month' ? 'bg-workshop' : ''}
            >
              Monat
            </Button>
            <Button 
              variant={period === 'year' ? 'default' : 'outline'} 
              onClick={() => setPeriod('year')}
              className={period === 'year' ? 'bg-workshop' : ''}
            >
              Jahr
            </Button>
            <Button 
              variant={period === 'all' ? 'default' : 'outline'} 
              onClick={() => setPeriod('all')}
              className={period === 'all' ? 'bg-workshop' : ''}
            >
              Alle
            </Button>
          </div>
          
          {period !== 'all' && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePreviousPeriod}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{getPeriodLabel()}</span>
              </div>
              <Button variant="outline" size="icon" onClick={handleNextPeriod}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-muted-foreground">Gesamt</h3>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-muted-foreground">Rechtzeitig</h3>
            <p className="text-2xl font-bold text-green-500">{statistics.onTime}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-muted-foreground">Zu spät</h3>
            <p className="text-2xl font-bold text-red-500">{statistics.late}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-muted-foreground">Erfolgsquote</h3>
            <p className="text-2xl font-bold">{statistics.successRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Erstellt am</TableHead>
              <TableHead>Bestätigt am</TableHead>
              <TableHead>Dauer (min)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTimers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Keine Daten für diesen Zeitraum vorhanden
                </TableCell>
              </TableRow>
            ) : (
              filteredTimers.map((timer) => (
                <TableRow key={timer.id}>
                  <TableCell>{timer.mitarbeiter}</TableCell>
                  <TableCell>{format(new Date(timer.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {timer.confirmed_at 
                      ? format(new Date(timer.confirmed_at), 'dd.MM.yyyy HH:mm')
                      : '—'}
                  </TableCell>
                  <TableCell>{timer.dauer_min || '—'}</TableCell>
                  <TableCell>{renderTimerStatus(timer)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TimerStatistics;
