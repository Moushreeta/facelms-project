import React, { useMemo } from 'react';
import { LogOut, Eye, XCircle, BarChart2, Users, Edit, UserCheck } from 'lucide-react';
import { User, Users as UsersType, PendingChange, ViewPage, View } from '../types';
import { ROLES } from '../constants';

interface HeaderProps {
  loggedInUser: User;
  currentUser: User;
  onLogout: () => void;
  setView: (view: View) => void;
  currentView: ViewPage;
  allUsers: UsersType;
  setViewAsUserId: (id: string | null) => void;
  pendingChanges: PendingChange[];
}

const Header: React.FC<HeaderProps> = ({ loggedInUser, currentUser, onLogout, setView, currentView, allUsers, setViewAsUserId, pendingChanges }) => {
    const canManageUsers = ['CEO', 'PM', 'SME', 'L&D Manager', 'Admin'].includes(loggedInUser.role);
    const isSME = loggedInUser.role === 'SME';
    const isAdmin = loggedInUser.role === 'Admin';
    const pendingApprovalCount = useMemo(() => pendingChanges.filter(c => c.smeId === loggedInUser.id && c.status === 'pending').length, [pendingChanges, loggedInUser.id]);

    const navItems = [
      { page: 'dashboard', label: 'Dashboard', icon: BarChart2, show: true, requiresSME: false, notification: isSME && pendingApprovalCount > 0 },
      { page: 'userManagement', label: 'User Management', icon: Users, show: canManageUsers, requiresSME: false },
      { page: 'scoreEntry', label: 'Record Scores', icon: Edit, show: isSME, requiresSME: true },
      { page: 'attendanceEntry', label: 'Daily Attendance', icon: UserCheck, show: isSME, requiresSME: true },
    ] as const;

    return (
        <>
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setView({ page: 'dashboard', context: {} })} className="text-xl font-bold text-indigo-600">
                                FACE Prep LMS
                            </button>
                            <nav className="hidden md:flex items-center space-x-1">
                                {navItems.map(item => item.show && (
                                    <button 
                                        key={item.page} 
                                        onClick={() => setView({ page: item.page, context: {} })} 
                                        className={`relative px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${currentView === item.page ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                        {item.notification && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs justify-center items-center">{pendingApprovalCount}</span></span>}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAdmin && (
                                <div className="relative">
                                    <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select 
                                        onChange={(e) => setViewAsUserId(e.target.value === 'admin' ? null : e.target.value)} 
                                        value={currentUser.id} 
                                        className="text-sm border-gray-300 rounded-md shadow-sm pl-9 pr-4 py-2 appearance-none focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value={loggedInUser.id}>View as Admin</option>
                                        {Object.values(allUsers).filter(u => u.id !== 'admin').sort((a,b) => a.name.localeCompare(b.name)).map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
                                    </select>
                                </div>
                            )}
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                                <p className="text-xs text-gray-500">{ROLES[currentUser.role]?.name || currentUser.role}</p>
                            </div>
                            <button onClick={onLogout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-500 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            {loggedInUser.id !== currentUser.id && (
                <div className="bg-yellow-100 text-yellow-800 text-center p-2 flex items-center justify-center shadow-inner sticky top-16 z-10">
                    <Eye className="w-5 h-5 mr-2"/> Viewing as <strong className="mx-1">{currentUser.name}</strong>.
                    <button onClick={() => setViewAsUserId(null)} className="ml-4 flex items-center text-sm font-bold text-yellow-900 hover:underline">
                        <XCircle className="w-4 h-4 mr-1"/> Return to Admin View
                    </button>
                </div>
            )}
        </>
    );
};

export default Header;