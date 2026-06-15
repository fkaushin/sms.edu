import React, { useState } from 'react';
import { UserCircle, BookOpen, MapPin, Phone, Mail, Save, Download, Loader2, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { storageService } from '../../services/storageService';
import { AvatarUpload } from '../../components/ui/AvatarUpload';
import { toast } from 'sonner';
import {
  generateStudentIdCard,
  generateReportCard,
  generateAttendanceCertificate,
} from '../../utils/pdfGenerators';
import { marksService } from '../../services/marksService';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  // Find my student record by matching the profile user id
  const { data: students = [], refetch } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });
  const student = students.find((s) => s.userId === user?.id) || students[0];

  const { data: avatarUrl } = useQuery({
    queryKey: ['avatarUrl', user?.id],
    queryFn: () => storageService.getProfileAvatarUrl(user!.id),
    enabled: !!user?.id,
  });

  const { data: marks = [] } = useQuery({
    queryKey: ['myMarks', student?.id],
    queryFn: () => marksService.getMarks(student?.id),
    enabled: !!student?.id,
  });

  const contactMutation = useMutation({
    mutationFn: async () => {
      if (!student?.id) throw new Error('No student record found');
      await studentService.updateStudent(student.id, {
        phone: phone || student.phone,
        address: address || student.address,
        dateOfBirth: dob || student.dateOfBirth,
        gender: (gender as any) || student.gender,
      });
    },
    onSuccess: () => {
      toast.success('Information updated successfully!');
      refetch();
    },
    onError: () => toast.error('Failed to update information.'),
  });

  const downloadId = async () => {
    if (!student) return;
    setPdfLoading('id');
    try {
      await generateStudentIdCard({ ...student, photoUrl: avatarUrl });
    } finally { setPdfLoading(null); }
  };

  const downloadReportCard = async () => {
    if (!student) return;
    setPdfLoading('report');
    try {
      await generateReportCard({
        student: { ...student, photoUrl: avatarUrl },
        marks: marks.map((m) => ({
          subject: m.subject,
          score: m.score,
          maxScore: m.maxScore,
          grade: m.grade,
          examType: m.examType,
        })),
        attendancePercent: 85,
      });
    } finally { setPdfLoading(null); }
  };

  const downloadCert = async () => {
    if (!student) return;
    setPdfLoading('cert');
    try {
      await generateAttendanceCertificate({
        student: { ...student, photoUrl: avatarUrl },
        attendancePercent: 85,
      });
    } finally { setPdfLoading(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {/* Download Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={downloadId}
            disabled={!student || pdfLoading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {pdfLoading === 'id' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            ID Card
          </button>
          <button
            onClick={downloadReportCard}
            disabled={!student || pdfLoading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {pdfLoading === 'report' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Report Card
          </button>
          <button
            onClick={downloadCert}
            disabled={!student || pdfLoading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {pdfLoading === 'cert' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Certificate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center text-slate-300">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={100} />
                )}
              </div>
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {student ? `${student.firstName} ${student.lastName}` : user?.email?.split('@')[0]}
                </h2>
                <p className="text-slate-500 font-medium">
                  {student ? `${student.department}, Year ${student.year}` : 'Student'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium text-sm mb-2">
              {student?.isActive ? 'Active Student' : 'Student'}
            </span>
          </div>

          {/* Avatar Upload */}
          <div className="mb-6">
            <AvatarUpload userId={user?.id || ''} currentUrl={avatarUrl} size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <UserCircle size={20} className="text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">First Name</span>
                    <span className="col-span-2 font-medium text-slate-900">{student?.firstName || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">Last Name</span>
                    <span className="col-span-2 font-medium text-slate-900">{student?.lastName || '—'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <BookOpen size={20} className="text-primary" />
                  Academic Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">Enrollment No.</span>
                    <span className="col-span-2 font-medium text-slate-900">{student?.enrollmentNo || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">Department</span>
                    <span className="col-span-2 font-medium text-slate-900">{student?.department || '—'}</span>
                  </div>
                  <div className="grid grid-cols-3 text-sm">
                    <span className="text-slate-500">Current Year</span>
                    <span className="col-span-2 font-medium text-slate-900">{student ? `Year ${student.year}` : '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <MapPin size={20} className="text-primary" />
                Editable Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Mail size={14} /> Email
                  </label>
                  <input type="email" disabled value={user?.email || ''}
                    className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </label>
                  <input type="tel"
                    defaultValue={student?.phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Date of Birth
                  </label>
                  <input type="date"
                    defaultValue={student?.dateOfBirth || ''}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Users size={14} /> Gender
                  </label>
                  <select
                    defaultValue={student?.gender || ''}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <MapPin size={14} /> Address
                  </label>
                  <textarea rows={3}
                    defaultValue={student?.address || ''}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
                  </textarea>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => contactMutation.mutate()}
                    disabled={contactMutation.isPending}
                    className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                  >
                    {contactMutation.isPending
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Save size={18} />}
                    Save Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
