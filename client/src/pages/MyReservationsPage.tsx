import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/application.store";
import { getUserReservations, cancelReservation, ReservationResponse } from "../services/reservation.service";
import handleApiError from "../utils/handleApiError";

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserReservations(parseInt(user.id));
      setReservations(data);
    } catch (err: unknown) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (appointmentId: number) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await cancelReservation(appointmentId);
      setReservations(prev => prev.filter(r => r.id !== appointmentId));
      alert("Reservation cancelled successfully");
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  const isUpcoming = (dateTimeString: string) => {
    return new Date(dateTimeString) > new Date();
  };

  if (loading) return <div className="container mx-auto py-8">Loading your reservations...</div>;

  if (error) return (
    <div className="container mx-auto py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Reservations</h1>
      
      {reservations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">You don't have any reservations yet.</p>
          <a href="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Browse businesses to make a reservation
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="bg-white shadow-md rounded-lg p-6 border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {reservation.serviceName}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <strong>Date & Time:</strong> {formatDateTime(reservation.appointmentTime)}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Reservation ID:</strong> #{reservation.id}
                  </p>
                  <div className="mt-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isUpcoming(reservation.appointmentTime)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {isUpcoming(reservation.appointmentTime) ? "Upcoming" : "Past"}
                    </span>
                  </div>
                </div>
                
                {isUpcoming(reservation.appointmentTime) && (
                  <div className="ml-4">
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;