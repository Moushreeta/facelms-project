
import { User, Users, MentorScore, DailyAttendance } from '../types';

export const calculatePerformance = (
  userId: string,
  allUsers: Users,
  allScores: MentorScore[],
  subjectId: string,
  memo: Record<string, { score: number; count: number }> = {}
): { score: number; count: number } => {
  const memoKey = `${userId}-${subjectId}`;
  if (memo[memoKey]) return memo[memoKey];

  const user = allUsers[userId];
  if (!user) return { score: 0, count: 0 };

  if (user.role === 'Mentor') {
    const relevantScores = allScores.filter(s => s.mentorId === userId && (subjectId === 'All' || s.subjectId === subjectId));
    if (relevantScores.length === 0) return { score: 0, count: 0 };
    const totalScore = relevantScores.reduce((acc, s) => acc + s.score, 0);
    const avgScore = totalScore / relevantScores.length;
    memo[memoKey] = { score: avgScore, count: 1 };
    return memo[memoKey];
  }

  if (user.role === 'SME') {
    const smeMentors = Object.values(allUsers).filter(u => u.smeId === userId && u.role === 'Mentor');
    if (smeMentors.length === 0) return { score: 0, count: 0 };
    let totalWeightedScore = 0;
    for (const mentor of smeMentors) {
      totalWeightedScore += calculatePerformance(mentor.id, allUsers, allScores, subjectId, memo).score;
    }
    const avgScore = totalWeightedScore / smeMentors.length;
    memo[memoKey] = { score: avgScore, count: smeMentors.length };
    return memo[memoKey];
  }

  const directReports = Object.values(allUsers).filter(u => u.reportsTo === userId);
  if (directReports.length === 0) return { score: 0, count: 0 };

  let totalWeightedScore = 0;
  let totalMentors = 0;
  for (const report of directReports) {
    const reportPerformance = calculatePerformance(report.id, allUsers, allScores, subjectId, memo);
    if (reportPerformance.count > 0) {
      totalWeightedScore += reportPerformance.score * reportPerformance.count;
      totalMentors += reportPerformance.count;
    }
  }

  const avgPerformance = totalMentors > 0 ? totalWeightedScore / totalMentors : 0;
  memo[memoKey] = { score: avgPerformance, count: totalMentors };
  return memo[memoKey];
};

export const calculateAttendance = (
  userId: string,
  allUsers: Users,
  dailyAttendance: DailyAttendance[],
  memo: Record<string, { attendance: number; count: number }> = {}
): { attendance: number; count: number } => {
  if (memo[userId]) return memo[userId];

  const user = allUsers[userId];
  if (!user) return { attendance: 0, count: 0 };

  if (user.role === 'Mentor') {
    const records = dailyAttendance.filter(a => a.mentorId === userId && (a.status === 'Present' || a.status === 'Absent'));
    if (records.length === 0) return { attendance: 0, count: 0 };
    const presentCount = records.filter(a => a.status === 'Present').length;
    const percentage = (presentCount / records.length) * 100;
    memo[userId] = { attendance: percentage, count: 1 };
    return memo[userId];
  }
  
  const getSubordinatesRecursive = (uId: string): User[] => {
      let subs: User[] = [];
      const reports = Object.values(allUsers).filter(u => u.reportsTo === uId);
      for (const r of reports) {
          subs.push(r);
          subs = subs.concat(getSubordinatesRecursive(r.id));
      }
      return subs;
  };

  const subordinates = getSubordinatesRecursive(userId);
  const mentorsInScope = subordinates.filter(u => u.role === 'Mentor');

  if (user.role === 'SME') {
      const smeMentors = Object.values(allUsers).filter(u => u.smeId === userId && u.role === 'Mentor');
      mentorsInScope.push(...smeMentors);
  }

  if (mentorsInScope.length === 0) return { attendance: 0, count: 0 };

  let totalAttendance = 0;
  let mentorWithAttendanceCount = 0;
  for (const mentor of mentorsInScope) {
    const mentorAttendance = calculateAttendance(mentor.id, allUsers, dailyAttendance, memo);
    if(mentorAttendance.count > 0) {
      totalAttendance += mentorAttendance.attendance;
      mentorWithAttendanceCount++;
    }
  }

  const avgAttendance = mentorWithAttendanceCount > 0 ? totalAttendance / mentorWithAttendanceCount : 0;
  memo[userId] = { attendance: avgAttendance, count: mentorsInScope.length };
  return memo[userId];
};
