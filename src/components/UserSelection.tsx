
import React from 'react';
import { useTimer } from '@/context/TimerContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const UserSelection: React.FC = () => {
  const { users } = useTimer();
  const navigate = useNavigate();

  const handleUserSelect = (userId: string, userName: string) => {
    navigate(`/time-selection/${userId}`, { state: { userName } });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="border-workshop-light border-2">
        <CardHeader className="bg-workshop text-white">
          <CardTitle className="text-3xl font-bold text-center">
            Select Your Name
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {users.map((user) => (
              <button
                key={user.id}
                className="bg-workshop-light hover:bg-workshop text-white p-6 rounded-lg text-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg h-24"
                onClick={() => handleUserSelect(user.id, user.name)}
              >
                {user.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSelection;
