
import React, { useState, useMemo } from 'react';
import { User, Users, MentorScore, DailyAttendance, AttendanceStatus } from '../types';
import { initialSubjects } from '../constants';
import { Card } from './ui';

interface ScoreEntryPageProps {
  allUsers: Users;
  setMentorScores: React.Dispatch<React.SetStateAction<MentorScore[]>>;
}

export const ScoreEntryPage: React.FC<ScoreEntryPageProps> = ({ allUsers, setMentorScores }) => {
    const [formData, setFormData] = useState({ mentorId: '', subjectId: '', module: '1', type: 'Test' as 'Test' | 'Viva' | 'Presentation', assessmentNumber: '1', score: '' });
    const [successMessage, setSuccessMessage] = useState('');

    const mentors = useMemo(() => Object.values(allUsers).filter(u => u.role === 'Mentor').sort((a,b) => a.name.localeCompare(b.name)), [allUsers]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { mentorId, subjectId, module, type, assessmentNumber, score } = formData;
        if (!mentorId || !subjectId || !score || !assessmentNumber) { alert("Please fill all fields."); return; }
        
        const newScore: MentorScore = {
            scoreId: `s${Date.now()}`, mentorId, subjectId, module: parseInt(module), type, assessmentNumber: parseInt(assessmentNumber),
            score: parseFloat(score)
        };
        
        setMentorScores(prevScores => [...prevScores, newScore]);
        setSuccessMessage(`Successfully recorded score for ${allUsers[mentorId].name}.`);
        setFormData({ mentorId: '', subjectId: '', module: '1', type: 'Test', assessmentNumber: '1', score: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value });
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Record ToM Scores</h2>
                {successMessage && <div className="bg-green-100 border border-green-200 text-green-700 p-3 rounded-md mb-4 animate-pulse-fade-out">{successMessage}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Mentor</label><select name="mentorId" value={formData.mentorId} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option value="">Select a Mentor...</option>{mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                     <div><label className="block text-sm font-medium text-gray-700">Subject</label><select name="subjectId" value={formData.subjectId} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option value="">Select a Subject...</option>{Object.values(initialSubjects).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Module Number</label><input type="number" name="module" value={formData.module} onChange={handleChange} min="1" max="5" required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                         <div><label className="block text-sm font-medium text-gray-700">Assessment Type</label><select name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option>Test</option><option>Viva</option><option>Presentation</option></select></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700">Assessment Number</label><input type="number" name="assessmentNumber" value={formData.assessmentNumber} onChange={handleChange} min="1" required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Score (0-100)</label><input type="number" name="score" value={formData.score} onChange={handleChange} min="0" max="100" step="0.1" required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                    </div>
                    <div className="pt-4"><button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Submit Record</button></div>
                </form>
            </Card>
        </div>
    );
};

interface DailyAttendancePageProps {
  allUsers: Users;
  dailyAttendance: DailyAttendance[];
  setDailyAttendance: React.Dispatch<React.SetStateAction<DailyAttendance[]>>;
  currentUser: User;
}

export const DailyAttendancePage: React.FC<DailyAttendancePageProps> = ({ allUsers, dailyAttendance, setDailyAttendance, currentUser }) => {
    const today = new Date().toISOString().slice(0, 10);
    const mentorsInScope = useMemo(() => Object.values(allUsers).filter(u => u.role === 'Mentor' && u.smeId === currentUser.id).sort((a,b) => a.name.localeCompare(b.name)), [allUsers, currentUser.id]);

    const handleMarkAttendance = (mentorId: string, status: AttendanceStatus) => {
        setDailyAttendance(prev => {
            const existingRecord = prev.find(a => a.mentorId === mentorId && a.date === today);
            if (existingRecord) {
                return prev.map(a => a.attendanceId === existingRecord.attendanceId ? { ...a, status } : a);
            } else {
                return [...prev, { attendanceId: `a${Date.now()}`, mentorId, date: today, status, recordedBy: currentUser.id }];
            }
        });
    };

    const getStatusClasses = (status?: AttendanceStatus): string => {
        switch (status) {
            case 'Present': return 'bg-green-500 hover:bg-green-600 text-white';
            case 'Absent': return 'bg-red-500 hover:bg-red-600 text-white';
            case 'Leave': return 'bg-blue-500 hover:bg-blue-600 text-white';
            case 'Not Applicable': return 'bg-gray-500 hover:bg-gray-600 text-white';
            default: return 'bg-gray-200 hover:bg-gray-300';
        }
    }
    
    const attendanceOptions: AttendanceStatus[] = ['Present', 'Absent', 'Leave', 'Not Applicable'];

    return (
        <Card className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Mentor Attendance</h2>
            <p className="text-gray-500 mb-6">Date: {today}</p>
            <div className="space-y-3">
                {mentorsInScope.map(mentor => {
                    const attendanceRecord = dailyAttendance.find(a => a.mentorId === mentor.id && a.date === today);
                    return (
                        <div key={mentor.id} className="flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-50 rounded-lg transition-shadow hover:shadow-md">
                            <p className="font-medium text-gray-800 mb-2 sm:mb-0">{mentor.name} <span className="text-gray-400 font-normal">({mentor.campus})</span></p>
                            <div className="flex space-x-2">
                                {attendanceOptions.map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => handleMarkAttendance(mentor.id, status)} 
                                        className={`px-3 py-1 text-sm rounded-full transition-all duration-200 transform hover:scale-105 ${attendanceRecord?.status === status ? getStatusClasses(status) : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
             {mentorsInScope.length === 0 && <p className="text-center text-gray-500 py-8">You are not assigned as an SME for any mentors.</p>}
        </Card>
    );
};
