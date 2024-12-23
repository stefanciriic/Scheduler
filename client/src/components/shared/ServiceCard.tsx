import React, { useState } from "react";
import { ServiceType } from "../../models/service.type";
import ReservationModal from "../reservation.modal";

interface ServiceCardProps {
  service: ServiceType;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    const [isModalOpen, setModalOpen] = useState(false);
  
    const handleReservationClick = () => {
      setModalOpen(true);
    };
  
    return (
      <div className="border rounded-lg shadow-md p-4 flex flex-col justify-between h-full w-full max-w-[16rem] mx-auto">
        <div>
          <h3 className="text-lg font-bold truncate">{service.name}</h3>
          <p className="text-gray-700 mt-2 line-clamp-3">{service.description}</p>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-gray-900 font-semibold">Price: ${service.price.toFixed(2)}</p>
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
