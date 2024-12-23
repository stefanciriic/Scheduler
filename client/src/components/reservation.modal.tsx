import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ServiceType } from "../models/service.type";
import { Value } from "react-calendar/src/shared/types.js";

interface ReservationModalProps {
  service: ServiceType;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ service, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const availableTimeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleDateChange = (value: Value) => {
    if (value && !(value instanceof Array)) {
      setSelectedDate(value as Date);
      setSelectedTime(null);
    } else {
      setSelectedDate(null);
    }
  };

  const handleReserve = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time for your reservation.");
      return;
    }
    console.log(`Reserved ${service.name} on ${selectedDate.toDateString()} at ${selectedTime}`);
    onClose();
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
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            disabled={!selectedDate || !selectedTime}
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
