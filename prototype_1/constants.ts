
import { Role, RoleName, Users, Subjects, MentorScore, DailyAttendance, PendingChange } from './types';

export const ROLES: Record<RoleName, Role> = {
  "Admin": { level: -1, name: "System Admin" },
  "CEO": { level: 0, name: "CEO" },
  "PM": { level: 1, name: "Program Manager" },
  "SME": { level: 1, name: "Subject Matter Expert" },
  "L&D Manager": { level: 1, name: "L&D Manager" },
  "Campus Manager": { level: 2, name: "Campus Manager" },
  "Campus In-charge": { level: 3, name: "Campus In-charge" },
  "Mentor": { level: 4, name: "Mentor" },
};

export const initialUsers: Users = {
  "admin": { id: "admin", employeeId: "Admin", name: "System Admin", role: "Admin", password: "Root", reportsTo: null },
  "ceo-kr": { id: "ceo-kr", employeeId: "FPC-CEO-KR", name: "Karthik Raja", role: "CEO", password: "password", reportsTo: null },
  "pm-ak": { id: "pm-ak", employeeId: "FPC-PM-AK", name: "Ashok Kumar", role: "PM", password: "password", reportsTo: "ceo-kr" },
  "sme-kau": { id: "sme-kau", employeeId: "FPC-SME-KAU", name: "Kaustav", role: "SME", password: "password", reportsTo: "pm-ak", department: "Data Science" },
  "sme-amr": { id: "sme-amr", employeeId: "FPC-SME-AMR", name: "Amrita", role: "SME", password: "password", reportsTo: "pm-ak", department: "English" },
  "ld-001": { id: "ld-001", employeeId: "FPC-LD-01", name: "Anjali Mehta", role: "L&D Manager", password: "password", reportsTo: "pm-ak" },
  "cm-tn-01": { id: "cm-tn-01", employeeId: "FPC-CM-TN-01", name: "Karthik Raja Sr.", role: "Campus Manager", password: "password", reportsTo: "pm-ak", state: "Tamil Nadu", smeId: "sme-kau" },
  "cm-mh-01": { id: "cm-mh-01", employeeId: "FPC-CM-MH-01", name: "Suresh Patil", role: "Campus Manager", password: "password", reportsTo: "pm-ak", state: "Maharashtra", smeId: "sme-amr" },
  "cicm-psg-01": { id: "cicm-psg-01", employeeId: "FPC-CICM-PSG-01", name: "Deepa Kumar", role: "Campus In-charge", password: "password", reportsTo: "cm-tn-01", campus: "PSG College", state: "Tamil Nadu", department: "CSE", smeId: "sme-kau" },
  "cicm-vit-01": { id: "cicm-vit-01", employeeId: "FPC-CICM-VIT-01", name: "Vijay Nair", role: "Campus In-charge", password: "password", reportsTo: "cm-tn-01", campus: "VIT Vellore", state: "Tamil Nadu", department: "IT", smeId: "sme-kau" },
  "cicm-coep-01": { id: "cicm-coep-01", employeeId: "FPC-CICM-COEP-01", name: "Pooja Desai", role: "Campus In-charge", password: "password", reportsTo: "cm-mh-01", campus: "COEP Pune", state: "Maharashtra", department: "Mechanical", smeId: "sme-amr" },
  "m-psg-cse-01": { id: "m-psg-cse-01", employeeId: "FPC-M-PSG-01", name: "Arun Pandian", role: "Mentor", password: "password", reportsTo: "cicm-psg-01", campus: "PSG College", state: "Tamil Nadu", department: "CSE", smeId: "sme-kau" },
  "m-psg-cse-02": { id: "m-psg-cse-02", employeeId: "FPC-M-PSG-02", name: "Saranya Devi", role: "Mentor", password: "password", reportsTo: "cicm-psg-01", campus: "PSG College", state: "Tamil Nadu", department: "CSE", smeId: "sme-kau" },
  "m-vit-it-01": { id: "m-vit-it-01", employeeId: "FPC-M-VIT-01", name: "Rajesh Kumar", role: "Mentor", password: "password", reportsTo: "cicm-vit-01", campus: "VIT Vellore", state: "Tamil Nadu", department: "IT", smeId: "sme-kau" },
  "m-coep-mech-01": { id: "m-coep-mech-01", employeeId: "FPC-M-COEP-01", name: "Ganesh Joshi", role: "Mentor", password: "password", reportsTo: "cicm-coep-01", campus: "COEP Pune", state: "Maharashtra", department: "Mechanical", smeId: "sme-amr" },
};

export const initialSubjects: Subjects = {
    "subj-dsa": { id: "subj-dsa", name: "Data Structures & Algorithms" },
    "subj-web": { id: "subj-web", name: "Advanced Web Development" },
    "subj-eng": { id: "subj-eng", name: "Business English" },
};

export const initialMentorScores: MentorScore[] = [
    { scoreId: "s01", mentorId: "m-psg-cse-01", subjectId: "subj-dsa", module: 1, type: "Viva", assessmentNumber: 1, score: 30 },
    { scoreId: "s02", mentorId: "m-psg-cse-01", subjectId: "subj-dsa", module: 1, type: "Viva", assessmentNumber: 2, score: 100 },
    { scoreId: "s03", mentorId: "m-psg-cse-01", subjectId: "subj-dsa", module: 2, type: "Test", assessmentNumber: 1, score: 88 },
    { scoreId: "s04", mentorId: "m-psg-cse-02", subjectId: "subj-dsa", module: 1, type: "Test", assessmentNumber: 1, score: 72 },
    { scoreId: "s05", mentorId: "m-vit-it-01", subjectId: "subj-dsa", module: 1, type: "Viva", assessmentNumber: 1, score: 95 },
    { scoreId: "s06", mentorId: "m-coep-mech-01", subjectId: "subj-eng", module: 1, type: "Presentation", assessmentNumber: 1, score: 85 },
];

export const initialDailyAttendance: DailyAttendance[] = [
    { attendanceId: 'a01', mentorId: 'm-psg-cse-01', date: '2025-07-07', status: 'Present', recordedBy: 'sme-kau' },
    { attendanceId: 'a02', mentorId: 'm-psg-cse-02', date: '2025-07-07', status: 'Absent', recordedBy: 'sme-kau' },
    { attendanceId: 'a03', mentorId: 'm-vit-it-01', date: '2025-07-07', status: 'Leave', recordedBy: 'sme-kau' },
];

export const initialPendingChanges: PendingChange[] = [
    { changeId: 'c01', proposedBy: 'ld-001', mentorId: 'm-vit-it-01', fieldToChange: 'campus', oldValue: 'VIT Vellore', newValue: 'VIT Chennai', status: 'pending', smeId: 'sme-kau' }
];
