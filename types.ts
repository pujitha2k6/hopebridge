export enum UserRole {
  STUDENT = 'student',
  DONOR = 'donor',
  NONE = 'none'
}

export enum AppScreen {
  WELCOME = 'welcome',
  STUDENT_REGISTER = 'student_register',
  STUDENT_DASHBOARD = 'student_dashboard',
  UPLOAD_MARKS = 'upload_marks',
  DONOR_REGISTER = 'donor_register',
  DONOR_DASHBOARD = 'donor_dashboard',
  MATCHED_STUDENTS = 'matched_students',
  STUDENT_DETAIL = 'student_detail'
}

export interface StudentProfile {
  id: string;
  name: string;
  course: string;
  percentage: number;
  income: number;
  category: string;
  isVerified: boolean;
  documents: string[];
  description?: string;
  marksHistory?: { exam: string; score: number }[];
}

export interface DonorPreferences {
  budget: number;
  gender: string;
  background: string;
  studyLevel: string;
  location: string;
}
