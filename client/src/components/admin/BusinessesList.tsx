import React from 'react';
import { Business } from '../../models/business.model';

interface BusinessesListProps {
  businesses: Business[];
  onDelete: (businessId: number) => void;
}

const BusinessesList: React.FC<BusinessesListProps> = ({ businesses, onDelete }) => {
  return (
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
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => onDelete(business.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Delete Business
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BusinessesList;