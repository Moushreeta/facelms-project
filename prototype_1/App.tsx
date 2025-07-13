
import React, { useState, useMemo, useEffect } from 'react';
import { initialUsers, initialMentorScores, initialDailyAttendance, initialPendingChanges } from './constants';
import { User, Users, MentorScore, DailyAttendance, PendingChange, View } from './types';

import LoginPage from './components/LoginPage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UserProfilePage from './components/UserProfilePage';
import UserManagement from './components/UserManagement';
import { ScoreEntryPage, DailyAttendancePage } from './components/DataEntry';

function App() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [viewAsUserId, setViewAsUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // App-wide state for data
  const [users, setUsers] = useState<Users>(initialUsers);
  const [mentorScores, setMentorScores] = useState<MentorScore[]>(initialMentorScores);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>(initialDailyAttendance);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>(initialPendingChanges);
  
  const [view, setView] = useState<View>({ page: 'dashboard', context: {} });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = Object.values(users).find(u => u.employeeId === username && u.password === password);
    if (user) {
      setLoggedInUser(user);
    } else {
      setError('Invalid employee ID or password.');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setViewAsUserId(null);
    setView({ page: 'dashboard', context: {} });
    setUsername('');
    setPassword('');
    setError('');
  };

  // When viewAsUserId changes, reset the view to dashboard to avoid invalid contexts
  useEffect(() => {
    setView({ page: 'dashboard', context: {} });
  }, [viewAsUserId]);
  
  const currentUser = useMemo(() => {
    if (viewAsUserId && users[viewAsUserId]) {
      return users[viewAsUserId];
    }
    return loggedInUser;
  }, [viewAsUserId, loggedInUser, users]);

  const renderContent = () => {
    if (!currentUser) return null; // Should not happen if logged in
    switch (view.page) {
        case 'userProfile':
            return <UserProfilePage userId={view.context.userId!} allUsers={users} setView={setView} mentorScores={mentorScores} dailyAttendance={dailyAttendance} />;
        case 'userManagement':
            return <UserManagement allUsers={users} setUsers={setUsers} loggedInUser={loggedInUser!} setPendingChanges={setPendingChanges} />;
        case 'scoreEntry':
            return <ScoreEntryPage allUsers={users} setMentorScores={setMentorScores} />;
        case 'attendanceEntry':
            return <DailyAttendancePage allUsers={users} dailyAttendance={dailyAttendance} setDailyAttendance={setDailyAttendance} currentUser={currentUser} />;
        case 'dashboard':
        default:
            return <Dashboard currentUser={currentUser} allUsers={users} setView={setView} mentorScores={mentorScores} dailyAttendance={dailyAttendance} pendingChanges={pendingChanges} setPendingChanges={setPendingChanges} setUsers={setUsers} />;
    }
  }

  if (!loggedInUser || !currentUser) {
    return <LoginPage {...{ handleLogin, username, setUsername, password, setPassword, error }} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        loggedInUser={loggedInUser} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        setView={setView} 
        currentView={view.page} 
        allUsers={users} 
        setViewAsUserId={setViewAsUserId} 
        pendingChanges={pendingChanges}
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
