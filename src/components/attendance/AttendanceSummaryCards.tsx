import React from 'react';
import { StatCard } from '../dashboard/StatCard';
import { CalendarDays, CheckCircle2, XCircle, Percent } from 'lucide-react';

interface AttendanceSummaryCardsProps {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({ total, present, absent, percentage }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard title="Total Classes" value={total.toString()} icon={CalendarDays} colorClass="bg-blue-50 text-primary" />
      <StatCard title="Present / Late" value={present.toString()} icon={CheckCircle2} colorClass="bg-green-50 text-success" />
      <StatCard title="Absent" value={absent.toString()} icon={XCircle} colorClass="bg-red-50 text-danger" />
      <StatCard title="Percentage" value={`${percentage.toFixed(1)}%`} icon={Percent} colorClass="bg-purple-50 text-purple-600" />
    </div>
  );
};
