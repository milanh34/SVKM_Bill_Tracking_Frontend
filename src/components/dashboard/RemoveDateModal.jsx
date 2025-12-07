import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { deleteDate } from "../../apis/bills.api.js";
import { Trash2 } from "lucide-react";

export const RemoveDateModal = ({
  isOpen,
  onClose,
  availableRoles = [],
  role,
  selectedRows = [],
  billsData = [],
  fetchAllData = () => {}
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Map frontend user role to the API teamName expected by backend
  const teamNameMap = {
    site_officer: "Site Team",
    qs_site: "QS Team",
    site_pimo: "PIMO Team",
    accounts: "Accounts Team",
    director: "PIMO Team",
    admin: "Site Team"
  };

  // Map role values to their display labels in the dateFieldMappings
  const roleLabelMap = {
    quality_engineer: "Quality Engineer",
    qs_measurement: "QS Measure",
    qs_cop: "QS for Prov COP",
    site_engineer: "Site Engineer",
    site_architect: "Site Architect",
    site_incharge: "Site Incharge",
    migo_entry: "MIGO Team",
    migo_entry_return: "Ret Site aft MIGO",
    site_dispatch_team: "Site Dispatch",
    pimo_mumbai: "PIMO Team",
    measure: "QS Measure",
    site_cop: "QS for Prov COP",
    pimo_cop: "QS Mumbai to PIMO",
    qs_mumbai: "QS Mumbai",
    it_team: "IT Team",
    ses_team: "SES Team",
    it_return_team: "Ret by IT Team",
    ses_return_team: "Ret by SES Team",
    trustee: "Director/Advisor/Trustee",
    accounts_department: "Accounts Team",
    booking_checking: "Booking & Checking",
  };

  const teamName = teamNameMap[role] || "Site Team";

  const handleRemoveDateClick = async (selectedRole) => {
    if (!selectedRows || selectedRows.length === 0) {
      toast.error("Please select bills to proceed");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      
      // Map the role value to its label using roleLabelMap
      const sendToLabel = roleLabelMap[selectedRole.value] || selectedRole.label;

      const payload = {
        teamName,
        sendTo: sendToLabel,
        billId: selectedRows
      };

      const res = await axios.post(deleteDate, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.data && res.data.success) {
        toast.success(res.data.message || "Dates removed successfully");
        await fetchAllData();
        onClose();
      } else {
        toast.error(res.data?.message || "Failed to remove dates");
      }
    } catch (error) {
      console.error("Error removing dates:", error);
      const msg = error.response?.data?.message || "Failed to remove dates";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-xl font-semibold text-gray-800">Remove Date</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer p-1"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          {availableRoles.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4">
              No roles available
            </div>
          )}
          {availableRoles.map((r) => (
            <button
              key={r.value}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleRemoveDateClick(r)}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
