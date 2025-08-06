import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/application.store";
import { fetchServicesByBusinessId, createService, updateService, deleteService } from "../services/service.type.service";
import { fetchEmployeesByBusinessId, createEmployee, updateEmployee, deleteEmployee } from "../services/employee.service";
import { fetchBusinessesByOwner } from "../services/business.service";
import { ServiceType } from "../models/service.type";
import { Employee } from "../models/employee.model";
import { Business } from "../models/business.model";
import handleApiError from "../utils/handleApiError";

const BusinessOwnerDashboard: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'employees'>('services');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchBusinessData();
    }
  }, [selectedBusiness]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const data = await fetchBusinessesByOwner(parseInt(user!.id));
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusiness(data[0]);
      }
    } catch (err: unknown) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessData = async () => {
    if (!selectedBusiness) return;

    try {
      const [servicesData, employeesData] = await Promise.all([
        fetchServicesByBusinessId(selectedBusiness.id),
        fetchEmployeesByBusinessId(selectedBusiness.id)
      ]);
      setServices(servicesData);
      setEmployees(employeesData);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const handleServiceSubmit = async (serviceData: Partial<ServiceType>) => {
    if (!selectedBusiness) return;

    try {
      if (editingService) {
        const updated = await updateService(editingService.id, {
          ...serviceData,
          businessId: selectedBusiness.id
        } as ServiceType);
        setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
      } else {
        const created = await createService({
          ...serviceData,
          businessId: selectedBusiness.id
        } as ServiceType);
        setServices(prev => [...prev, created]);
      }
      setShowServiceModal(false);
      setEditingService(null);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const handleEmployeeSubmit = async (employeeData: Partial<Employee>) => {
    if (!selectedBusiness) return;

    try {
      if (editingEmployee) {
        const updated = await updateEmployee(editingEmployee.id, {
          ...employeeData,
          businessId: selectedBusiness.id
        } as Employee);
        setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? updated : e));
      } else {
        const created = await createEmployee({
          ...employeeData,
          businessId: selectedBusiness.id
        } as Employee);
        setEmployees(prev => [...prev, created]);
      }
      setShowEmployeeModal(false);
      setEditingEmployee(null);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await deleteService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await deleteEmployee(employeeId);
      setEmployees(prev => prev.filter(e => e.id !== employeeId));
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  if (loading) return <div className="container mx-auto py-8">Loading dashboard...</div>;

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Business Owner Dashboard</h1>
          <p className="text-gray-600">You don't have any businesses yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Business Owner Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Business Selector */}
      {businesses.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Business:
          </label>
          <select
            value={selectedBusiness?.id || ''}
            onChange={(e) => {
              const business = businesses.find(b => b.id === parseInt(e.target.value));
              setSelectedBusiness(business || null);
            }}
            className="border rounded px-3 py-2"
          >
            {businesses.map(business => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedBusiness && (
        <>
          {/* Business Info */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">{selectedBusiness.name}</h2>
            <p className="text-gray-600">{selectedBusiness.description}</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('services')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'services'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Services ({services.length})
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

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Services</h3>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Service
                </button>
              </div>
              
              <div className="grid gap-4">
                {services.map(service => (
                  <div key={service.id} className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-gray-600 text-sm">{service.description}</p>
                        <p className="text-green-600 font-semibold">${service.price}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setShowServiceModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Employees</h3>
                <button
                  onClick={() => setShowEmployeeModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Employee
                </button>
              </div>
              
              <div className="grid gap-4">
                {employees.map(employee => (
                  <div key={employee.id} className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{employee.name}</h4>
                        <p className="text-gray-600">{employee.position}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingEmployee(employee);
                            setShowEmployeeModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <ServiceModal
          service={editingService}
          onSubmit={handleServiceSubmit}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
          }}
        />
      )}

      {/* Employee Modal */}
      {showEmployeeModal && (
        <EmployeeModal
          employee={editingEmployee}
          onSubmit={handleEmployeeSubmit}
          onClose={() => {
            setShowEmployeeModal(false);
            setEditingEmployee(null);
          }}
        />
      )}
    </div>
  );
};

// Service Modal Component
const ServiceModal: React.FC<{
  service: ServiceType | null;
  onSubmit: (data: Partial<ServiceType>) => void;
  onClose: () => void;
}> = ({ service, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">
          {service ? 'Edit Service' : 'Add Service'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {service ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Employee Modal Component
const EmployeeModal: React.FC<{
  employee: Employee | null;
  onSubmit: (data: Partial<Employee>) => void;
  onClose: () => void;
}> = ({ employee, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    position: employee?.position || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">
          {employee ? 'Edit Employee' : 'Add Employee'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessOwnerDashboard;