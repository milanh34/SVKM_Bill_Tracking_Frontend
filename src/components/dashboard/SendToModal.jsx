import React from "react";
import { Send, X } from "lucide-react";

export const SendToModal = ({
  isOpen,
  onClose,
  availableRoles,
  handleSendToRole,
  role,
  handleNotReceiveBills,
  countOfSelectedBills
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-500/25 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Send Bills To</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer p-1"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          {availableRoles.map((role) => (
            <button
              key={role.value}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors hover:cursor-pointer"
              onClick={() => handleSendToRole(role)}
            >
              <Send className="w-4 h-4" />
              <span>{role.label}</span>
            </button>
          ))}
          {role == "site_pimo" || role == "accounts" ? (
            <button
              key={role.value}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors hover:cursor-pointer"
              onClick={() => handleNotReceiveBills()}
            >
              <X className="w-4 h-4" />
              <span>Mark as Not Received</span>
            </button>
          ) : null}
        </div>
        <p className="text-center mt-5">You have selected {countOfSelectedBills} bills</p>
      </div>
    </div>
  );
};
