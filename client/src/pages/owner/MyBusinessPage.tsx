import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/application.store";
import WorkingHoursSelector from "../../components/WorkingHoursSelector";
import { createBusiness, updateBusiness, fetchBusinessesByOwnerId, deleteBusiness } from "../../services/business.service";
import { Business } from "../../models/business.model";
import Toast from "../../utils/toast";
import ConfirmModal from "../../components/shared/ConfirmModal";

const MyBusinessPage: React.FC = () => {
  const { user } = useAuthStore();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    workingHours: "",
    city: "",
    contactPhone: "",
    ownerId: user?.id || 0,
    employeeIds: [] as number[],
    serviceTypeIds: [] as number[],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      if (user?.id) {
        const data = await fetchBusinessesByOwnerId(user.id);
        setBusinesses(data);
      }
    } catch (error) {
      console.error("Failed to fetch businesses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBusiness) {
        // Update existing business
        await updateBusiness(editingBusiness.id, formData, selectedFile || undefined);
      } else {
        // Create new business
        await createBusiness(formData, selectedFile || undefined);
      }
      fetchBusinesses();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save business", error);
      Toast.error("Failed to save business. Please try again.");
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      address: business.address,
      description: business.description,
      workingHours: business.workingHours,
      city: business.city || "",
      contactPhone: business.contactPhone || "",
      ownerId: business.ownerId,
      employeeIds: business.employeeIds || [],
      serviceTypeIds: business.serviceTypeIds || [],
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setBusinessToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (businessToDelete === null) return;
    
    try {
      await deleteBusiness(businessToDelete);
      fetchBusinesses();
      setShowDeleteModal(false);
      setBusinessToDelete(null);
    } catch (error) {
      console.error("Failed to delete business", error);
      Toast.error("Failed to delete business. Please try again.");
      setShowDeleteModal(false);
    }
  };

  const handleCreate = () => {
    setEditingBusiness(null);
    setFormData({
      name: "",
      address: "",
      description: "",
      workingHours: "",
      city: "",
      contactPhone: "",
      ownerId: user?.id || 0,
      employeeIds: [],
      serviceTypeIds: [],
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBusiness(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormData({
      name: "",
      address: "",
      description: "",
      workingHours: "",
      city: "",
      contactPhone: "",
      ownerId: user?.id || 0,
      employeeIds: [],
      serviceTypeIds: [],
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  if (loading) return <p>Loading businesses...</p>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Businesses</h1>
        <button
          onClick={handleCreate}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
        >
          Add New Business
        </button>
      </div>

      {businesses.length === 0 ? (
        // No businesses - show create message
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Businesses Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first business to start managing services, employees, and reservations.
          </p>
          <button
            onClick={handleCreate}
            className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition text-lg"
          >
            Create Your First Business
          </button>
        </div>
      ) : (
        // Businesses list
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white p-6 rounded-lg shadow-md">
              {business.imageUrl && (
                <img 
                  src={business.imageUrl} 
                  alt={business.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
              <p className="text-gray-600 mb-2">{business.address}</p>
              <p className="text-gray-500 text-sm mb-4">{business.city}</p>
              <p className="text-gray-600 mb-4 line-clamp-2">{business.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(business)}
                  className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(business.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-[600px] max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-2xl font-bold mb-6">
              {editingBusiness ? "Edit Business" : "Create New Business"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Business Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    required
                    maxLength={100}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    required
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    maxLength={15}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Working Hours *</label>
                  <WorkingHoursSelector
                    value={formData.workingHours}
                    onChange={(value) => setFormData({ ...formData, workingHours: value })}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                    rows={4}
                    required
                    maxLength={500}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Business Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {editingBusiness?.imageUrl && !previewUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">Current image:</p>
                      <img 
                        src={editingBusiness.imageUrl} 
                        alt="Current business image" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-6">
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
                  {editingBusiness ? "Update Business" : "Create Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Business?"
        message="Are you sure you want to delete this business? This action cannot be undone and will remove all associated data."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setBusinessToDelete(null);
        }}
      />
    </div>
  );
};

export default MyBusinessPage;
