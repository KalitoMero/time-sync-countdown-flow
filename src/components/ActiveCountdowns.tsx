import React, { useEffect, useState } from 'react';
import { useTimer } from '@/context/TimerContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Check } from 'lucide-react';

interface CountdownData {
  userId: string;
  userName: string;
  remainingTime: number;
}

const ActiveCountdowns: React.FC = () => {
  const { activeTimers, removeTimer } = useTimer();
  const [sortedCountdowns, setSortedCountdowns] = useState<CountdownData[]>([]);

  useEffect(() => {
    if (activeTimers && activeTimers.length > 0) {
      const countdowns = activeTimers.map(timer => ({
        userId: timer.userId,
        userName: timer.userName,
        remainingTime: timer.remainingTime,
      }));
      
      setSortedCountdowns([...countdowns].sort((a, b) => a.remainingTime - b.remainingTime));
    } else {
      setSortedCountdowns([]);
    }
  }, [activeTimers]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
          <Card key={countdown.userId} className="border-workshop-light border-2">
            <CardContent className="p-3">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <div className="text-lg">
                  <span className="text-gray-600">Mitarbeiter: </span>
                  <span className="font-semibold">{countdown.userName}</span>
                </div>
                <div>
                  <span className="text-gray-600 mr-2">Restzeit: </span>
                  <span className={`text-2xl font-bold tracking-wider ${
                    isUnderTenMinutes(countdown.remainingTime) 
                      ? 'text-workshop-danger animate-pulse' 
                      : 'text-workshop'
                  }`}>
                    {formatTime(countdown.remainingTime)}
                  </span>
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
