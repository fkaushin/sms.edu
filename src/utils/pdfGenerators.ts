/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';

export interface StudentIdData {
  id: string;
  firstName: string;
  lastName: string;
  enrollmentNo: string;
  department: string;
  year: number;
  photoUrl?: string | null;
  isActive: boolean;
}

const UNIVERSITY_NAME = 'Summit Meridian Sciences University';
const UNIVERSITY_TAGLINE = 'Excellence in Education';
const PRIMARY_COLOR: [number, number, number] = [37, 99, 235];
const DARK_COLOR: [number, number, number] = [15, 23, 42];
const ACCENT_COLOR: [number, number, number] = [249, 250, 251];

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
//  STUDENT ID CARD
// ─────────────────────────────────────────────
export async function generateStudentIdCard(student: StudentIdData): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [85.6, 54], // standard credit card size
  });

  // Background
  pdf.setFillColor(...ACCENT_COLOR);
  pdf.rect(0, 0, 85.6, 54, 'F');

  // Header strip
  pdf.setFillColor(...PRIMARY_COLOR);
  pdf.rect(0, 0, 85.6, 14, 'F');

  // University Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  pdf.text(UNIVERSITY_NAME.toUpperCase(), 5, 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5);
  pdf.text(UNIVERSITY_TAGLINE, 5, 10);

  // "STUDENT ID" badge
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(60, 3, 22, 8, 2, 2, 'F');
  pdf.setTextColor(...PRIMARY_COLOR);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.5);
  pdf.text('STUDENT ID', 71, 8, { align: 'center' });

  // Photo circle placeholder
  pdf.setFillColor(226, 232, 240);
  pdf.circle(14, 31, 10, 'F');

  let photoLoaded = false;
  if (student.photoUrl) {
    const b64 = await loadImageAsBase64(student.photoUrl);
    if (b64) {
      try {
        pdf.addImage(b64, 'JPEG', 4, 21, 20, 20);
        photoLoaded = true;
      } catch { /* ignore */ }
    }
  }
  if (!photoLoaded) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(148, 163, 184);
    const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
    pdf.text(initials, 14, 34, { align: 'center' });
  }

  // Student details
  pdf.setTextColor(...DARK_COLOR);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(`${student.firstName} ${student.lastName}`, 30, 22);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(71, 85, 105);
  pdf.text(student.enrollmentNo, 30, 27);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.text(`Department: ${student.department}`, 30, 32);
  pdf.text(`Year: ${student.year}`, 30, 36.5);

  // Status badge
  const statusColor: [number, number, number] = student.isActive ? [22, 163, 74] : [220, 38, 38];
  pdf.setFillColor(...statusColor);
  pdf.roundedRect(30, 39, 20, 5, 1.5, 1.5, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.5);
  pdf.text(student.isActive ? 'ACTIVE' : 'INACTIVE', 40, 42.7, { align: 'center' });

  // Footer strip
  pdf.setFillColor(...DARK_COLOR);
  pdf.rect(0, 48, 85.6, 6, 'F');
  pdf.setTextColor(148, 163, 184);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(4.5);
  pdf.text('If found, please return to the university administration.', 42.8, 52, { align: 'center' });

  pdf.save(`ID_Card_${student.enrollmentNo}.pdf`);
}

// ─────────────────────────────────────────────
//  REPORT CARD
// ─────────────────────────────────────────────
export interface MarkEntry {
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
  examType: string;
}

export interface ReportCardData {
  student: StudentIdData;
  marks: MarkEntry[];
  attendancePercent: number;
  academicYear?: string;
}

