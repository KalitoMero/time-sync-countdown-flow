
import React, { useEffect, useState } from 'react';
import { useTimer } from '@/context/TimerContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Check } from 'lucide-react';

interface CountdownData {
  userId: string;
  userName: string;
  remainingTime: number;
  endTime: number;
  isMorgenVor8?: boolean;
  isExpired?: boolean;
}

const ActiveCountdowns: React.FC = () => {
  const { activeTimers, removeTimer } = useTimer();
  const [sortedCountdowns, setSortedCountdowns] = useState<CountdownData[]>([]);

  useEffect(() => {
    if (activeTimers && activeTimers.length > 0) {
      const now = Date.now();
      const countdowns = activeTimers.map(timer => ({
        userId: timer.userId,
        userName: timer.userName,
        remainingTime: timer.remainingTime || 0,
        endTime: timer.endTime,
        isMorgenVor8: timer.isMorgenVor8,
        isExpired: !timer.isMorgenVor8 && timer.endTime <= now
      }));
      
      // Sort by: regular timers first (by remaining time), then expired timers, then "morgen vor 8" entries
      const sortedTimers = [...countdowns].sort((a, b) => {
        if (a.isMorgenVor8 && !b.isMorgenVor8) return 1;
        if (!a.isMorgenVor8 && b.isMorgenVor8) return -1;
        if (a.isExpired && !b.isExpired) return 1;
        if (!a.isExpired && b.isExpired) return -1;
        return a.remainingTime - b.remainingTime;
      });
      
      setSortedCountdowns(sortedTimers);
    } else {
      setSortedCountdowns([]);
    }
  }, [activeTimers]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatEndTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMorgenEndTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUnderTenMinutes = (ms: number) => {
    return ms < 600000; // 10 minutes in milliseconds
  };

  const handleComplete = (userId: string) => {
    removeTimer(userId);
  };

  if (sortedCountdowns.length === 0) {
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
            key={countdown.userId} 
            className={`border-workshop-light border-2 ${
              countdown.isMorgenVor8 ? 'bg-gray-50' : ''
            }`}
          >
            <CardContent className="p-3">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] gap-4 items-center">
                <div className="text-lg">
                  <span className="text-gray-600">Mitarbeiter: </span>
                  <span className="font-semibold">{countdown.userName}</span>
                </div>
                
                <div className="text-gray-600">
                  {countdown.isMorgenVor8 ? (
                    <span className="text-workshop-accent font-medium">
                      Status: morgen vor 8
                    </span>
                  ) : (
                    <>
                      <span>Endet um: </span>
                      <span className="font-medium">
                        {formatEndTime(countdown.endTime)}
                      </span>
                    </>
                  )}
                </div>

                <div>
                  {countdown.isMorgenVor8 ? (
                    <span className="text-sm text-gray-500">
                      {formatMorgenEndTime(countdown.endTime)}
                    </span>
                  ) : countdown.isExpired ? (
                    <span className="text-2xl font-bold text-workshop-danger">
                      abgelaufen
                    </span>
                  ) : (
                    <span className={`text-2xl font-bold tracking-wider ${
                      isUnderTenMinutes(countdown.remainingTime) 
                        ? 'text-workshop-danger animate-pulse' 
                        : 'text-workshop'
                    }`}>
                      {formatTime(countdown.remainingTime)}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-2 border-green-500 hover:bg-green-500 hover:text-white"
                  onClick={() => handleComplete(countdown.userId)}
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
