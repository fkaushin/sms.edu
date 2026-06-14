import React from 'react';
import { Card, CardContent } from '../ui/Card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, colorClass = "text-primary bg-blue-50" }) => {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-success" : "text-danger")}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colorClass)}>
          <Icon size={24} />
        </div>
      </CardContent>
    </Card>
  );
};
