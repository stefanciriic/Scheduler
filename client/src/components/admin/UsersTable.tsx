import React from 'react';
import { User } from '../../models/user.model';

interface UsersTableProps {
  users: User[];
  currentUserId?: number;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  currentUserId,
  onEdit,
  onDelete 
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((userItem) => (
            <tr key={userItem.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {userItem.firstName.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {userItem.firstName} {userItem.lastName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {userItem.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  userItem.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  userItem.role === 'BUSINESS_OWNER' ? 'bg-blue-100 text-blue-800' :
                  userItem.role === 'EMPLOYEE' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {userItem.role || 'USER'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(userItem)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                {userItem.id !== currentUserId && (
                  <button
                    onClick={() => onDelete(userItem.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                )}
                {userItem.id === currentUserId && (
                  <span className="text-gray-400 text-sm italic">
                    (You)
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;