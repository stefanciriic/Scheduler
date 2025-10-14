import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/application.store";
import { getUserReservations, cancelReservation, ReservationResponse } from "../services/reservation.service";
import handleApiError from "../utils/handleApiError";

const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc">("date_desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "past">("all");

  const fetchReservations = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getUserReservations(user.id);
      // Frontend safety: hide canceled even if backend misconfigured
      setReservations(data.filter(r => r.status !== 'CANCELED'));
    } catch (err: unknown) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelClick = (appointmentId: number) => {
    setSelectedReservationId(appointmentId);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReservationId) return;

    try {
      await cancelReservation(selectedReservationId);
      setReservations(prev => prev.filter(r => r.id !== selectedReservationId));
      setShowCancelModal(false);
      setShowSuccessModal(true);
    } catch (err: unknown) {
      setError(handleApiError(err));
      setShowCancelModal(false);
    }
  };

  const parseAppointmentTime = (appointmentTime: string | number[]): Date => {
    if (Array.isArray(appointmentTime)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = appointmentTime;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return new Date(appointmentTime);
  };

  const formatDateTime = (dateTime: string | number[]) => {
    const date = parseAppointmentTime(dateTime);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isUpcoming = (dateTime: string | number[]) => {
    return parseAppointmentTime(dateTime) > new Date();
  };

  if (loading) return <div className="container mx-auto py-8 max-w-3xl">Loading your reservations...</div>;

  if (error) return (
    <div className="container mx-auto py-8">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    </div>
  );

  // derive filtered + sorted list
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = reservations.filter((r) => {
    const matchesQuery = normalizedQuery
      ? (r.serviceName?.toLowerCase().includes(normalizedQuery) || String(r.id).includes(normalizedQuery))
      : true;
    const upcoming = isUpcoming(r.appointmentTime);
    const matchesStatus =
      statusFilter === "all" ? true : statusFilter === "upcoming" ? upcoming : !upcoming;
    return matchesQuery && matchesStatus;
  }).sort((a, b) => {
    const da = parseAppointmentTime(a.appointmentTime).getTime();
    const db = parseAppointmentTime(b.appointmentTime).getTime();
    return sortBy === "date_desc" ? db - da : da - db;
  });

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">My Reservations</h1>

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by service or ID..."
          className="w-full md:flex-1 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
        </select>
      </div>
      
      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No reservations match your filters.</p>
          <a href="/" className="text-blue-500 hover:underline mt-2 inline-block">
            Browse businesses to make a reservation
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((reservation) => (
            <div key={reservation.id} className="bg-white shadow-sm rounded-lg p-5 border">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                    {reservation.serviceName}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Date & Time:</span> {formatDateTime(reservation.appointmentTime)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    <span className="font-medium">Reservation ID:</span> #{reservation.id}
                  </p>
                  <div className="mt-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isUpcoming(reservation.appointmentTime)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {isUpcoming(reservation.appointmentTime) ? "Upcoming" : "Past"}
                    </span>
                  </div>
                </div>
                {isUpcoming(reservation.appointmentTime) && (
                  <button
                    onClick={() => handleCancelClick(reservation.id)}
                    className="shrink-0 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-[400px] shadow-2xl">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Cancel Reservation?</h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                No, Keep It
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-[400px] shadow-2xl text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reservation Cancelled</h3>
            <p className="text-gray-600 mb-6">
              Your reservation has been successfully cancelled.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;