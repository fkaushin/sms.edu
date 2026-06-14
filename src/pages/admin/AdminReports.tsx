import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../../services/reportService';

export const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState('attendance');
  
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: reportService.getReports
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reports Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Generate Report</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
              <select 
                className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="attendance">Attendance Report</option>
                <option value="performance">Performance Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
              <div className="flex items-center gap-2">
                <input type="date" className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <span className="text-slate-400">-</span>
                <input type="date" className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <button className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Filter size={18} />
              Generate Report
            </button>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Generated Reports History</h2>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading reports...</div>
            ) : (
              history.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-primary rounded-lg">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{report.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} />
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{report.type}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                  <Download size={20} />
                </button>
              </div>
              ))
            )}
            
            {!isLoading && history.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No reports generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
