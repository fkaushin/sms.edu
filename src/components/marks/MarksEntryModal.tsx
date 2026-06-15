import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendanceService';
import { marksService } from '../../services/marksService';
import type { Student } from '../../types';
import { toast } from 'sonner';

interface MarksEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  departmentId: string;
  examType: string;
}

export const MarksEntryModal: React.FC<MarksEntryModalProps> = ({
  isOpen, onClose, student, departmentId, examType
}) => {
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, { score: number | ''; maxScore: number }>>({});

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects', departmentId],
    queryFn: () => attendanceService.getSubjects(departmentId),
    enabled: isOpen && !!departmentId
  });

  const { data: existingMarks = [], isLoading: isLoadingMarks } = useQuery({
    queryKey: ['marks', student.id, examType],
    queryFn: () => marksService.getStudentMarksForExam(student.id, examType),
    enabled: isOpen && !!student.id && !!examType
  });

  useEffect(() => {
    if (subjects.length > 0) {
      const initialScores: Record<string, { score: number | ''; maxScore: number }> = {};
      subjects.forEach((sub: any) => {
        const existing = existingMarks.find((m: any) => m.subject_id === sub.id);
        initialScores[sub.id] = {
          score: existing ? existing.score : '',
          maxScore: existing ? existing.max_score : 100
        };
      });
      setScores(initialScores);
    }
  }, [subjects, existingMarks]);

  const handleScoreChange = (subjectId: string, field: 'score' | 'maxScore', value: string) => {
    setScores(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value === '' ? '' : parseFloat(value)
      }
    }));
  };

  const getGrade = (score: number | '', maxScore: number) => {
    if (score === '') return '-';
    const percent = (score / maxScore) * 100;
    if (percent >= 90) return 'A+';
    if (percent >= 80) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 60) return 'C';
    if (percent >= 50) return 'D';
    return 'F';
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const recordsToSave: any[] = [];
      Object.keys(scores).forEach(subId => {
        const s = scores[subId];
        if (s.score !== '') {
          recordsToSave.push({
            student_id: student.id,
            subject_id: subId,
            score: s.score,
            max_score: s.maxScore,
            exam_type: examType,
            grade: getGrade(s.score, s.maxScore)
          });
        }
      });
      return marksService.saveBulkMarks(recordsToSave);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks'] });
      toast.success('Marks saved successfully!');
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save marks');
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Enter Marks</h2>
            <p className="text-sm text-slate-500 mt-1">
              {student.firstName} {student.lastName} ({student.enrollmentNo}) - {examType}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoadingSubjects || isLoadingMarks ? (
            <div className="text-center text-slate-500 py-8">Loading...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center text-slate-500 py-8">No subjects found for this department.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-200 text-sm font-medium text-slate-600">
                <div className="col-span-5">Subject</div>
                <div className="col-span-3 text-center">Score</div>
                <div className="col-span-2 text-center">Max</div>
                <div className="col-span-2 text-center">Grade</div>
              </div>
              
              {subjects.map((sub: any) => {
                const subScore = scores[sub.id];
                if (!subScore) return null;

                const grade = getGrade(subScore.score, subScore.maxScore);

                return (
                  <div key={sub.id} className="grid grid-cols-12 gap-4 items-center py-2">
                    <div className="col-span-5 text-sm font-medium text-slate-800">{sub.name}</div>
                    <div className="col-span-3 flex justify-center">
                      <input 
                        type="number"
                        min="0"
                        max={subScore.maxScore}
                        value={subScore.score}
                        onChange={(e) => handleScoreChange(sub.id, 'score', e.target.value)}
                        className="w-20 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center"
                        placeholder="--"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <input 
                        type="number"
                        min="1"
                        value={subScore.maxScore}
                        onChange={(e) => handleScoreChange(sub.id, 'maxScore', e.target.value)}
                        className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        grade === '-' ? 'bg-slate-100 text-slate-500' :
                        grade === 'F' ? 'bg-red-100 text-red-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {grade}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || subjects.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </div>
    </div>
  );
};
