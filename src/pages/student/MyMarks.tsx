import React from 'react';
import { MarksSummaryCards } from '../../components/marks/MarksSummaryCards';
import { PerformanceChart } from '../../components/marks/PerformanceChart';
import { GradeChart } from '../../components/marks/GradeChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';

export const MyMarks: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Marks</h1>
          <p className="text-sm text-slate-500 mt-1">View your academic performance and grades.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download size={18} />
          Download Report
        </Button>
      </div>

      <MarksSummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PerformanceChart />
        <GradeChart />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marks History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Exam Type</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Max Score</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">Data Structures</td>
                  <td className="px-4 py-3 text-slate-600">Midterm</td>
                  <td className="px-4 py-3 font-medium text-slate-900">85</td>
                  <td className="px-4 py-3 text-slate-600">100</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">A</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900">Database Systems</td>
                  <td className="px-4 py-3 text-slate-600">Midterm</td>
                  <td className="px-4 py-3 font-medium text-slate-900">92</td>
                  <td className="px-4 py-3 text-slate-600">100</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">A+</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
