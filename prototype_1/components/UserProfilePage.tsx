
import React, { useMemo, useState } from 'react';
import { User, Users, MentorScore, DailyAttendance, View } from '../types';
import { Card, StatCard } from './ui';
import { ROLES, initialSubjects } from '../constants';
import { calculatePerformance, calculateAttendance } from '../services/performanceService';
import { Home, ChevronRight, GraduationCap, UserCheck, Users as UsersIcon } from 'lucide-react';

interface UserProfilePageProps {
  userId: string;
  allUsers: Users;
  setView: (view: View) => void;
  mentorScores: MentorScore[];
  dailyAttendance: DailyAttendance[];
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId, allUsers, setView, mentorScores, dailyAttendance }) => {
    const user = allUsers[userId];
    const [selectedSubject, setSelectedSubject] = useState('All');

    const breadcrumbs = useMemo(() => {
        const path: User[] = [];
        let currentUser: User | undefined = user;
        while (currentUser) {
            path.unshift(currentUser);
            currentUser = allUsers[currentUser.reportsTo || ''];
        }
        return path;
    }, [user, allUsers]);

    const { score } = useMemo(() => calculatePerformance(userId, allUsers, mentorScores, selectedSubject), [userId, allUsers, mentorScores, selectedSubject]);
    const { attendance } = useMemo(() => calculateAttendance(userId, allUsers, dailyAttendance), [userId, allUsers, dailyAttendance]);

    const directReports = useMemo(() => Object.values(allUsers).filter(u => u.reportsTo === userId), [userId, allUsers]);
    const teamPerformanceData = useMemo(() => {
        return directReports.map(u => ({
            ...u,
            score: calculatePerformance(u.id, allUsers, mentorScores, selectedSubject).score,
            attendance: calculateAttendance(u.id, allUsers, dailyAttendance).attendance
        }));
    }, [directReports, allUsers, mentorScores, dailyAttendance, selectedSubject]);

    if (!user) return <div className="text-center p-8">User not found.</div>;

    const getAttendanceStatusPill = (status: string) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'Present': return `${baseClasses} bg-green-100 text-green-800`;
            case 'Absent': return `${baseClasses} bg-red-100 text-red-800`;
            case 'Leave': return `${baseClasses} bg-blue-100 text-blue-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    }

    return (
        <div className="space-y-6">
            <nav className="flex items-center text-sm text-gray-500">
                <button onClick={() => setView({ page: 'dashboard', context: {} })} className="hover:text-indigo-600 flex items-center"><Home className="w-4 h-4 mr-1"/>Dashboard</button>
                {breadcrumbs.slice(0, -1).map(crumb => (
                    <React.Fragment key={crumb.id}>
                        <ChevronRight className="w-4 h-4 mx-1" />
                        <button onClick={() => setView({ page: 'userProfile', context: { userId: crumb.id } })} className="hover:text-indigo-600">{crumb.name}</button>
                    </React.Fragment>
                ))}
                 <ChevronRight className="w-4 h-4 mx-1" />
                 <span className="font-medium text-gray-700">{user.name}</span>
            </nav>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-800">{user.name}'s Profile</h2>
                <div className="w-full sm:w-1/4">
                    <label htmlFor="subjectFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Subject</label>
                    <select id="subjectFilter" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="All">All Subjects</option>
                        {Object.values(initialSubjects).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Overall Performance Score" value={score.toFixed(2)} icon={<GraduationCap size={24} className="text-white"/>} color="bg-green-500" />
                <StatCard title="Overall Attendance" value={`${attendance.toFixed(2)}%`} icon={<UserCheck size={24} className="text-white"/>} color="bg-yellow-500" />
                <StatCard title="Direct Reports" value={directReports.length} icon={<UsersIcon size={24} className="text-white"/>} color="bg-blue-500" />
            </div>
            
            {user.role === 'Mentor' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="font-bold text-lg mb-4 text-gray-700">Detailed Assessment Scores</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Subject</th><th scope="col" className="px-4 py-3">Type</th><th scope="col" className="px-4 py-3">#</th><th scope="col" className="px-4 py-3">Score</th></tr></thead>
                                <tbody>
                                    {mentorScores.filter(s => s.mentorId === userId).map(s => (<tr key={s.scoreId} className="bg-white border-b"><td className="px-4 py-4 font-medium">{initialSubjects[s.subjectId]?.name}</td><td className="px-4 py-4">{s.type}</td><td className="px-4 py-4">{s.assessmentNumber}</td><td className="px-4 py-4 font-bold">{s.score}</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                     <Card>
                        <h3 className="font-bold text-lg mb-4 text-gray-700">Daily Attendance Log</h3>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-4 py-3">Date</th><th scope="col" className="px-4 py-3">Status</th><th scope="col" className="px-4 py-3">Recorded By</th></tr></thead>
                                <tbody>
                                    {dailyAttendance.filter(a => a.mentorId === userId).map(a => (<tr key={a.attendanceId} className="bg-white border-b"><td className="px-4 py-4 font-medium">{a.date}</td><td className="px-4 py-4"><span className={getAttendanceStatusPill(a.status)}>{a.status}</span></td><td className="px-4 py-4">{allUsers[a.recordedBy]?.name || 'N/A'}</td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {teamPerformanceData.length > 0 && (
                <Card>
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Team Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Role</th><th scope="col" className="px-6 py-3">Performance Score</th><th scope="col" className="px-6 py-3">Attendance</th></tr></thead>
                            <tbody>
                                {teamPerformanceData.map(p => (<tr key={p.id} className="bg-white border-b hover:bg-gray-50"><td className="px-6 py-4 font-medium text-indigo-600 hover:underline cursor-pointer" onClick={() => setView({ page: 'userProfile', context: { userId: p.id }})}>{p.name}</td><td className="px-6 py-4">{ROLES[p.role]?.name}</td><td className="px-6 py-4 font-bold">{p.score.toFixed(2)}</td><td className="px-6 py-4 font-bold">{p.attendance.toFixed(2)}%</td></tr>))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default UserProfilePage;
