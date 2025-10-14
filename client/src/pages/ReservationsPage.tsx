import React, { useEffect, useState, useCallback } from "react";
import { Business } from "../models/business.model";
import { fetchUserById } from "../services/userService";
import { fetchEmployeeById } from "../services/employee.service";
import { useAuthStore } from "../store/application.store";
import { fetchBusinessesByOwnerId } from "../services/business.service";
import { ReservationResponse, getBusinessReservations, cancelReservation, permanentlyDeleteReservation } from "../services/reservation.service";
import ConfirmModal from "../components/shared/ConfirmModal";

interface EnrichedReservation extends ReservationResponse {
  userName?: string;
  employeeName?: string;
}

const ReservationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<EnrichedReservation[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [error, setError] = useState<string | null>(null);
  
  // Cancel confirmation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null);
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<number | null>(null);

  const fetchBusinesses = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const data = await fetchBusinessesByOwnerId(user.id);
      setBusinesses(data);
      
      // Auto-select first business if available
      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch businesses", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Helper function to parse appointmentTime (can be string or array)
  const parseAppointmentTime = useCallback((appointmentTime: string | number[]): Date => {
    if (Array.isArray(appointmentTime)) {
      // Format: [year, month, day, hour, minute, second?, nano?]
      const [year, month, day, hour = 0, minute = 0, second = 0] = appointmentTime;
      // Note: JavaScript months are 0-indexed, but Java months are 1-indexed
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return new Date(appointmentTime);
  }, []);

  const fetchReservations = useCallback(async () => {
    if (!selectedBusinessId) return;
    
    try {
      const response = await getBusinessReservations(selectedBusinessId);
      // Enrich user and employee names in parallel with simple in-memory cache
      const userCache = new Map<number, string>();
      const employeeCache = new Map<number, string>();
      const uniqueUserIds = Array.from(new Set(response.map(r => r.userId)));
      const uniqueEmployeeIds = Array.from(new Set(response.map(r => r.employeeId)));

      await Promise.all([
        Promise.all(uniqueUserIds.map(async (id) => {
          try {
            const u = await fetchUserById(id);
            const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username;
            userCache.set(id, name);
          } catch (err) {
            console.error(`Failed to fetch user ${id}:`, err);
          }
        })),
        Promise.all(uniqueEmployeeIds.map(async (id) => {
          try {
            const e = await fetchEmployeeById(id);
            employeeCache.set(id, e.name);
          } catch (err) {
            console.error(`Failed to fetch employee ${id}:`, err);
          }
        }))
      ]);
      
      // Enriched list
      const enriched: EnrichedReservation[] = response.map((r) => ({
        ...r,
        userName: userCache.get(r.userId) || undefined,
        employeeName: employeeCache.get(r.employeeId) || undefined,
      }));

      // Filter based on selected filter
      const now = new Date();
      let filtered = enriched;
      
      if (filter === 'upcoming') {
        filtered = enriched.filter(r => parseAppointmentTime(r.appointmentTime) >= now);
      } else if (filter === 'past') {
        filtered = enriched.filter(r => parseAppointmentTime(r.appointmentTime) < now);
      }
      
      // Sort by date
      filtered.sort((a, b) => 
        parseAppointmentTime(a.appointmentTime).getTime() - parseAppointmentTime(b.appointmentTime).getTime()
      );
      
      setReservations(filtered);
    } catch (error) {
      console.error("Failed to fetch reservations", error);
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, filter, parseAppointmentTime]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancelClick = (id: number) => {
    setReservationToCancel(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!reservationToCancel) return;
    
    try {
      setError(null);
      await cancelReservation(reservationToCancel);
      fetchReservations();
      setShowCancelModal(false);
      setReservationToCancel(null);
    } catch (err: unknown) {
      console.error("Failed to cancel reservation", err);
      setError("Failed to cancel reservation. Please try again.");
      setShowCancelModal(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setReservationToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;
    
    try {
      setError(null);
      await permanentlyDeleteReservation(reservationToDelete);
      fetchReservations();
      setShowDeleteModal(false);
      setReservationToDelete(null);
    } catch (err: unknown) {
      console.error("Failed to delete reservation", err);
      setError("Failed to permanently delete reservation. Please try again.");
      setShowDeleteModal(false);
    }
  };

  const formatDateTime = (dateTime: string | number[]) => {
    // Parse LocalDateTime format from backend
    const date = parseAppointmentTime(dateTime);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }
    
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

  const getStatusColor = (dateTime: string | number[]) => {
    const now = new Date();
    const appointmentDate = parseAppointmentTime(dateTime);
    
    if (appointmentDate < now) {
      return 'bg-gray-100 border-gray-300';
    } else if (appointmentDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return 'bg-yellow-50 border-yellow-300';
    } else {
      return 'bg-green-50 border-green-300';
    }
  };

  const getStatusBadge = (dateTime: string | number[]) => {
    const now = new Date();
    const appointmentDate = parseAppointmentTime(dateTime);
    
    // Check if date is valid
    if (isNaN(appointmentDate.getTime())) {
      return { text: 'Invalid Date', color: 'bg-red-500' };
    }
    
    const diffMs = appointmentDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (appointmentDate < now) {
      return { text: 'Completed', color: 'bg-gray-500' };
    } else if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return { text: `In ${diffMinutes} min`, color: 'bg-red-500' };
    } else if (diffHours < 24) {
      return { text: `In ${diffHours}h`, color: 'bg-yellow-500' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'bg-blue-500' };
    } else if (diffDays < 7) {
      return { text: `In ${diffDays} days`, color: 'bg-green-500' };
    } else {
      return { text: `In ${diffDays} days`, color: 'bg-green-600' };
    }
  };

  if (loading) return <p>Loading...</p>;

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Reservations</h1>
        <p className="text-gray-600">You don't have any businesses yet. Please create a business first.</p>
      </div>
    );
  }

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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Business Selector */}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-semibold">Select Business:</label>
        <select
          value={selectedBusinessId || ""}
          onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
          className="w-full md:w-1/3 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>
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
            const statusBadge = getStatusBadge(reservation.appointmentTime);
            
            const isUpcoming = parseAppointmentTime(reservation.appointmentTime) >= new Date();
            const isNotCanceled = reservation.status !== 'CANCELED';
            const canCancel = isUpcoming && isNotCanceled;
            
            // Determine which badge to show (priority: CANCELED > time-based)
            let displayBadge;
            if (reservation.status === 'CANCELED') {
              displayBadge = { text: 'CANCELED', color: 'bg-red-500' };
            } else if (!isUpcoming) {
              displayBadge = { text: 'Completed', color: 'bg-gray-500' };
            } else {
              displayBadge = statusBadge;
            }
            
            return (
              <div
                key={reservation.id}
                className={`border-2 rounded-lg p-6 ${statusColor} transition hover:shadow-md`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {reservation.serviceName}
                      </h3>
                      <span className={`${displayBadge.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                        {displayBadge.text}
                      </span>
                    </div>
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
                        <strong>User:</strong>&nbsp;{reservation.userName ?? `#${reservation.userId}`}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <strong>Employee:</strong>&nbsp;{reservation.employeeName ?? `#${reservation.employeeId}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(reservation.id)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(reservation.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? The reservation will be marked as CANCELED but will remain in the database."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        confirmButtonClass="bg-yellow-500 hover:bg-yellow-600"
        onConfirm={confirmCancel}
        onCancel={() => {
          setShowCancelModal(false);
          setReservationToCancel(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="⚠️ Permanently Delete Reservation"
        message="Are you sure you want to PERMANENTLY DELETE this reservation? This action CANNOT be undone and the reservation will be removed from the database forever!"
        confirmText="Yes, Delete Forever"
        cancelText="No, Keep It"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setReservationToDelete(null);
        }}
      />
    </div>
  );
};

export default ReservationsPage;