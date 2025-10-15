import React, { useState, useEffect } from "react";
import { ServiceType } from "../../models/service.type";
import ReservationModal from "../reservation.modal";
import { fetchEmployeesByBusinessId } from "../../services/employee.service";
import { Employee } from "../../models/employee.model";

interface ServiceCardProps {
  service: ServiceType;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(false);
  
    useEffect(() => {
      const loadEmployee = async () => {
        if (!service.employeeId) return;
        
        try {
          setLoadingEmployee(true);
          const employees = await fetchEmployeesByBusinessId(service.businessId);
          const assignedEmployee = employees.find(emp => emp.id === service.employeeId);
          if (assignedEmployee) {
            setEmployee(assignedEmployee);
          }
        } catch (error) {
          console.error("Failed to load employee:", error);
        } finally {
          setLoadingEmployee(false);
        }
      };
      
      loadEmployee();
    }, [service.employeeId, service.businessId]);

    const handleReservationClick = () => {
      setModalOpen(true);
    };
  
    return (
      <div className="border rounded-lg shadow-md p-4 flex flex-col justify-between h-full w-full max-w-[16rem] mx-auto">
        <div>
          <h3 className="text-lg font-bold truncate">{service.name}</h3>
          <p className="text-gray-700 mt-2 line-clamp-3">{service.description}</p>
          
          {/* Employee Information */}
          {loadingEmployee ? (
            <p className="text-sm text-gray-500 mt-2">Loading employee...</p>
          ) : employee ? (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <strong>Provider:</strong> {employee.name}
              </p>
              <p className="text-xs text-gray-500">{employee.position}</p>
            </div>
          ) : service.employeeId ? (
            <p className="text-sm text-gray-500 mt-2">Employee not found</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No employee assigned</p>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-gray-900 font-semibold">Price: €{service.price.toFixed(2)}</p>
          <button
            onClick={handleReservationClick}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
          >
            Reserve
          </button>
        </div>
        {isModalOpen && (
          <ReservationModal
            service={service}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    );
  };
  

export default ServiceCard;
