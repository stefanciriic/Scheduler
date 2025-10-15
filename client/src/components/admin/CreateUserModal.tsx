import React from 'react';
import { Business } from '../../models/business.model';
import { User, UserRole } from '../../models/user.model';

type CreateUserData = Omit<User, 'id' | 'token' | 'imageUrl' | 'role'> & {
  password: string;
  role: UserRole;
};

interface CreateUserModalProps {
  formData: CreateUserData;
  businesses: Business[];
  onSave: (data: CreateUserData) => void;
  onCancel: () => void;
  onChange: (data: CreateUserData) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  formData,
  businesses,
  onSave,
  onCancel,
  onChange
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New User</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onChange({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onChange({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => onChange({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => onChange({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => onChange({ 
                ...formData, 
                role: e.target.value as UserRole,
                businessId: e.target.value === 'EMPLOYEE' ? formData.businessId : undefined
              })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="USER">Customer</option>
              <option value="BUSINESS_OWNER">Business Owner</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {formData.role === 'EMPLOYEE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
              <select
                value={formData.businessId || ''}
                onChange={(e) => onChange({ 
                  ...formData, 
                  businessId: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="">Select a business</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            onClick={() => onSave(formData)}
            className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600 transition"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;