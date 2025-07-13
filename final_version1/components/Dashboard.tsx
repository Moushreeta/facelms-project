
import React, { useMemo, useState } from 'react';
import { User, Users, View, MentorScore, DailyAttendance, PendingChange, RoleName, Subjects } from '../types';
import { Card, StatCard } from './ui';
import { ROLES } from '../constants';
import { calculatePerformance, calculateAttendance } from '../services/performanceService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GraduationCap, UserCheck, Users as UsersIcon, Bell, CheckCircle, XIcon } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';


interface ApprovalRequestsProps {
    pendingChanges: PendingChange[];
    onApprove: (changeId: string, approved: boolean) => void;
    allUsers: Users;
}

const ApprovalRequests: React.FC<ApprovalRequestsProps> = ({ pendingChanges, onApprove, allUsers }) => {
    const pending = pendingChanges.filter(c => c.status === 'pending');
    if (pending.length === 0) return null;

    return (
        <Card className="border-l-4 border-yellow-400 bg-yellow-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Bell className="w-5 h-5 mr-2 text-yellow-600" />Pending Approval Requests</h3>
            <div className="space-y-3">
                {pending.map(change => (
                    <div key={change.changeId} className="p-3 bg-white rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                            <strong className="text-gray-900">{allUsers[change.proposedBy]?.name}</strong> wants to change
                            <strong className="text-gray-900 mx-1">{allUsers[change.mentorId]?.name}'s</strong>
                            <strong className="text-gray-900 mx-1 capitalize">{change.fieldToChange}</strong> from
                            <em className="text-red-600 mx-1">"{change.oldValue}"</em> to <em className="text-green-600 mx-1">"{change.newValue}"</em>.
                        </p>
                        <div className="flex space-x-2 self-end sm:self-center">
                            <button onClick={() => onApprove(change.id, true)} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><CheckCircle size={20}/></button>
                            <button onClick={() => onApprove(change.id, false)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><XIcon size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

interface DashboardProps {
    currentUser: User;
    allUsers: Users;
    subjects: Subjects;
    setView: (view: View) => void;
    mentorScores: MentorScore[];
    dailyAttendance: DailyAttendance[];
    pendingChanges: PendingChange[];
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, allUsers, subjects, setView, mentorScores, dailyAttendance, pendingChanges }) => {
    const [selectedSubject, setSelectedSubject] = useState('All');
    
    const getSubordinates = (userId: string, users: Users): User[] => {
        let subs: User[] = [];
        const directReports = Object.values(users).filter(u => u.reportsTo === userId);
        for (const report of directReports) {
            subs.push(report);
            const deeperSubs = getSubordinates(report.id, users);
            subs = subs.concat(deeperSubs);
        }
        return subs;
    };
    
    const usersInScope = useMemo(() => {
        if (currentUser.role === 'Admin' || currentUser.role === 'CEO') {
            return Object.values(allUsers).filter(u => u.id !== 'admin');
        }
        if (currentUser.role === 'SME') {
            return [currentUser, ...Object.values(allUsers).filter(u => u.smeId === currentUser.id && u.role === 'Mentor')];
        }
        const subordinateUsers = getSubordinates(currentUser.id, allUsers);
        return [currentUser, ...subordinateUsers];
    }, [currentUser, allUsers]);

    const performanceData = useMemo(() => {
        return usersInScope
        .filter(u => u.id !== currentUser.id)
        .map(u => ({ 
            ...u, 
            score: calculatePerformance(u.id, allUsers, mentorScores, selectedSubject).score,
            attendance: calculateAttendance(u.id, allUsers, dailyAttendance).attendance
        })).sort((a, b) => (ROLES[a.role as RoleName]?.level || 99) - (ROLES[b.role as RoleName]?.level || 99));
    }, [usersInScope, currentUser.id, allUsers, mentorScores, dailyAttendance, selectedSubject]);
    
    const directReports = useMemo(() => Object.values(allUsers).filter(u => u.reportsTo === currentUser.id), [currentUser.id, allUsers]);
    
    const chartData = useMemo(() => {
      const targetUsers = currentUser.role === "SME" 
        ? Object.values(allUsers).filter(u => u.smeId === currentUser.id)
        : directReports;
      
      return targetUsers.map(u => ({
        name: u.name,
        Performance: calculatePerformance(u.id, allUsers, mentorScores, selectedSubject).score,
        Attendance: calculateAttendance(u.id, allUsers, dailyAttendance).attendance,
      }));
    }, [currentUser, directReports, allUsers, mentorScores, dailyAttendance, selectedSubject]);

    const { score: overallPerformance } = useMemo(() => calculatePerformance(currentUser.id, allUsers, mentorScores, selectedSubject), [currentUser.id, allUsers, mentorScores, selectedSubject]);
    const { attendance: overallAttendance } = useMemo(() => calculateAttendance(currentUser.id, allUsers, dailyAttendance), [currentUser.id, allUsers, dailyAttendance]);
    
    const totalMentorsInScope = useMemo(() => usersInScope.filter(u => u.role === 'Mentor').length, [usersInScope]);
    const totalSubordinates = useMemo(() => getSubordinates(currentUser.id, allUsers).length, [currentUser.id, allUsers]);
    const isTopLevel = (ROLES[currentUser.role]?.level || 99) <= 1;

    const handleApproval = async (changeId: string, approved: boolean) => {
        const change = pendingChanges.find(c => c.id === changeId);
        if(!change) return;

        try {
            const batch = writeBatch(db);
            const changeRef = doc(db, 'pendingChanges', change.id);

            if (approved) {
                const userRef = doc(db, 'users', change.mentorId);
                batch.update(userRef, { [change.fieldToChange]: change.newValue });
            }
            
            batch.update(changeRef, { status: approved ? 'approved' : 'rejected' });
            await batch.commit();

        } catch (error) {
            console.error("Error handling approval: ", error);
            alert("Failed to process approval. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Performance Dashboard</h2>
              <div className="w-full sm:w-auto">
                  <label htmlFor="subjectFilter" className="sr-only">Filter by Subject</label>
                  <select id="subjectFilter" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="All">All Subjects</option>
                      {Object.values(subjects).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
              </div>
            </div>
            {currentUser.role === 'SME' && <ApprovalRequests pendingChanges={pendingChanges} onApprove={handleApproval} allUsers={allUsers} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={isTopLevel ? "Organization Avg. Score" : "Your Team Performance"} value={overallPerformance.toFixed(2)} icon={<GraduationCap size={24} className="text-white"/>} color="bg-green-500" />
                <StatCard title={isTopLevel ? "Organization Avg. Attendance" : "Your Team Attendance"} value={`${overallAttendance.toFixed(2)}%`} icon={<UserCheck size={24} className="text-white"/>} color="bg-yellow-500" />
                <StatCard title="Total Subordinates" value={currentUser.role === 'SME' ? 'N/A' : totalSubordinates} icon={<UsersIcon size={24} className="text-white"/>} color="bg-blue-500" />
                <StatCard title="Mentors in Scope" value={totalMentorsInScope} icon={<UsersIcon size={24} className="text-white"/>} color="bg-purple-500" />
            </div>

            {chartData.length > 0 && (
            <Card>
                <h3 className="font-bold text-lg mb-4 text-gray-700">Team Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Performance" fill="#4ade80" />
                        <Bar dataKey="Attendance" fill="#facc15" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            )}

            <Card>
                <h3 className="font-bold text-lg mb-4 text-gray-700">Detailed View</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr><th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Role</th><th scope="col" className="px-6 py-3">Reports To</th><th scope="col" className="px-6 py-3">Performance Score</th><th scope="col" className="px-6 py-3">Attendance</th></tr>
                        </thead>
                        <tbody>
                            {performanceData.map(p => (
                                <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-indigo-600 hover:underline cursor-pointer" onClick={() => setView({ page: 'userProfile', context: { userId: p.id }})}>{p.name}</td>
                                    <td className="px-6 py-4">{ROLES[p.role]?.name}</td>
                                    <td className="px-6 py-4">{allUsers[p.reportsTo || '']?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 font-bold">{p.score.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-bold">{p.attendance.toFixed(2)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {performanceData.length === 0 && <p className="text-center text-gray-500 py-8">No subordinates to display.</p>}
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;