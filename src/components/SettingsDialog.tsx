
import React, { useState } from 'react';
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
import { Settings, UserPlus, UserMinus, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
}

const SettingsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Get employees from localStorage or use default
  const getEmployees = (): Employee[] => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      return JSON.parse(storedEmployees);
    }
    return [
      { id: '1', name: 'Max Mustermann' },
      { id: '2', name: 'Anna Schmidt' },
      { id: '3', name: 'Peter Meyer' },
    ];
  };

  const [employees, setEmployees] = useState<Employee[]>(getEmployees());

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
      const newEmployee = {
        id: Date.now().toString(),
        name: newEmployeeName.trim()
      };
      const updatedEmployees = [...employees, newEmployee];
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      setNewEmployeeName('');
      toast.success(`Mitarbeiter ${newEmployeeName} wurde hinzugefügt`);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    toast.success('Mitarbeiter wurde gelöscht');
  };

  const handleEditEmployee = (employee: Employee) => {
    if (editingEmployee?.id === employee.id) {
      const updatedEmployees = employees.map(emp => 
        emp.id === employee.id ? { ...emp, name: newEmployeeName } : emp
      );
      setEmployees(updatedEmployees);
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      setEditingEmployee(null);
      setNewEmployeeName('');
      toast.success('Mitarbeiter wurde aktualisiert');
    } else {
      setEditingEmployee(employee);
      setNewEmployeeName(employee.name);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAuthenticated(false);
    setPassword('');
    setEditingEmployee(null);
    setNewEmployeeName('');
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
