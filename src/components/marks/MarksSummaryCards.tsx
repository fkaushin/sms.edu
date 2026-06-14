import React from 'react';
import { StatCard } from '../dashboard/StatCard';
import { Award, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';

export const MarksSummaryCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard title="Overall Grade" value="A" icon={Award} colorClass="bg-blue-50 text-primary" />
      <StatCard title="Total Subjects" value="6" icon={BookOpen} colorClass="bg-green-50 text-success" />
      <StatCard title="Avg Score" value="87.5%" icon={TrendingUp} trend="Top 10% of class" trendUp={true} colorClass="bg-purple-50 text-purple-600" />
      <StatCard title="Passed" value="6/6" icon={CheckCircle} colorClass="bg-yellow-50 text-warning" />
    </div>
  );
};
