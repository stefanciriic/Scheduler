import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../store/application.store";
import { getUserReservations, cancelReservation, ReservationResponse } from "../../services/reservation.service";
import handleApiError from "../../utils/handleApiError";
import ErrorMessage from "../../components/shared/ErrorMessage";
import { formatDateTime as formatDateTimeUtil, parseAppointmentTime } from "../../utils/dateTimeUtils";
import SuccessModal from "../../components/shared/SuccessModal";
import ConfirmModal from "../../components/shared/ConfirmModal";

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

  const formatDateTime = (dateTime: string | number[]): string => {
    return formatDateTimeUtil(dateTime).combined;
  };

  const isUpcoming = (dateTime: string | number[]) => {
    return parseAppointmentTime(dateTime) > new Date();
  };

  if (loading) return <div className="container mx-auto py-8 max-w-3xl">Loading your reservations...</div>;

  if (error) return (
    <div className="container mx-auto py-8">
      <ErrorMessage message={error} />
    </div>
  );

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
          onChange={(e) => setStatusFilter(e.target.value as "all" | "upcoming" | "past")}
          className="px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "date_desc" | "date_asc")}
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
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title="Reservation Cancelled"
        message="Your reservation has been successfully cancelled."
        buttonText="OK"
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default MyReservationsPage;