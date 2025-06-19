import React from "react";

const AttachmentsModal = ({ isOpen, onClose, attachments }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <button 
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold" 
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h2>

        <ul className="space-y-3 max-h-64 overflow-y-auto">
          {attachments.map((link, index) => (
            <li key={index}>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-words"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AttachmentsModal;