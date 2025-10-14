import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/application.store";
import { fetchAllUsers, deleteUser, createUserByAdmin, CreateUserRequest, updateUser, UpdateUserRequest } from "../services/admin.service";
import { fetchAllBusinesses } from "../services/business.service";
import { fetchAllEmployees, deleteEmployee, createEmployee } from "../services/employee.service";
import { Business } from "../models/business.model";
import { User, UserRole } from "../models/user.model";
import { Employee } from "../models/employee.model";
import handleApiError from "../utils/handleApiError";
import ConfirmModal from "../components/shared/ConfirmModal";

interface CreateUserForm {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: UserRole;
  businessId?: number;
}

interface EditUserForm {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: UserRole;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'businesses' | 'employees'>('users');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: 'USER',
    businessId: undefined
  });
  const [editUserForm, setEditUserForm] = useState<EditUserForm | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, businessesData, employeesData] = await Promise.all([
        fetchAllUsers(),
        fetchAllBusinesses(),
        fetchAllEmployees()
      ]);
      setUsers(usersData);
      setBusinesses(businessesData);
      setEmployees(employeesData);
    } catch (err: unknown) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (userToEdit: User) => {
    setEditUserForm({
      id: userToEdit.id,
      firstName: userToEdit.firstName,
      lastName: userToEdit.lastName,
      username: userToEdit.username,
      role: userToEdit.role as UserRole
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editUserForm) return;

    try {
      // Validate form
      if (!editUserForm.firstName || !editUserForm.lastName || !editUserForm.username) {
        setError("All fields are required");
        return;
      }

      // Update user via service
      const updateData: UpdateUserRequest = {
        id: editUserForm.id,
        firstName: editUserForm.firstName,
        lastName: editUserForm.lastName,
        username: editUserForm.username,
        role: editUserForm.role
      };

      await updateUser(updateData);
      
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === editUserForm.id ? { 
          ...u, 
          firstName: editUserForm.firstName,
          lastName: editUserForm.lastName,
          username: editUserForm.username,
          role: editUserForm.role 
        } : u
      ));

      // Close modal and reset form
      setShowEditUserModal(false);
      setEditUserForm(null);
      setError(null);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete === null) return;

    try {
      await deleteUser(userToDelete);
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      setShowDeleteUserModal(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const handleDeleteEmployee = async () => {
    if (employeeToDelete === null) return;

    try {
      await deleteEmployee(employeeToDelete);
      setEmployees(prev => prev.filter(e => e.id !== employeeToDelete));
      setShowDeleteEmployeeModal(false);
      setEmployeeToDelete(null);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validate form
      if (!createUserForm.firstName || !createUserForm.lastName || !createUserForm.username || !createUserForm.password) {
        setError("All fields are required");
        return;
      }

      if (createUserForm.role === 'EMPLOYEE' && !createUserForm.businessId) {
        setError("Business selection is required for Employee role");
        return;
      }

      // Create user via service
      const userData: CreateUserRequest = {
        firstName: createUserForm.firstName,
        lastName: createUserForm.lastName,
        username: createUserForm.username,
        password: createUserForm.password,
        role: createUserForm.role,
      };

      const newUser = await createUserByAdmin(userData);

      // If role is EMPLOYEE, create employee record linked to the user
      if (createUserForm.role === 'EMPLOYEE' && createUserForm.businessId) {
        const employeeData: Employee = {
          id: 0, // Will be assigned by backend
          name: `${createUserForm.firstName} ${createUserForm.lastName}`,
          position: 'Employee',
          businessId: createUserForm.businessId,
          userId: newUser.id,  // Link to the created user
        };
        
        await createEmployee(employeeData);
      }

      // Refresh data
      await fetchData();
      
      // Reset form and close modal
      setCreateUserForm({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        role: 'USER',
        businessId: undefined
      });
      setShowCreateUserModal(false);
      setError(null);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto py-8">Loading admin dashboard...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setShowCreateUserModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
        >
          + Create User
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'businesses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Businesses ({businesses.length})
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Employees ({employees.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
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
                      onClick={() => handleOpenEditModal(userItem)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {userItem.id !== user?.id && (
                      <button
                        onClick={() => {
                          setUserToDelete(userItem.id);
                          setShowDeleteUserModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                    {userItem.id === user?.id && (
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
      )}

      {/* Businesses Tab */}
      {activeTab === 'businesses' && (
        <div className="grid gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {business.name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Address:</strong> {business.address}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>City:</strong> {business.city}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Working Hours:</strong> {business.workingHours}
                  </p>
                  <p className="text-gray-600 mb-3">
                    <strong>Description:</strong> {business.description}
                  </p>
                </div>
                {business.imageUrl && (
                  <img
                    src={business.imageUrl}
                    alt={business.name}
                    className="w-24 h-24 object-cover rounded-md ml-4"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.businessId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEmployeeToDelete(employee.id);
                        setShowDeleteEmployeeModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No employees found
            </div>
          )}
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteUserModal}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteUserModal(false);
          setUserToDelete(null);
        }}
      />

      {/* Delete Employee Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteEmployeeModal}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleDeleteEmployee}
        onCancel={() => {
          setShowDeleteEmployeeModal(false);
          setEmployeeToDelete(null);
        }}
      />

      {/* Edit User Modal */}
      {showEditUserModal && editUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={editUserForm.firstName}
                  onChange={(e) => setEditUserForm(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editUserForm.lastName}
                  onChange={(e) => setEditUserForm(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm(prev => prev ? { ...prev, username: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm(prev => prev ? { 
                    ...prev, 
                    role: e.target.value as UserRole
                  } : null)}
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
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditUserForm(null);
                  setError(null);
                }}
                className="px-4 py-2 rounded text-gray-800 bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateUser}
                className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 transition"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={createUserForm.firstName}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={createUserForm.lastName}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={createUserForm.username}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={createUserForm.role}
                  onChange={(e) => setCreateUserForm(prev => ({ 
                    ...prev, 
                    role: e.target.value as UserRole,
                    businessId: e.target.value === 'EMPLOYEE' ? prev.businessId : undefined
                  }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="USER">Customer</option>
                  <option value="BUSINESS_OWNER">Business Owner</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {createUserForm.role === 'EMPLOYEE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
                  <select
                    value={createUserForm.businessId || ''}
                    onChange={(e) => setCreateUserForm(prev => ({ 
                      ...prev, 
                      businessId: e.target.value ? Number(e.target.value) : undefined 
                    }))}
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
                onClick={() => {
                  setShowCreateUserModal(false);
                  setCreateUserForm({
                    firstName: '',
                    lastName: '',
                    username: '',
                    password: '',
                    role: 'USER',
                    businessId: undefined
                  });
                  setError(null);
                }}
                className="px-4 py-2 rounded text-gray-800 bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600 transition"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;