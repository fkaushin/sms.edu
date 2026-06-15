import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Send, Loader2, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StudentTable } from '../../components/student/StudentTable';
import { StudentFilters } from '../../components/student/StudentFilters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { toast } from 'sonner';
import Papa from 'papaparse';

const DEPARTMENT_UUIDS: Record<string, string> = {
  'Computer Science': '11111111-1111-1111-1111-111111111111',
  'Information Technology': '22222222-2222-2222-2222-222222222222',
  'Electronics': '33333333-3333-3333-3333-333333333333',
  'Commerce': '44444444-4444-4444-4444-444444444444',
};

export const StudentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      return studentService.sendCredentialsBulk();
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Dispatched credentials to ${count} pending students successfully!`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to dispatch bulk credentials');
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    toast.info('Starting CSV import. This might take a moment...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        let errorCount = 0;
        
        for (const row of rows) {
          try {
            const deptRaw = row['Department'] || row.department || '';
            const payload = {
               firstName: row['First Name'] || row.firstName || 'Unknown',
               lastName: row['Last Name'] || row.lastName || 'Student',
               personalEmail: row['Personal Email'] || row['Email'] || row.personalEmail,
               dateOfBirth: row['Date of Birth'] || row.dateOfBirth || '2000-01-01',
               gender: (row['Gender'] || row.gender || 'OTHER').toUpperCase(),
               departmentId: DEPARTMENT_UUIDS[deptRaw] || Object.values(DEPARTMENT_UUIDS)[0],
               year: parseInt(row['Year'] || row.year || '1', 10),
               phone: row['Phone'] || row.phone,
               address: row['Address'] || row.address,
               action: 'create'
            };
            if (!payload.personalEmail) continue; // skip empty or invalid
            await studentService.addStudent(payload);
            successCount++;
          } catch (e) {
            errorCount++;
            console.error('Failed to import row', row, e);
          }
        }
        
        setIsImporting(false);
        queryClient.invalidateQueries({ queryKey: ['students'] });
        
        if (errorCount > 0) {
          toast.warning(`Imported ${successCount} students. Failed: ${errorCount}`);
        } else if (successCount > 0) {
          toast.success(`Successfully imported all ${successCount} students!`);
        } else {
          toast.error('No valid students found to import.');
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (err) => {
        toast.error('Failed to parse CSV file: ' + err.message);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = department ? s.department === department : true;
    return matchesSearch && matchesDept;
  });

  const pendingCount = students.filter(s => s.accountStatus === 'PENDING').length;

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading students...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Failed to load students.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all registered students in the system.</p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button
              variant="ghost"
              disabled={bulkMutation.isPending}
              onClick={() => bulkMutation.mutate()}
              className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {bulkMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Send Credentials to All Pending ({pendingCount})
            </Button>
          )}
          
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Import CSV
          </Button>
          
          <Link to="/admin/students/new">
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      <StudentFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        department={department}
        setDepartment={setDepartment}
      />

      <StudentTable students={filteredStudents} />
    </div>
  );
};
