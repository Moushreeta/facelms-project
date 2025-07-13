
import React, { useState } from 'react';
import { User, Users, PendingChange } from '../types';
import { ROLES } from '../constants';
import { Card } from './ui';
import { Edit } from 'lucide-react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

interface UserManagementProps {
    allUsers: Users;
    loggedInUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ allUsers, loggedInUser }) => {
    
    const handleProposeEdit = async (userToEdit: User) => {
        const fieldToChange = 'campus'; // Example field
        const newValue = prompt(`Propose new ${fieldToChange} for ${userToEdit.name}:`, userToEdit[fieldToChange] || "");
        if (newValue && newValue !== userToEdit[fieldToChange]) {
            if (!userToEdit.smeId || !allUsers[userToEdit.smeId]) {
                alert("Cannot propose change. The mentor's assigned SME is invalid or not found.");
                return;
            }
            const newChange = {
                changeId: `c${Date.now()}`,
                proposedBy: loggedInUser.id,
                mentorId: userToEdit.id,
                fieldToChange,
                oldValue: userToEdit[fieldToChange] || "N/A",
                newValue,
                status: 'pending' as 'pending',
                smeId: userToEdit.smeId
            };
            try {
                await addDoc(collection(db, 'pendingChanges'), newChange);
                alert(`Change proposal for ${userToEdit.name} has been sent to ${allUsers[userToEdit.smeId].name} for approval.`);
            } catch (error) {
                console.error("Error proposing change: ", error);
                alert("Failed to propose change. Please try again.");
            }
        }
    };
    
    const isLnd = loggedInUser.role === 'L&D Manager';

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                 <p className="text-sm text-gray-500">Add/remove users via the Firebase Console.</p>
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
                            {Object.values(allUsers).filter(u=>u.role !== 'Admin').sort((a,b)=>a.name.localeCompare(b.name)).map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{user.name}</td><td className="px-6 py-4">{user.employeeId}</td>
                                    <td className="px-6 py-4">{ROLES[user.role]?.name}</td><td className="px-6 py-4">{allUsers[user.reportsTo || '']?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{allUsers[user.smeId || '']?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        {isLnd && user.role === 'Mentor' && <button onClick={() => handleProposeEdit(user)} className="font-medium text-blue-600 hover:text-blue-900 inline-flex items-center p-1 rounded-md hover:bg-blue-50"><Edit className="w-4 h-4 mr-1"/>Propose Edit</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default UserManagement;
