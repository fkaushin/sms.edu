import React from 'react';
import { StatCard } from '../dashboard/StatCard';
import { Award, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';

interface MarksSummaryCardsProps {
  overallGrade: string;
  totalSubjects: number;
  avgScore: number;
  passedSubjects: number;
}

export const MarksSummaryCards: React.FC<MarksSummaryCardsProps> = ({ overallGrade, totalSubjects, avgScore, passedSubjects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard title="Overall Grade" value={overallGrade} icon={Award} colorClass="bg-blue-50 text-primary" />
      <StatCard title="Total Subjects" value={totalSubjects.toString()} icon={BookOpen} colorClass="bg-green-50 text-success" />
      <StatCard title="Avg Score" value={`${avgScore.toFixed(1)}%`} icon={TrendingUp} colorClass="bg-purple-50 text-purple-600" />
      <StatCard title="Passed" value={`${passedSubjects}/${totalSubjects}`} icon={CheckCircle} colorClass="bg-yellow-50 text-warning" />
    </div>
  );
};
