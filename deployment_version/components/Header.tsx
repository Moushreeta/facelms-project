import { useMemo } from 'react'; // 'React' removed for consistency
import { User, Users, View, PendingChange } from '../types';
// ===============================================
// THIS IS THE CORRECTED IMPORT LINE
// ===============================================
import { LogOut, BarChart2, Users as UsersIcon, Edit, UserCheck, Eye } from 'lucide-react'; 
import CompanyLogo from '../assets/face_normal.jpg';

interface HeaderProps {
  loggedInUser: User;
  currentUser: User;
  onLogout: () => void;
  setView: (view: View) => void;
  currentView: View['page'];
  allUsers: Users;
  setViewAsUserId: (id: string | null) => void;
  pendingChanges: PendingChange[];
}

const Header: React.FC<HeaderProps> = ({ loggedInUser, currentUser, onLogout, setView, currentView, allUsers, setViewAsUserId, pendingChanges }) => {
    const isSME = loggedInUser.role === 'SME';
    const canManageUsers = ['Admin', 'CEO', 'PM', 'L&D Manager'].includes(loggedInUser.role);
    const pendingApprovalCount = useMemo(() => pendingChanges.filter(c => c.smeId === loggedInUser.id && c.status === 'pending').length, [pendingChanges, loggedInUser.id]);

    const navItems = [
      { page: 'dashboard', label: 'Dashboard', icon: BarChart2, show: true, notification: isSME && pendingApprovalCount > 0 },
      { page: 'userManagement', label: 'User Management', icon: UsersIcon, show: canManageUsers, notification: false },
      { page: 'scoreEntry', label: 'Record Scores', icon: Edit, show: isSME, notification: false },
      { page: 'attendanceEntry', label: 'Daily Attendance', icon: UserCheck, show: isSME, notification: false },
    ] as const;

    return (
        <header className="bg-gray-800 text-white shadow-md">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <img src={CompanyLogo} alt="Company Logo" className="h-8 w-auto" />
                    </div>

                    <nav className="hidden md:flex md:space-x-4">
                        {navItems.map(item => item.show && (
                            <button
                                key={item.page}
                                onClick={() => setView({ page: item.page, context: {} })}
                                className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${currentView === item.page ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
                            >
                                <item.icon className="h-5 w-5 mr-2" />
                                {item.label}
                                {item.notification && <span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        {loggedInUser.role === 'Admin' && (
                            <div className="relative">
                                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    onChange={(e) => setViewAsUserId(e.target.value === loggedInUser.id ? null : e.target.value)}
                                    value={currentUser.id}
                                    className="text-sm bg-gray-700 border-gray-600 rounded-md shadow-sm pl-9 pr-4 py-2 appearance-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value={loggedInUser.id}>View as: {loggedInUser.name}</option>
                                    {Object.values(allUsers).filter(u => u.id !== loggedInUser.id).sort((a,b) => a.name.localeCompare(b.name)).map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <span className="text-sm hidden sm:block">Welcome, {currentUser.name}</span>
                        <button onClick={onLogout} className="flex items-center p-2 rounded-md hover:bg-gray-700 transition" aria-label="Logout">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;