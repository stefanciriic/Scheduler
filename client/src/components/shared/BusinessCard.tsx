import { Link } from "react-router-dom";
import { Business } from "../../models/business.model";

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const defaultImageUrl = "/default-image.png";

  return (
    <div className="border rounded-lg shadow-md p-4 w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-300">
      <img
        src={business.imageUrl || defaultImageUrl} 
        alt={business.name || "Business"}
        className="w-full h-40 object-cover rounded-md mb-3"
      />
      <h2 className="text-lg font-bold mb-2 truncate text-gray-800">{business.name}</h2>
      <p className="text-sm text-gray-600 mb-2 truncate">
        📍 {business.city}
      </p>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
        {business.description}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">🕒 {business.workingHours}</span>
      </div>
      <Link
        to={`/businesses/${business.id}`}
        className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded mt-3 hover:bg-blue-600 transition-colors duration-200"
      >
        View Details
      </Link>
    </div>
  );
};

export default BusinessCard;
