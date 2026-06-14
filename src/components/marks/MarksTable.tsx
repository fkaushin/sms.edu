import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';

export const MarksTable: React.FC = () => {
  const { data: mockStudents = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  const [scores, setScores] = useState<Record<string, number>>({});
  const maxScore = 100;

  const handleScoreChange = (studentId: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= maxScore) {
      setScores(prev => ({ ...prev, [studentId]: num }));
    } else if (value === '') {
      setScores(prev => {
        const next = { ...prev };
        delete next[studentId];
        return next;
      });
    }
  };

  const getGrade = (score?: number) => {
    if (score === undefined) return '-';
    const percent = (score / maxScore) * 100;
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 60) return 'C';
    if (percent >= 50) return 'D';
    return 'F';
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading students...</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-medium">Student Name</th>
              <th className="px-6 py-4 font-medium">Subject</th>
              <th className="px-6 py-4 font-medium">Exam Type</th>
              <th className="px-6 py-4 font-medium">Score</th>
              <th className="px-6 py-4 font-medium">Max Score</th>
              <th className="px-6 py-4 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {mockStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{student.firstName} {student.lastName}</td>
                <td className="px-6 py-4 text-slate-600">Data Structures</td>
                <td className="px-6 py-4 text-slate-600">Midterm</td>
                <td className="px-6 py-4">
                  <input 
                    type="number" 
                    min="0"
                    max={maxScore}
                    className="w-20 px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={scores[student.id] || ''}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 text-slate-600">{maxScore}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getGrade(scores[student.id]) === 'F' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {getGrade(scores[student.id])}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
