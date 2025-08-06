import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ServiceType } from "../models/service.type";
import { Value } from "react-calendar/src/shared/types.js";
import { useAuthStore } from "../store/application.store";
import { createReservation } from "../services/reservation.service";
import handleApiError from "../utils/handleApiError";

interface ReservationModalProps {
  service: ServiceType;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ service, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const availableTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

  const handleDateChange = (value: Value) => {
    if (value && !(value instanceof Array)) {
      setSelectedDate(value as Date);
      setSelectedTime(null);
    } else {
      setSelectedDate(null);
    }
  };

  const handleReserve = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time for your reservation.");
      return;
    }

    if (!user) {
      alert("You must be logged in to make a reservation.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      await createReservation({
        userId: parseInt(user.id),
        serviceId: service.id,
        employeeId: service.employeeId || 1, // Default to first employee if not specified
        appointmentTime: appointmentDateTime.toISOString(),
        serviceName: service.name
      });

      alert(`Successfully reserved ${service.name} on ${selectedDate.toDateString()} at ${selectedTime}`);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-[700px] shadow-lg relative">
        <h2 className="text-3xl font-bold mb-6 text-center">Reserve {service.name}</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kalendar */}
          <div className="flex justify-center">
            <Calendar
              onChange={(value) => handleDateChange(value)}
              value={selectedDate}
              tileDisabled={tileDisabled}
              className="w-full max-w-sm"
            />
          </div>

          {/* Dostupni termini */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center md:text-left">Available Time Slots</h3>
            <div className="grid grid-cols-2 gap-4">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-2 rounded border text-center ${
                    selectedTime === time
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="text-center md:text-left mt-4 text-gray-700">
              Selected Time: {selectedTime || "None"}
            </p>
          </div>
        </div>

        {/* Dugmad za potvrdu ili otkazivanje */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReserve}
            className={`px-6 py-2 rounded text-white transition ${
              isLoading || !selectedDate || !selectedTime
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={!selectedDate || !selectedTime || isLoading}
          >
            {isLoading ? "Reserving..." : "Reserve"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
