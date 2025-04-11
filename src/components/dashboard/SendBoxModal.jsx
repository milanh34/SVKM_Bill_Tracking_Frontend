import React, { useState } from "react";
import { Send } from "lucide-react";

export const SendBoxModal = ({
  isOpen,
  onClose,
  selectedBills,
  billsData,
  singleRole,
  handleSend,
}) => {
  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const selectedBillsData = billsData.filter((bill) =>
    selectedBills.includes(bill._id)
  );

  // Calculate dynamic max-height based on number of bills
  const maxHeight = Math.min(80, Math.max(40, selectedBillsData.length * 8 + 30));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[999]">
      <div className={`bg-white w-[90%] md:w-[70%] rounded-2xl flex flex-col`} style={{ maxHeight: `${maxHeight}vh` }}>
        <div className="px-6 py-4 border-b border-[#E8E8E8] flex justify-between items-center">
          <h2 className="font-semibold text-xl">Confirm Bills</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4 min-h-[20vh]">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Selected Bills ({selectedBillsData.length})</h3>
            <div className="space-y-2">
              {selectedBillsData.map((bill) => (
                <div key={bill._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Sr. No</p>
                      <p className="font-medium">{bill.srNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vendor Name</p>
                      <p className="font-medium">{bill.vendorName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Invoice Amount</p>
                      <p className="font-medium">₹{bill.taxInvAmt?.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Invoice Date</p>
                      <p className="font-medium">
                        {new Date(bill.taxInvDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E8E8] bg-white px-6 py-4 sticky bottom-0">
          <div className="mb-4">
            <label className="block font-medium mb-2">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 h-[80px] resize-none"
              placeholder="Add any remarks..."
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSend(selectedBills, remarks)}
              className="px-4 py-2 bg-[#011a99] text-white rounded-lg hover:bg-[#011889] inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send to {singleRole?.label}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
