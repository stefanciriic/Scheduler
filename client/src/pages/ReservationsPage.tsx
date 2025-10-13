import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

interface Reservation {
  id: number;
  userId: number;
  serviceId: number;
  serviceName: string;
  employeeId: number;
  appointmentTime: string;
}

const ReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    try {
      // TODO: Replace with actual business ID from logged-in user
      const response = await axiosInstance.get<Reservation[]>("/api/appointments");
      
      // Filter based on selected filter
      const now = new Date();
      let filtered = response.data;
      
      if (filter === 'upcoming') {
        filtered = response.data.filter(r => new Date(r.appointmentTime) >= now);
      } else if (filter === 'past') {
        filtered = response.data.filter(r => new Date(r.appointmentTime) < now);
      }
      
      // Sort by date
      filtered.sort((a, b) => 
        new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
      );
      
      setReservations(filtered);
    } catch (error) {
      console.error("Failed to fetch reservations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
      await axiosInstance.delete(`/api/appointments/${id}`);
      fetchReservations();
    } catch (error) {
      console.error("Failed to delete reservation", error);
      alert("Failed to cancel reservation. Please try again.");
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusColor = (dateTime: string) => {
    const now = new Date();
    const appointmentDate = new Date(dateTime);
    
    if (appointmentDate < now) {
      return 'bg-gray-100 border-gray-300';
    } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return 'bg-yellow-50 border-yellow-300';
    } else {
      return 'bg-green-50 border-green-300';
    }
  };

  if (loading) return <p>Loading reservations...</p>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reservations</h1>
        
        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded transition ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded transition ${
              filter === 'upcoming' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded transition ${
              filter === 'past' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No reservations found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const { date, time } = formatDateTime(reservation.appointmentTime);
            const statusColor = getStatusColor(reservation.appointmentTime);
            
            return (
              <div
                key={reservation.id}
                className={`border-2 rounded-lg p-6 ${statusColor} transition hover:shadow-md`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {reservation.serviceName}
                    </h3>
                    <div className="space-y-1 text-gray-700">
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <strong>Date:</strong>&nbsp;{date}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <strong>Time:</strong>&nbsp;{time}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <strong>User ID:</strong>&nbsp;{reservation.userId}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <strong>Employee ID:</strong>&nbsp;{reservation.employeeId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {new Date(reservation.appointmentTime) >= new Date() && (
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;

