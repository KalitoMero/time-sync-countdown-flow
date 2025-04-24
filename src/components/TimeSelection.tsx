
import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTimers } from '@/hooks/useTimers';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TimeSelection: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userName = searchParams.get('name') || 'Unbekannter Mitarbeiter';
  const { createTimer } = useTimers();

  const timeOptions = [30, 45, 60, 90, 120]; // Added 30 to make sure it's an option

  const handleTimeSelect = (duration: number | 'morgen') => {
    if (!userId || !userName) return;
    
    if (duration === 'morgen') {
      createTimer.mutate({
        mitarbeiter: userName,
        special_case: 'morgen vor 8'
      }, {
        onSuccess: (data) => {
          console.log('Timer created with morgen vor 8:', data);
          navigate('/countdown');
        }
      });
      return;
    }

    // For regular durations, ensure we're passing the correct duration value
    createTimer.mutate({
      mitarbeiter: userName,
      dauer_min: duration
    }, {
      onSuccess: (data) => {
        console.log('Timer created with duration:', duration, 'data:', data);
        navigate('/countdown');
      }
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="border-workshop-light border-2">
        <CardHeader className="bg-workshop text-white">
          <Button 
            variant="ghost" 
            className="absolute left-4 top-4 text-white hover:text-workshop-accent hover:bg-workshop"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Zurück
          </Button>
          <CardTitle className="text-3xl font-bold text-center mt-4">
            Mitarbeiter: {userName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {timeOptions.map((time) => (
              <button
                key={time}
                className="bg-workshop-light hover:bg-workshop text-white p-6 rounded-lg text-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg h-24"
                onClick={() => handleTimeSelect(time)}
              >
                {time} min
              </button>
            ))}
            <button
              className="bg-workshop-accent hover:bg-workshop text-white p-6 rounded-lg text-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg h-24 col-span-2 md:col-span-3"
              onClick={() => handleTimeSelect('morgen')}
            >
              Morgen früh vor 8 Uhr
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center py-4">
          <Button
            variant="outline"
            size="lg"
            className="text-workshop border-workshop hover:bg-workshop hover:text-white"
            onClick={() => navigate('/')}
          >
            Abbrechen
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TimeSelection;
