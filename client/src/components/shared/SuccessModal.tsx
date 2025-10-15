import React from "react";

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  buttonText?: string;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  message,
  buttonText = "OK",
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-white rounded-lg p-8 w-[400px] shadow-2xl text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <div className="text-gray-600 mb-6">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
        <button
          onClick={onClose}
          className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
