import React, { useEffect, useState } from "react";
import { ServiceType } from "../../../models/service.type";
import { Business } from "../../../models/business.model";
import { Employee } from "../../../models/employee.model";
import { useAuthStore } from "../../../store/application.store";
import { fetchBusinessesByOwnerId } from "../../../services/business.service";
import { fetchServicesByBusinessId, createService, updateService, deleteService } from "../../../services/service.type.service";
import { fetchEmployeesByBusinessId } from "../../../services/employee.service";
import ConfirmModal from "../../../components/shared/ConfirmModal";
import handleApiError from "../../../utils/handleApiError";
import Toast from "../../../utils/toast";

const ServicesManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    businessId: 0,
    employeeId: null as number | null,
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchServices();
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

  const fetchServices = async () => {
    if (!selectedBusinessId) return;
    
    try {
      const data = await fetchServicesByBusinessId(selectedBusinessId);
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services:", handleApiError(error));
    }
  };

  const fetchEmployees = async () => {
    if (!selectedBusinessId) return;
    
    try {
      const data = await fetchEmployeesByBusinessId(selectedBusinessId);
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", handleApiError(error));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
        
    try {
      if (editingService) {
        await updateService(editingService.id, formData as ServiceType);
      } else {
        await createService(formData as ServiceType);
      }
      await fetchServices();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save service:", handleApiError(error));
      setWarningMessage(handleApiError(error));
      setShowWarningModal(true);
    }
  };

  const handleDeleteClick = (id: number) => {
    setServiceToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      await deleteService(serviceToDelete);
      await fetchServices();
      setShowDeleteModal(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Failed to delete service:", handleApiError(error));
      Toast.error("Failed to delete service. Please try again.");
      setShowDeleteModal(false);
    }
  };

  const handleEdit = (service: ServiceType) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      businessId: service.businessId || selectedBusinessId || 0,
      employeeId: service.employeeId || null,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      businessId: selectedBusinessId || 0,
      employeeId: null,
    });
  };

  const handleOpenModal = () => {
    if (!selectedBusinessId) {
      setWarningMessage("Please select a business first.");
      setShowWarningModal(true);
      return;
    }
    if (employees.length === 0) {
      setWarningMessage("Please create at least one employee before adding services.");
      setShowWarningModal(true);
      return;
    }
    setFormData({
      name: "",
      description: "",
      price: 0,
      businessId: selectedBusinessId,
      employeeId: null,
    });
    setShowModal(true);
  };

  if (loading) return <p>Loading...</p>;

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Services Management</h1>
        <p className="text-gray-600">You don't have any businesses yet. Please create a business first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          disabled={!selectedBusinessId}
        >
          Add New Service
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

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const assignedEmployee = employees.find(emp => emp.id === service.employeeId);
          return (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-2">{service.description}</p>
              <p className="text-lg font-bold text-blue-600 mb-2">€{service.price}</p>
              {assignedEmployee && (
                <p className="text-sm text-gray-500 mb-4">
                  👤 {assignedEmployee.name} ({assignedEmployee.position})
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(service.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-[500px] shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Service Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Price (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Assigned Employee</label>
                <select
                  value={formData.employeeId || ""}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="">Select an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
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
                  className="flex-1 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                >
                  {editingService ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setServiceToDelete(null);
        }}
      />

      {/* Warning Modal */}
      <ConfirmModal
        isOpen={showWarningModal}
        title="Warning"
        message={warningMessage}
        confirmText="OK"
        cancelText=""
        onConfirm={() => setShowWarningModal(false)}
        onCancel={() => setShowWarningModal(false)}
      />
    </div>
  );
};

export default ServicesManagementPage;
