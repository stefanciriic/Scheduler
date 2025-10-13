import React, { useState } from "react";

interface WorkingHoursSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const WorkingHoursSelector: React.FC<WorkingHoursSelectorProps> = ({ 
  value, 
  onChange, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customHours, setCustomHours] = useState("");

  const predefinedOptions = [
    "Mon-Fri 9:00-17:00",
    "Mon-Fri 8:00-16:00", 
    "Mon-Fri 10:00-18:00",
    "Mon-Sat 9:00-17:00",
    "Mon-Sat 8:00-16:00",
    "Mon-Sun 9:00-17:00",
    "24/7",
    "Mon-Fri 9:00-21:00",
    "Mon-Fri 8:00-20:00",
    "Mon-Fri 7:00-19:00"
  ];

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleCustomSubmit = () => {
    if (customHours.trim()) {
      onChange(customHours.trim());
      setCustomHours("");
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSubmit();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 text-left bg-white"
      >
        {value || "Select working hours"}
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Predefined options */}
          <div className="py-1">
            {predefinedOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  value === option ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Custom input */}
          <div className="p-3">
            <div className="text-xs text-gray-500 mb-2">Or enter custom hours:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Mon-Fri 9:00-17:00"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                disabled={!customHours.trim()}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default WorkingHoursSelector;
