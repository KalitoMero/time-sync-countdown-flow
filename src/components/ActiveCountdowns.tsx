import React, { useEffect, useState } from 'react';
import { useTimer } from '@/context/TimerContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Check } from 'lucide-react';
import { useTimers } from '@/hooks/useTimers';

interface CountdownData {
  id: string;
  mitarbeiter: string;
  dauer_min: number | null;
  special_case: string | null;
  status: string;
  created_at: string;
}

const ActiveCountdowns: React.FC = () => {
  const { activeTimers, isLoading, completeTimer } = useTimers();
  const [sortedCountdowns, setSortedCountdowns] = useState<CountdownData[]>([]);

  useEffect(() => {
    if (activeTimers && activeTimers.length > 0) {
      const now = Date.now();
      const countdowns = activeTimers.map(timer => ({
        id: timer.id,
        mitarbeiter: timer.mitarbeiter,
        dauer_min: timer.dauer_min,
        special_case: timer.special_case,
        status: timer.status,
        created_at: timer.created_at,
      }));
      
      // Sortierung: 1. Abgelaufene Timer, 2. Aktive Timer (nach Restzeit), 3. "morgen vor 8" Einträge
      const sortedTimers = [...countdowns].sort((a, b) => {
        // Abgelaufene Timer zuerst
        if (a.status === 'abgelaufen' && b.status !== 'abgelaufen') return -1;
        if (a.status !== 'abgelaufen' && b.status === 'abgelaufen') return 1;
        
        // "morgen vor 8" Einträge zuletzt
        if (a.special_case === 'morgen vor 8' && b.special_case !== 'morgen vor 8') return 1;
        if (a.special_case !== 'morgen vor 8' && b.special_case === 'morgen vor 8') return -1;
        
        // Aktive Timer nach erstellzeit sortieren
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      setSortedCountdowns(sortedTimers);
    } else {
      setSortedCountdowns([]);
    }
  }, [activeTimers]);

  const handleComplete = (timerId: string) => {
    completeTimer.mutate(timerId);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatEndTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMorgenEndTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUnderTenMinutes = (timestamp: string) => {
    const now = Date.now();
    const endTime = new Date(timestamp).getTime();
    const remainingTime = endTime - now;
    return remainingTime < 600000; // 10 minutes in milliseconds
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-xl">Lade Timer...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTimers.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="border-workshop-light border-2">
          <CardHeader className="bg-workshop text-white">
            <CardTitle className="text-3xl font-bold text-center">
              Keine aktiven Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <Timer className="w-24 h-24 mx-auto text-workshop-light mb-6" />
            <p className="text-xl text-gray-600">
              Momentan sind keine Timer aktiv
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-workshop text-center mb-6">
        Aktive Timer
      </h1>
      <div className="space-y-2">
        {sortedCountdowns.map((countdown) => (
          <Card 
            key={countdown.id} 
            className={`border-workshop-light border-2 ${
              countdown.special_case === 'morgen vor 8' ? 'bg-gray-50' : ''
            } ${countdown.status === 'abgelaufen' ? 'bg-rose-50' : ''}`}
          >
            <CardContent className="p-3">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-center">
                <div className="text-lg">
                  <span className="text-gray-600">Mitarbeiter: </span>
                  <span className="font-semibold">{countdown.mitarbeiter}</span>
                </div>
                
                <div className="text-gray-600">
                  {countdown.special_case === 'morgen vor 8' ? (
                    <span className="text-workshop-accent font-medium">
                      Status: morgen vor 8
                    </span>
                  ) : (
                    <>
                      <span>Endet um: </span>
                      <span className="font-medium">
                        {formatEndTime(countdown.created_at)}
                      </span>
                    </>
                  )}
                </div>

                <div>
                  {countdown.special_case === 'morgen vor 8' ? (
                    <span className="text-sm text-gray-500">
                      {formatMorgenEndTime(countdown.created_at)}
                    </span>
                  ) : countdown.status === 'abgelaufen' ? (
                    <span className="text-2xl font-bold text-red-600">
                      abgelaufen
                    </span>
                  ) : (
                    <span className={`text-2xl font-bold tracking-wider ${
                      isUnderTenMinutes(countdown.created_at) 
                        ? 'text-workshop-danger animate-pulse' 
                        : 'text-workshop'
                    }`}>
                      {countdown.dauer_min}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-2 border-green-500 hover:bg-green-500 hover:text-white"
                  onClick={() => handleComplete(countdown.id)}
                >
                  <Check className="h-5 w-5 text-green-500 hover:text-white" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActiveCountdowns;
