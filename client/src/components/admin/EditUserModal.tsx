import React from 'react';
import { User, UserRole } from '../../models/user.model';

interface EditUserModalProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
  onUserChange: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onSave,
  onCancel,
  onUserChange
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit User</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={user.firstName}
              onChange={(e) => onUserChange({ ...user, firstName: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={user.lastName}
              onChange={(e) => onUserChange({ ...user, lastName: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => onUserChange({ ...user, username: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={user.role}
              onChange={(e) => onUserChange({ ...user, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="USER">Customer</option>
              <option value="BUSINESS_OWNER">Business Owner</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded text-gray-800 bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(user)}
            className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition"
          >
            Update User
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;