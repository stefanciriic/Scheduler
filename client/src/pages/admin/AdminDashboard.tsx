import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/application.store";
import { fetchAllUsers, deleteUser, createUserByAdmin, CreateUserRequest, updateUser } from "../../services/admin.service";
import { fetchAllBusinesses, deleteBusiness } from "../../services/business.service";
import { fetchAllEmployees, deleteEmployee, createEmployee } from "../../services/employee.service";
import { Business } from "../../models/business.model";
import { User, UserRole } from "../../models/user.model";
import { Employee } from "../../models/employee.model";
import handleApiError from "../../utils/handleApiError";
import Toast from "../../utils/toast";
import ConfirmModal from "../../components/shared/ConfirmModal";
import UsersTable from "../../components/admin/UsersTable";
import BusinessesList from "../../components/admin/BusinessesList";
import EmployeesTable from "../../components/admin/EmployeesTable";
import CreateUserModal from "../../components/admin/CreateUserModal";
import EditUserModal from "../../components/admin/EditUserModal";

interface CreateUserForm {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: UserRole;
  businessId?: number;
}


const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'businesses' | 'employees'>('users');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showDeleteEmployeeModal, setShowDeleteEmployeeModal] = useState(false);
  const [showDeleteBusinessModal, setShowDeleteBusinessModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<number | null>(null);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: 'USER',
    businessId: undefined
  });
  const [editUserForm, setEditUserForm] = useState<User | null>(null);
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
      Toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (userToEdit: User) => {
    setEditUserForm(userToEdit);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editUserForm) return;

    try {
      // Validate form
      if (!editUserForm.firstName || !editUserForm.lastName || !editUserForm.username) {
        Toast.error("All fields are required");
        return;
      }

      // Update user via service
      await updateUser(editUserForm);
      
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

      setShowEditUserModal(false);
      setEditUserForm(null);
      Toast.success("User updated successfully!");
    } catch (err: unknown) {
      Toast.error(handleApiError(err));
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete === null) return;

    try {
      await deleteUser(userToDelete);
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      setShowDeleteUserModal(false);
      setUserToDelete(null);
      Toast.success("User deleted successfully!");
    } catch (err: unknown) {
      Toast.error(handleApiError(err));
      setShowDeleteUserModal(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteEmployee = async () => {
    if (employeeToDelete === null) return;

    try {
      await deleteEmployee(employeeToDelete);
      setEmployees(prev => prev.filter(e => e.id !== employeeToDelete));
      setShowDeleteEmployeeModal(false);
      setEmployeeToDelete(null);
      Toast.success("Employee deleted successfully!");
    } catch (err: unknown) {
      Toast.error(handleApiError(err));
      setShowDeleteEmployeeModal(false);
      setEmployeeToDelete(null);
    }
  };

  const handleDeleteBusiness = async () => {
    if (businessToDelete === null) return;

    try {
      await deleteBusiness(businessToDelete);
      setBusinesses(prev => prev.filter(b => b.id !== businessToDelete));
      setShowDeleteBusinessModal(false);
      setBusinessToDelete(null);
      Toast.success("Business and all related data deleted successfully!");
    } catch (err: unknown) {
      Toast.error(handleApiError(err));
      setShowDeleteBusinessModal(false);
      setBusinessToDelete(null);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validate form
      if (!createUserForm.firstName || !createUserForm.lastName || !createUserForm.username || !createUserForm.password) {
        Toast.error("All fields are required");
        return;
      }

      if (createUserForm.role === 'EMPLOYEE' && !createUserForm.businessId) {
        Toast.error("Business selection is required for Employee role");
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
      Toast.success("User created successfully!");
    } catch (err: unknown) {
      Toast.error(handleApiError(err));
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
        <UsersTable
          users={users}
          currentUserId={user?.id}
          onEdit={handleOpenEditModal}
          onDelete={(userId) => {
            setUserToDelete(userId);
            setShowDeleteUserModal(true);
          }}
        />
      )}

      {/* Businesses Tab */}
      {activeTab === 'businesses' && (
        <BusinessesList 
          businesses={businesses}
          onDelete={(businessId) => {
            setBusinessToDelete(businessId);
            setShowDeleteBusinessModal(true);
          }}
        />
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <EmployeesTable
          employees={employees}
          onDelete={(employeeId) => {
            setEmployeeToDelete(employeeId);
            setShowDeleteEmployeeModal(true);
          }}
        />
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

      {/* Delete Business Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteBusinessModal}
        title="Delete Business"
        message="Are you sure you want to delete this business? This will permanently delete the business and ALL related data including employees, services, and appointments. This action cannot be undone."
        confirmText="Delete Everything"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleDeleteBusiness}
        onCancel={() => {
          setShowDeleteBusinessModal(false);
          setBusinessToDelete(null);
        }}
      />

      {/* Edit User Modal */}
      {showEditUserModal && editUserForm && (
        <EditUserModal
          user={editUserForm}
          onSave={handleUpdateUser}
          onCancel={() => {
            setShowEditUserModal(false);
            setEditUserForm(null);
          }}
          onUserChange={setEditUserForm}
        />
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <CreateUserModal
          formData={createUserForm}
          businesses={businesses}
          onSave={handleCreateUser}
          onCancel={() => {
            setShowCreateUserModal(false);
            setCreateUserForm({
              firstName: '',
              lastName: '',
              username: '',
              password: '',
              role: 'USER',
              businessId: undefined
            });
          }}
          onChange={setCreateUserForm}
        />
      )}
    </div>
  );
};

export default AdminDashboard;