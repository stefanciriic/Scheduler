import React, { useEffect, useState } from "react";
import { ServiceType } from "../models/service.type";
import { Business } from "../models/business.model";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/application.store";
import { fetchBusinessesByOwnerId } from "../services/business.service";

const ServicesManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

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
      const response = await axiosInstance.get<ServiceType[]>(`/api/service-types/business/${selectedBusinessId}`);
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        // Update existing service
        await axiosInstance.put(`/api/service-types/${editingService.id}`, formData);
      } else {
        // Create new service
        await axiosInstance.post("/api/service-types", formData);
      }
      fetchServices();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save service", error);
      alert("Failed to save service. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    
    try {
      await axiosInstance.delete(`/api/service-types/${id}`);
      fetchServices();
    } catch (error) {
      console.error("Failed to delete service", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  const handleEdit = (service: ServiceType) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price,
      businessId: service.businessId,
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
    setFormData({
      name: "",
      description: "",
      price: 0,
      businessId: selectedBusinessId || 0,
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
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <p className="text-lg font-bold text-blue-600 mb-4">${service.price}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(service)}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(service.id)}
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
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Business</label>
                <select
                  value={formData.businessId}
                  onChange={(e) => setFormData({ ...formData, businessId: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
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
                <label className="block text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
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
                  className="flex-1 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                >
                  {editingService ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagementPage;

