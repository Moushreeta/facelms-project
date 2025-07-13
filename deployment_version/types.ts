export type RoleName =
  | "CEO"
  | "PM"
  | "SME"
  | "L&D Manager"
  | "Campus Manager"
  | "Campus In-charge"
  | "Mentor"
  | "Admin";

export interface Role {
  level: number;
  name: string;
}

export interface User {
  id: string;
  employeeId: string;
  name:string;
  role: RoleName;
  reportsTo: string | null;
  department?: string;
  state?: string;
  campus?: string;
  smeId?: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface MentorScore {
  id: string;
  scoreId: string;
  mentorId: string;
  subjectId: string;
  module: number;
  type: "Viva" | "Test" | "Presentation";
  assessmentNumber: number;
  score: number;
}

export type AttendanceStatus = "Present" | "Absent" | "Leave" | "Not Applicable";

export interface DailyAttendance {
  id: string;
  attendanceId: string;
  mentorId: string;
  date: string;
  status: AttendanceStatus;
  recordedBy: string;
}

export interface PendingChange {
  id: string;
  changeId: string;
  proposedBy: string;
  mentorId: string;
  fieldToChange: keyof User;
  oldValue: string;
  newValue: string;
  status: "pending" | "approved" | "rejected";
  smeId: string;
}

export type ViewPage = 'dashboard' | 'userProfile' | 'userManagement' | 'scoreEntry' | 'attendanceEntry';

export interface View {
    page: ViewPage;
    context: {
        userId?: string;
    };
}

export type Users = Record<string, User>;
export type Subjects = Record<string, Subject>;