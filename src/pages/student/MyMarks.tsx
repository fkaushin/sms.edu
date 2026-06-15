import React, { useMemo } from 'react';
import { MarksSummaryCards } from '../../components/marks/MarksSummaryCards';
import { PerformanceChart } from '../../components/marks/PerformanceChart';
import { GradeChart } from '../../components/marks/GradeChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { marksService } from '../../services/marksService';
import { useAuth } from '../../contexts/AuthContext';

export const MyMarks: React.FC = () => {
  const { user } = useAuth();
  
  const { data: marksHistory = [], isLoading } = useQuery({
    queryKey: ['myMarks', user?.id],
    queryFn: () => marksService.getMarks(user?.id),
    enabled: !!user?.id
  });

  const { overallGrade, totalSubjects, avgScore, passedSubjects, performanceData, gradeData } = useMemo(() => {
    if (marksHistory.length === 0) {
      return { overallGrade: 'N/A', totalSubjects: 0, avgScore: 0, passedSubjects: 0, performanceData: [], gradeData: [] };
    }

    let totalScore = 0;
    let totalMax = 0;
    let passedCount = 0;
    const subjectsMap = new Map<string, number>();
    const gradesMap = new Map<string, number>();

    marksHistory.forEach(mark => {
      totalScore += mark.score;
      totalMax += mark.maxScore;
      
      const passMark = mark.maxScore * 0.4; // Assuming 40% is pass
      if (mark.score >= passMark) passedCount++;

      // Use latest score if multiple exams exist for a subject (or aggregate)
      subjectsMap.set(mark.subject, Math.round((mark.score / mark.maxScore) * 100));

      gradesMap.set(mark.grade, (gradesMap.get(mark.grade) || 0) + 1);
    });

    const average = (totalScore / totalMax) * 100;
    
    // Determine overall grade roughly
    let grade = 'F';
    if (average >= 90) grade = 'A+';
    else if (average >= 80) grade = 'A';
    else if (average >= 70) grade = 'B';
    else if (average >= 60) grade = 'C';
    else if (average >= 50) grade = 'D';

    const perfData = Array.from(subjectsMap.entries()).map(([subject, score]) => ({ subject, score }));
    const grData = Array.from(gradesMap.entries()).map(([name, value]) => ({ name, value }));

    return {
      overallGrade: grade,
      totalSubjects: marksHistory.length,
      avgScore: average,
      passedSubjects: passedCount,
      performanceData: perfData,
      gradeData: grData
    };
  }, [marksHistory]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-700';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

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

      <MarksSummaryCards 
        overallGrade={overallGrade}
        totalSubjects={totalSubjects}
        avgScore={avgScore}
        passedSubjects={passedSubjects}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PerformanceChart data={performanceData.length > 0 ? performanceData : [{ subject: 'No Data', score: 0 }]} />
        <GradeChart data={gradeData.length > 0 ? gradeData : [{ name: 'N/A', value: 1 }]} />
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
                  <th className="px-4 py-3 font-medium text-center">Score</th>
                  <th className="px-4 py-3 font-medium text-center">Max Score</th>
                  <th className="px-4 py-3 font-medium text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      <div className="flex justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>
                    </td>
                  </tr>
                ) : marksHistory.length > 0 ? (
                  marksHistory.map(mark => (
                    <tr key={mark.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{mark.subject}</td>
                      <td className="px-4 py-3 text-slate-600">{mark.examType}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 text-center">{mark.score}</td>
                      <td className="px-4 py-3 text-slate-600 text-center">{mark.maxScore}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(mark.grade)}`}>
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No marks history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
