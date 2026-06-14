export type Role = 'ADMIN' | 'STUDENT';
export type Status = 'PRESENT' | 'ABSENT' | 'LATE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  enrollmentNo: string;
  dateOfBirth: string;
  gender: Gender;
  phone?: string;
  address?: string;
  department: string;
  year: number;
  isActive: boolean;
  personalEmail: string;
  universityEmail: string;
  credentialsSent: boolean;
  credentialsSentAt?: string;
  firstLoginCompleted: boolean;
  accountStatus: AccountStatus;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: Status;
  subject: string;
}

export interface Mark {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  maxScore: number;
  grade: string;
  examType: string;
}
