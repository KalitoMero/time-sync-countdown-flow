
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Settings, UserPlus, UserMinus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useEmployees } from '@/hooks/useEmployees';
import TimerStatistics from './TimerStatistics';

const STORAGE_KEY = 'settings_authenticated';

const SettingsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if authenticated in localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'true';
  });
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('employees');
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();

  // Save authentication state
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [isAuthenticated]);

  const handleAuthentication = () => {
    if (password === '2034') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      toast.error('Falsches Passwort');
      setPassword('');
    }
  };

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      addEmployee.mutate(newEmployeeName.trim(), {
        onSuccess: () => setNewEmployeeName('')
      });
    }
  };

  const handleDeleteEmployee = (id: number) => {
    deleteEmployee.mutate(id);
  };

  const handleEditEmployee = (employee: { id: number; name: string }) => {
    if (editingEmployee?.id === employee.id) {
      updateEmployee.mutate({ id: employee.id, name: newEmployeeName });
      setEditingEmployee(null);
      setNewEmployeeName('');
    } else {
      setEditingEmployee(employee);
      setNewEmployeeName(employee.name);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingEmployee(null);
    setNewEmployeeName('');
    // Don't reset authentication
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Passwort eingeben"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
            />
            <Button onClick={handleAuthentication} className="w-full">
              Anmelden
            </Button>
          </div>
        ) : (
          <>
            <Tabs defaultValue="employees" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="employees">Mitarbeiter</TabsTrigger>
                <TabsTrigger value="statistics">Statistik</TabsTrigger>
              </TabsList>
              
              <TabsContent value="employees">
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Neuer Mitarbeiter"
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                    />
                    <Button onClick={handleAddEmployee} disabled={!newEmployeeName.trim()}>
                      {editingEmployee ? 'Aktualisieren' : 'Hinzufügen'}
                      {editingEmployee ? <Pencil className="ml-2 h-4 w-4" /> : <UserPlus className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="statistics">
                <TimerStatistics />
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleLogout}>
                Abmelden
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
