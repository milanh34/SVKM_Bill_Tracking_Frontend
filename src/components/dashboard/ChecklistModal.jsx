import React from 'react';
import { useNavigate } from 'react-router-dom';

const ChecklistModal = ({ isOpen, onClose, selectedRows, billsData }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Select Checklist Type</h2>
        <div className="space-y-3">
          <button
            onClick={() =>
              navigate("/checklist-directFI2", {
                state: {
                  selectedRows,
                  bills: billsData.filter((bill) =>
                    selectedRows?.includes(bill._id)
                  ),
                },
              })
            }
            className="bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors hover:cursor-pointer w-full py-2 px-4"
          >
            Direct FI Checklist
          </button>
          <button
            onClick={() =>
              navigate("/checklist-advance2", {
                state: {
                  selectedRows,
                  bills: billsData.filter((bill) =>
                    selectedRows?.includes(bill._id)
                  ),
                },
              })
            }
            className="bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors hover:cursor-pointer w-full py-2 px-4"
          >
            Advanced Checklist
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChecklistModal;
