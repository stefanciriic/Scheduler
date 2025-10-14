import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchServicesByBusinessId } from "../services/service.type.service";
import { ServiceType } from "../models/service.type";
import { fetchBusinessById } from "../services/business.service";
import { Business } from "../models/business.model";
import ServiceCard from "../components/shared/ServiceCard";

const BusinessDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const defaultImageUrl = "/default-image.png";
  useEffect(() => {
    const parsedBusinessId = id ? Number(id) : NaN;

    if (isNaN(parsedBusinessId)) {
      console.error("Invalid Business ID:", id);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [businessData, servicesData] = await Promise.all([
          fetchBusinessById(Number(id)),
          fetchServicesByBusinessId(Number(id)),
        ]);

        setBusiness(businessData);
        setServices(servicesData);
      } catch (error) {
        console.error("Failed to fetch business details or services", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p>Loading business details...</p>;

  if (!business) return <p>Business not found.</p>;

  return (
    <div className="container mx-auto py-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row">
          <img
            src={business.imageUrl || defaultImageUrl} 
            alt={business.name}
            className="w-full md:w-1/5 h-auto object-cover rounded-md"
          />
          <div className="md:ml-6 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold">{business.name}</h1>
            <p className="text-gray-700 mt-2">{business.description}</p>
            <p className="text-gray-700 mt-2">
              <strong>Address:</strong> {business.address}
            </p>
            {business.contactPhone && (
              <p className="text-gray-700 mt-2">
                <strong>Contact:</strong> {business.contactPhone}
              </p>
            )}
            <p className="text-gray-700 mt-2">
              <strong>Working Hours:</strong> {business.workingHours}
            </p>
            {business.city && (
              <p className="text-gray-700 mt-2">
                <strong>Location:</strong> {business.city}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Services</h2>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center items-start">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p>No services available for this business.</p>
        )}
      </div>
    </div>
  );
};

export default BusinessDetailsPage;