export async function generateReportCard(data: ReportCardData): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = pdf.internal.pageSize.getWidth();
  let y = 0;

  // Header
  pdf.setFillColor(...PRIMARY_COLOR);
  pdf.rect(0, 0, pw, 38, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text(UNIVERSITY_NAME, pw / 2, 14, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('OFFICIAL ACADEMIC REPORT CARD', pw / 2, 22, { align: 'center' });

  pdf.setFontSize(8);
  pdf.text(
    `Academic Year: ${data.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)}`,
    pw / 2, 30, { align: 'center' }
  );

  y = 46;

  // Student Info section
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(14, y, pw - 28, 30, 3, 3, 'F');
  pdf.setTextColor(...DARK_COLOR);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Student Information', 20, y + 8);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const leftCol = 20;
  const rightCol = pw / 2 + 5;

  pdf.setTextColor(71, 85, 105);
  pdf.text('Name:', leftCol, y + 16);
  pdf.text('Enrollment No:', leftCol, y + 22);
  pdf.setTextColor(...DARK_COLOR);
  pdf.text(`${data.student.firstName} ${data.student.lastName}`, leftCol + 28, y + 16);
  pdf.text(data.student.enrollmentNo, leftCol + 28, y + 22);

  pdf.setTextColor(71, 85, 105);
  pdf.text('Department:', rightCol, y + 16);
  pdf.text('Year:', rightCol, y + 22);
  pdf.setTextColor(...DARK_COLOR);
  pdf.text(data.student.department, rightCol + 28, y + 16);
  pdf.text(`Year ${data.student.year}`, rightCol + 28, y + 22);

  y += 40;

  // Marks Table
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...DARK_COLOR);
  pdf.text('Academic Performance', 14, y);

  y += 6;
  const headers = ['Subject', 'Exam Type', 'Score', 'Max Score', 'Grade'];
  const colWidths = [60, 35, 22, 25, 18];
  const colX: number[] = [];
  let cx = 14;
  colWidths.forEach((w) => { colX.push(cx); cx += w; });

  // Table header
  pdf.setFillColor(...PRIMARY_COLOR);
  pdf.rect(14, y, pw - 28, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  headers.forEach((h, i) => pdf.text(h, colX[i] + 2, y + 5.5));

  y += 8;
  let totalScore = 0;
  let totalMax = 0;
  data.marks.forEach((m, idx) => {
    totalScore += m.score;
    totalMax += m.maxScore;
    pdf.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    pdf.rect(14, y, pw - 28, 7, 'F');
    pdf.setTextColor(...DARK_COLOR);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(m.subject, colX[0] + 2, y + 5);
    pdf.text(m.examType, colX[1] + 2, y + 5);
    pdf.text(m.score.toString(), colX[2] + 2, y + 5);
    pdf.text(m.maxScore.toString(), colX[3] + 2, y + 5);

    // Grade badge color
    const gc = m.grade.startsWith('A') ? [22, 163, 74] as [number, number, number]
      : m.grade === 'B' ? [37, 99, 235] as [number, number, number]
      : m.grade === 'C' ? [234, 179, 8] as [number, number, number]
      : [220, 38, 38] as [number, number, number];
    pdf.setFillColor(...gc);
    pdf.roundedRect(colX[4] + 1, y + 1, 14, 5, 1.5, 1.5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text(m.grade, colX[4] + 8, y + 5, { align: 'center' });
    y += 7;
  });

  // Summary
  y += 8;
  pdf.setFillColor(30, 41, 59);
  pdf.roundedRect(14, y, pw - 28, 20, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  const overallPct = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : '0.0';
  pdf.text(`Overall Score: ${totalScore}/${totalMax} (${overallPct}%)`, pw / 2, y + 8, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Attendance: ${data.attendancePercent.toFixed(1)}%`, pw / 2, y + 15, { align: 'center' });

  // Footer
  const fY = pdf.internal.pageSize.getHeight() - 14;
  pdf.setFillColor(...DARK_COLOR);
  pdf.rect(0, fY, pw, 14, 'F');
  pdf.setTextColor(148, 163, 184);
  pdf.setFontSize(7);
  pdf.text(
    `Generated on ${new Date().toLocaleDateString()} | ${UNIVERSITY_NAME} — This is an official document.`,
    pw / 2, fY + 8, { align: 'center' }
  );

  pdf.save(`Report_Card_${data.student.enrollmentNo}.pdf`);
}

// ─────────────────────────────────────────────
//  ATTENDANCE CERTIFICATE
// ─────────────────────────────────────────────
export interface AttendanceCertData {
  student: StudentIdData;
  attendancePercent: number;
  academicYear?: string;
}

export async function generateAttendanceCertificate(data: AttendanceCertData): Promise<void> {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();

  // Outer border
  pdf.setDrawColor(...PRIMARY_COLOR);
  pdf.setLineWidth(3);
  pdf.rect(8, 8, pw - 16, ph - 16);
  pdf.setLineWidth(0.5);
  pdf.rect(12, 12, pw - 24, ph - 24);

  // Top accent
  pdf.setFillColor(...PRIMARY_COLOR);
  pdf.rect(12, 12, pw - 24, 22, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text(UNIVERSITY_NAME.toUpperCase(), pw / 2, 22, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(UNIVERSITY_TAGLINE, pw / 2, 30, { align: 'center' });

  // Certificate title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(...DARK_COLOR);
  pdf.text('CERTIFICATE OF ATTENDANCE', pw / 2, 55, { align: 'center' });

  // Underline
  pdf.setDrawColor(...PRIMARY_COLOR);
  pdf.setLineWidth(1);
  pdf.line(pw / 2 - 60, 58, pw / 2 + 60, 58);

  // Body text
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(51, 65, 85);
  pdf.text('This is to certify that', pw / 2, 72, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(...PRIMARY_COLOR);
  pdf.text(`${data.student.firstName} ${data.student.lastName}`, pw / 2, 83, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(51, 65, 85);
  pdf.text(`Enrollment No: ${data.student.enrollmentNo} | Department: ${data.student.department}, Year ${data.student.year}`, pw / 2, 91, { align: 'center' });

  pdf.setFontSize(11);
  pdf.text('has maintained an attendance of', pw / 2, 103, { align: 'center' });

  // Big % number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(40);
  pdf.setTextColor(...PRIMARY_COLOR);
  pdf.text(`${data.attendancePercent.toFixed(1)}%`, pw / 2, 122, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(51, 65, 85);
  const year = data.academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
  pdf.text(`during the Academic Year ${year}`, pw / 2, 132, { align: 'center' });

  // Verification block
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(pw / 2 - 60, 140, 120, 20, 3, 3, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);
  pdf.text('VERIFICATION', pw / 2, 147, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  const verCode = `${data.student.enrollmentNo}-${Date.now().toString(36).toUpperCase()}`;
  pdf.text(`Certificate ID: ${verCode}`, pw / 2, 153, { align: 'center' });
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pw / 2, 158, { align: 'center' });

  // Signature lines
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.5);
  const sigY = ph - 28;
  pdf.line(30, sigY, 90, sigY);
  pdf.line(pw - 90, sigY, pw - 30, sigY);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Dean of Faculty', 60, sigY + 5, { align: 'center' });
  pdf.text('Registrar', pw - 60, sigY + 5, { align: 'center' });

  // Footer strip
  pdf.setFillColor(...DARK_COLOR);
  pdf.rect(12, ph - 14, pw - 24, 2, 'F');

  pdf.save(`Attendance_Certificate_${data.student.enrollmentNo}.pdf`);
}

// Helper: Upload a generated PDF to storage (placeholder for future backend integration)
export async function saveDocumentToStorage(): Promise<string | null> {
  return null;
}
