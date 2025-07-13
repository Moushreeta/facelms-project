
import React, { useState, useMemo } from 'react';
import { User, Users, RoleName, PendingChange } from '../types';
import { ROLES, initialSubjects } from '../constants';
import { Card, Modal } from './ui';
import { UserPlus, KeyRound, Edit } from 'lucide-react';

interface UserManagementProps {
    allUsers: Users;
    setUsers: React.Dispatch<React.SetStateAction<Users>>;
    loggedInUser: User;
    setPendingChanges: React.Dispatch<React.SetStateAction<PendingChange[]>>;
}

const UserManagement: React.FC<UserManagementProps> = ({ allUsers, setUsers, loggedInUser, setPendingChanges }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const emptyUser = { id: '', employeeId: '', name: '', role: 'Mentor' as RoleName, password: '', reportsTo: '', smeId: '' };
    const [newUser, setNewUser] = useState<Omit<User, 'id'> & { password?: string }> (emptyUser);
    
    const handleResetPassword = (userToReset: User) => {
        const newPassword = prompt(`Enter new password for ${userToReset.name}:`);
        if (newPassword && newPassword.length >= 6) { 
            setUsers(prev => ({ ...prev, [userToReset.id]: { ...userToReset, password: newPassword } })); 
            alert(`Password for ${userToReset.name} has been updated.`); 
        } else if (newPassword) { 
            alert("Password must be at least 6 characters long."); 
        }
    };

    const handleProposeEdit = (userToEdit: User) => {
        const fieldToChange = 'campus'; // Example field
        const newValue = prompt(`Propose new ${fieldToChange} for ${userToEdit.name}:`, userToEdit[fieldToChange] || "");
        if (newValue && newValue !== userToEdit[fieldToChange]) {
            if (!userToEdit.smeId || !allUsers[userToEdit.smeId]) {
                alert("Cannot propose change. The mentor's assigned SME is invalid or not found.");
                return;
            }
            const newChange: PendingChange = {
                changeId: `c${Date.now()}`,
                proposedBy: loggedInUser.id,
                mentorId: userToEdit.id,
                fieldToChange,
                oldValue: userToEdit[fieldToChange] || "N/A",
                newValue,
                status: 'pending',
                smeId: userToEdit.smeId
            };
            setPendingChanges(prev => [...prev, newChange]);
            alert(`Change proposal for ${userToEdit.name} has been sent to ${allUsers[userToEdit.smeId].name} for approval.`);
        }
    };
    
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const id = `user-${Date.now()}`;
        if (!newUser.employeeId || !newUser.name || !newUser.password || !newUser.role || !newUser.reportsTo || !newUser.smeId) { 
            alert("Please fill all required fields."); 
            return; 
        }
        setUsers(prev => ({ ...prev, [id]: { ...newUser, id } }));
        setIsModalOpen(false);
        setNewUser(emptyUser);
    };

    const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setNewUser({...newUser, [e.target.name]: e.target.value});
    };

    const potentialManagers = Object.values(allUsers).filter(u => u.id !== 'admin' && ROLES[u.role]?.level < ROLES[newUser.role as RoleName]?.level).sort((a,b) => a.name.localeCompare(b.name));
    const smes = Object.values(allUsers).filter(u => u.role === 'SME').sort((a,b) => a.name.localeCompare(b.name));
    const isAdmin = loggedInUser.role === 'Admin';
    const isLnd = loggedInUser.role === 'L&D Manager';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus size={20} className="mr-2" /> Add New User
                </button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Name</th><th className="px-6 py-3">Employee ID</th>
                                <th className="px-6 py-3">Role</th><th className="px-6 py-3">Reports To</th>
                                <th className="px-6 py-3">SME</th><th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(allUsers).filter(u=>u.id !== 'admin').sort((a,b)=>a.name.localeCompare(b.name)).map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{user.name}</td><td className="px-6 py-4">{user.employeeId}</td>
                                    <td className="px-6 py-4">{ROLES[user.role]?.name}</td><td className="px-6 py-4">{allUsers[user.reportsTo || '']?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{allUsers[user.smeId || '']?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        {isLnd && user.role === 'Mentor' && <button onClick={() => handleProposeEdit(user)} className="font-medium text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded-md hover:bg-blue-50"><Edit className="w-4 h-4 mr-1"/>Propose Edit</button>}
                                        {isAdmin && <button onClick={() => handleResetPassword(user)} className="font-medium text-red-600 hover:text-red-900 inline-flex items-center p-1 rounded-md hover:bg-red-50"><KeyRound className="w-4 h-4 mr-1"/>Reset Password</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
                 <form onSubmit={handleAddUser} className="space-y-4">
                    <input name="name" value={newUser.name} onChange={handleNewUserChange} placeholder="Full Name" required className="w-full p-2 border border-gray-300 rounded-md" />
                    <input name="employeeId" value={newUser.employeeId} onChange={handleNewUserChange} placeholder="Employee ID" required className="w-full p-2 border border-gray-300 rounded-md" />
                    <input name="password" type="password" value={newUser.password} onChange={handleNewUserChange} placeholder="Password" required className="w-full p-2 border border-gray-300 rounded-md" />
                    <select name="role" value={newUser.role} onChange={handleNewUserChange} className="w-full p-2 border border-gray-300 rounded-md">{Object.entries(ROLES).filter(([k,v])=>v.level>0).map(([key, val]) => <option key={key} value={key}>{val.name}</option>)}</select>
                    <select name="reportsTo" value={newUser.reportsTo} onChange={handleNewUserChange} required className="w-full p-2 border border-gray-300 rounded-md"><option value="">Select Manager...</option>{potentialManagers.map(u => <option key={u.id} value={u.id}>{u.name} ({ROLES[u.role].name})</option>)}</select>
                    <select name="smeId" value={newUser.smeId} onChange={handleNewUserChange} required className="w-full p-2 border border-gray-300 rounded-md"><option value="">Select SME...</option>{smes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add User</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagement;
