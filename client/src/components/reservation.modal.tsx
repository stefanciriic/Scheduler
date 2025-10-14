import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ServiceType } from "../models/service.type";
import { Value } from "react-calendar/src/shared/types.js";
import axiosInstance from "../api/axiosInstance";
import { useAuthStore } from "../store/application.store";

interface ReservationModalProps {
  service: ServiceType;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ service, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const availableTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Use the store to get the current user
  const userId = useAuthStore((state) => state.user?.id);
  const handleDateChange = (value: Value) => {
    if (value && !(value instanceof Array)) {
      setSelectedDate(value as Date);
      setSelectedTime(null);
    } else {
      setSelectedDate(null);
    }
  };

  const handleReserve = async () => {
    if (!selectedDate || !selectedTime || !userId) {
      alert("Please ensure all fields are selected before reserving.");
      return;
    }
    const appointmentTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Format as LocalDateTime (yyyy-MM-ddTHH:mm:ss) without timezone
    const formatLocalDateTime = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      const second = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    };

    try {
      // API call to create reservation
      await axiosInstance.post("/api/appointments", {
        serviceId: service.id,
        serviceName: service.name,
        userId: userId,
        employeeId: 1, // Replace if dynamic employee selection is required
        appointmentTime: formatLocalDateTime(appointmentTime),
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error making reservation:", error);
      alert("Failed to make reservation. Please try again.");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isTimeSlotDisabled = (timeSlot: string): boolean => {
    if (!selectedDate) return false;
    
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    // If selected date is not today, all time slots are available
    if (selectedDateOnly.getTime() !== today.getTime()) {
      return false;
    }
    
    // For today, disable time slots that have already passed
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    return slotTime <= now;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-[700px] shadow-lg relative">
        <h2 className="text-3xl font-bold mb-6 text-center">Reserve {service.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex justify-center">
            <Calendar
              onChange={(value) => handleDateChange(value)}
              value={selectedDate}
              tileDisabled={tileDisabled}
              className="w-full max-w-sm"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">Available Time Slots</h3>
            <div className="grid grid-cols-2 gap-4">
              {availableTimeSlots.map((time) => {
                const isDisabled = isTimeSlotDisabled(time);
                return (
                  <button
                    key={time}
                    onClick={() => !isDisabled && setSelectedTime(time)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded border text-center ${
                      isDisabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : selectedTime === time
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            <p className="text-center md:text-left mt-4 text-gray-700">
              Selected Time: {selectedTime || "None"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReserve}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            disabled={!selectedDate || !selectedTime}
          >
            Reserve
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white rounded-lg p-8 w-[400px] shadow-2xl text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reservation Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your appointment for <strong>{service.name}</strong> has been confirmed.
            </p>
            <button
              onClick={handleSuccessClose}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Great!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationModal;
