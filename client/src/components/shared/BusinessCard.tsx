import { Link } from "react-router-dom";
import { Business } from "../../models/business.model";

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const defaultImageUrl = "/default-image.png";

  return (
    <div className="border rounded shadow-sm p-3 w-64 mx-auto">
      <img
        src={business.imageUrl || defaultImageUrl} 
        alt={business.name || "Business"}
        className="w-full h-32 object-cover rounded-md"
      />
      <h2 className="text-md font-semibold mt-2 truncate">{business.name}</h2>
      <p className="text-sm text-gray-500 truncate">
        {business.city}, {business.district}
      </p>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {business.description}
      </p>
      <Link
        to={`/businesses/${business.id}`}
        className="text-blue-500 hover:underline mt-2 inline-block text-sm"
      >
        View Details
      </Link>
    </div>
  );
};

export default BusinessCard;
