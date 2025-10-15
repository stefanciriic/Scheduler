import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ServiceType } from "../models/service.type";
import { Value } from "react-calendar/src/shared/types.js";
import { useAuthStore } from "../store/application.store";
import Toast from "../utils/toast";
import { createReservation } from "../services/reservation.service";
import { formatToLocalDateTime } from "../utils/dateTimeUtils";
import SuccessModal from "./shared/SuccessModal";

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
      Toast.error("Please ensure all fields are selected before reserving.");
      return;
    }

    if (!service.employeeId) {
      Toast.error("No employee is assigned to this service. Please contact the business.");
      return;
    }

    const appointmentTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    appointmentTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    try {
      // Prepare reservation data
      const reservationData = {
        serviceId: service.id,
        serviceName: service.name,
        userId: userId,
        employeeId: service.employeeId,
        appointmentTime: formatToLocalDateTime(appointmentTime),
      };

      await createReservation(reservationData);

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error making reservation:", error);
      Toast.error("Failed to make reservation. Please try again.");
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
      <SuccessModal
        isOpen={showSuccessModal}
        title="Reservation Successful!"
        message={
          <>
            Your appointment for <strong>{service.name}</strong> has been confirmed.
          </>
        }
        buttonText="Great!"
        onClose={handleSuccessClose}
      />
    </div>
  );
};

export default ReservationModal;
