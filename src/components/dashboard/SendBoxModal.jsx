import React from "react";
import SendBox from "../Sendbox";

export const SendBoxModal = ({
  isOpen,
  onClose,
  selectedBills,
  billsData,
  singleRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/25 flex items-center justify-center z-50">
      <SendBox
        closeWindow={onClose}
        selectedBills={selectedBills}
        billsData={billsData}
        singleRole={singleRole}
      />
    </div>
  );
};
