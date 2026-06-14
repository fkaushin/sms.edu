import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** Single animated skeleton bar */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`} />
);

/** Skeleton for a stat card */
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex items-center gap-4">
    <Skeleton className="h-12 w-12 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-16" />
    </div>
  </div>
);

/** Skeleton for a table row */
export const TableRowSkeleton: React.FC = () => (
  <tr>
    {[1, 2, 3, 4, 5].map((i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

/** N table row skeletons */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} />
    ))}
  </>
);

/** Skeleton for an activity item */
export const ActivitySkeleton: React.FC = () => (
  <div className="flex items-start gap-3">
    <Skeleton className="h-2 w-2 rounded-full mt-2" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-2 w-20" />
    </div>
  </div>
);
