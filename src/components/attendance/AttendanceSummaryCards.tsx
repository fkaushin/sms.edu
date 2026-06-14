import React from 'react';
import { StatCard } from '../dashboard/StatCard';
import { CalendarDays, CheckCircle2, XCircle, Percent } from 'lucide-react';

export const AttendanceSummaryCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard title="Total Classes" value="45" icon={CalendarDays} colorClass="bg-blue-50 text-primary" />
      <StatCard title="Present" value="42" icon={CheckCircle2} colorClass="bg-green-50 text-success" />
      <StatCard title="Absent" value="3" icon={XCircle} colorClass="bg-red-50 text-danger" />
      <StatCard title="Percentage" value="93.3%" icon={Percent} colorClass="bg-purple-50 text-purple-600" />
    </div>
  );
};
