import React, { useEffect, useState } from "react";
import { Business } from "../models/business.model";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/application.store";
import { fetchBusinessesByOwnerId } from "../services/business.service";

interface Employee {
  id: number;
  name: string;
  position: string;
  businessId: number;
}

const EmployeesManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    businessId: 0,
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchEmployees();
    }
  }, [selectedBusinessId]);

  const fetchBusinesses = async () => {
    if (!user?.id) return;
    
    try {
      const data = await fetchBusinessesByOwnerId(user.id);
      setBusinesses(data);
      
      // Auto-select first business if available
      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch businesses", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!selectedBusinessId) return;
    
    try {
      const response = await axiosInstance.get<Employee[]>(`/api/employees/business/${selectedBusinessId}`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // Update existing employee
        await axiosInstance.put(`/api/employees/${editingEmployee.id}`, formData);
      } else {
        // Create new employee
        await axiosInstance.post("/api/employees", formData);
      }
      fetchEmployees();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save employee", error);
      alert("Failed to save employee. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    
    try {
      await axiosInstance.delete(`/api/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      console.error("Failed to delete employee", error);
      alert("Failed to delete employee. Please try again.");
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      businessId: employee.businessId,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      name: "",
      position: "",
      businessId: selectedBusinessId || 0,
    });
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      position: "",
      businessId: selectedBusinessId || 0,
    });
    setShowModal(true);
  };

  if (loading) return <p>Loading...</p>;

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Employees Management</h1>
        <p className="text-gray-600">You don't have any businesses yet. Please create a business first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees Management</h1>
        <button
          onClick={handleOpenModal}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
          disabled={!selectedBusinessId}
        >
          Add New Employee
        </button>
      </div>

      {/* Business Selector */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-semibold">Select Business:</label>
        <select
          value={selectedBusinessId || ""}
          onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
          className="w-full md:w-1/3 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
      </div>

      {/* Employees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{employee.name}</h3>
            <p className="text-gray-600 mb-4">{employee.position}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(employee)}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(employee.id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-[500px] shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Business</label>
                <select
                  value={formData.businessId}
                  onChange={(e) => setFormData({ ...formData, businessId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                  required
                >
                  <option value={0} disabled>Select a business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Employee Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-green-300"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
                >
                  {editingEmployee ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesManagementPage;
