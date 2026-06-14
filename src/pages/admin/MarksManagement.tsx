import React from 'react';
import { MarksFilters } from '../../components/marks/MarksFilters';
import { MarksTable } from '../../components/marks/MarksTable';
import { Button } from '../../components/ui/Button';

export const MarksManagement: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marks Management</h1>
          <p className="text-sm text-slate-500 mt-1">Enter and manage student examination marks.</p>
        </div>
        <Button onClick={() => alert('Marks Saved!')}>Save Marks</Button>
      </div>

      <MarksFilters />
      <MarksTable />
    </div>
  );
};
