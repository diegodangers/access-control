import React, { useState } from 'react';

// Simplified Card components
const Card = ({ className, children }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-4 border-b">{children}</div>
);

const CardTitle = ({ children }) => (
  <h2 className="text-xl font-semibold">{children}</h2>
);

const CardContent = ({ children }) => (
  <div className="p-4">{children}</div>
);

// Simplified Input component
const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border rounded-md ${className}`}
    {...props}
  />
);

// Simplified Button component
const Button = ({ variant, size, className, children, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-md transition-colors";
  const variantStyles = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-gray-300 hover:bg-gray-50"
  };
  const sizeStyles = {
    default: "px-4 py-2",
    sm: "px-2 py-1 text-sm"
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant || 'default']} ${sizeStyles[size || 'default']} disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Simplified Alert components
const Alert = ({ children }) => (
  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
    {children}
  </div>
);

const AlertDescription = ({ children }) => (
  <p className="text-sm text-blue-700">{children}</p>
);

// Main component
const EmployerAccessControl = () => {
  const [employer, setEmployer] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isUidMode, setIsUidMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [showSetup, setShowSetup] = useState(true);

  const handleInitialSetup = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    setEmployer({
      name: formData.get('employerName'),
      adminEmail: formData.get('adminEmail'),
    });
    setShowSetup(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const newEmployees = lines.slice(1).map(line => {
          const [name, employeeNumber] = line.split(',');
          return {
            name: name?.trim(),
            employeeNumber: employeeNumber?.trim(),
            uid: '',
            location: ''
          };
        }).filter(emp => emp.name && emp.employeeNumber);
        setEmployees(newEmployees);
      };
      reader.readAsText(file);
    }
  };

  const handleUidScan = (event) => {
    if (event.key === 'Enter' && currentEmployee) {
      const updatedEmployees = employees.map(emp => {
        if (emp === currentEmployee) {
          return { ...emp, uid: event.target.value };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
      setCurrentEmployee(null);
      event.target.value = '';
    }
  };

  const exportCsv = () => {
    const csvContent = "Name,Employee Number,UID,Location\n" + 
      employees.map(emp => 
        `${emp.name},${emp.employeeNumber},${emp.uid},${emp.location}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${employer?.name}_access_control.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (showSetup) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Welcome to Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInitialSetup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employer Name</label>
              <Input 
                name="employerName" 
                required 
                placeholder="Enter your organization name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Administrator Email</label>
              <Input 
                name="adminEmail" 
                type="email" 
                required 
                placeholder="admin@company.com"
              />
            </div>
            <Button type="submit" className="w-full">
              Set Up Access Control
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{employer?.name} Access Control Interface</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isUidMode && (
            <div className="space-y-2">
              <Input 
                type="file" 
                accept=".csv"
                onChange={handleFileUpload}
                className="max-w-sm"
              />
              <Button 
                onClick={() => setIsUidMode(true)} 
                disabled={!employees.length}
              >
                Start UID Import
              </Button>
            </div>
          )}

          {isUidMode && (
            <div className="space-y-2">
              <Alert>
                <AlertDescription>
                  Select an employee and scan their card to import UID
                </AlertDescription>
              </Alert>
              <Input
                type="text"
                placeholder="Scan card..."
                onKeyDown={handleUidScan}
                className="max-w-sm"
                autoFocus
              />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Employee Number</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">UID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Location</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee, index) => (
                  <tr 
                    key={index}
                    className={`${currentEmployee === employee ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-2 text-sm text-gray-900">{employee.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{employee.employeeNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{employee.uid}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{employee.location}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentEmployee(employee)}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {employees.length > 0 && (
            <Button onClick={exportCsv}>
              Export CSV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployerAccessControl;