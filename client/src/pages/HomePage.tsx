import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllBusinesses, searchBusinesses } from "../services/business.service";
import { Business } from "../models/business.model";

const HomePage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error("Failed to fetch businesses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log(search);
      const data = search.trim()
        ? await searchBusinesses(search) 
        : await fetchAllBusinesses();   
      console.log("API Response:", data);
  
      setBusinesses(data);
    } catch (error) {
      console.error("Failed to search businesses", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading businesses...</p>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to Our Businesses</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search businesses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={handleSearch}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      {/* Grid Layout for Businesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <div key={business.id} className="border rounded shadow-md p-4">
            <img
              src={business.imageUrl || "default-business-image.jpg"}
              alt={business.name}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="text-lg font-bold mt-2">{business.name}</h2>
            <p className="text-gray-600">
              {business.city}, {business.district}
            </p>
            <p className="text-gray-600">{business.description.slice(0, 50)}...</p>
            <Link
              to={`/businesses/${business.id}`}
              className="text-blue-500 hover:underline mt-2 block"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
