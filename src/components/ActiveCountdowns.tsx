
import React, { useEffect, useState } from 'react';
import { useTimer } from '@/context/TimerContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timer } from 'lucide-react';

interface CountdownData {
  userName: string;
  remainingTime: number;
}

const ActiveCountdowns: React.FC = () => {
  const { activeTimer, remainingTime } = useTimer();
  const [sortedCountdowns, setSortedCountdowns] = useState<CountdownData[]>([]);

  // Update and sort countdowns
  useEffect(() => {
    if (activeTimer && remainingTime !== null) {
      const countdown: CountdownData = {
        userName: activeTimer.userName,
        remainingTime: remainingTime,
      };
      
      setSortedCountdowns([countdown]);
    } else {
      setSortedCountdowns([]);
    }
  }, [activeTimer, remainingTime]);

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

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isUnderTenMinutes = (ms: number) => {
    return ms < 600000; // 10 minutes in milliseconds
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold text-workshop text-center mb-8">
        Aktive Timer
      </h1>
      <div className="space-y-4">
        {sortedCountdowns.map((countdown, index) => (
          <Card key={index} className="border-workshop-light border-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg text-gray-600">Mitarbeiter:</p>
                  <p className="text-2xl font-semibold">{countdown.userName}</p>
                </div>
                <div>
                  <p className="text-lg text-gray-600">Restzeit:</p>
                  <p className={`text-2xl font-bold ${
                    isUnderTenMinutes(countdown.remainingTime) 
                      ? 'text-workshop-danger animate-pulse' 
                      : 'text-workshop'
                  }`}>
                    {`${Math.floor(countdown.remainingTime / 1000 / 60)} Minuten`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActiveCountdowns;
