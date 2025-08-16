import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { patchBills } from "../apis/excel.api";
import updateBillTemplate from '../assets/updateBill.xlsx?url';
import Cookies from 'js-cookie';

export const UpdateBillModal = ({ setOpenUpdateBillModal, loading, setLoading, fetchAllData, patch }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = updateBillTemplate;
    link.download = 'updateBill.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const allowedExtensions = /\.(xlsx|xls|csv)$/i;

    if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
      toast.error("Only .xlsx, .xls, .csv files are allowed");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const userRole = Cookies.get('userRole');
    setLoading(true);

    try {
      const response = await axios.post(
        `${patchBills}/?team=${userRole}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get('token')}`
          },
        }
      );

      toast.success("Bills updated successfully");
      fetchAllData();
      setOpenUpdateBillModal(false);
    } catch (error) {
      console.error("Error updating bills:", error);
      toast.error(error.response?.data?.message || "Error updating bills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        onClick={() => setOpenUpdateBillModal(false)}
      >
        <X className="text-red-500 cursor-pointer" />
      </button>

      <div className="mt-5 text-center">
        <p className="mb-2 font-semibold">Update Bills</p>
        <p className="mb-2">Download the template and fill in the bill details:</p>
        <button
          onClick={handleDownloadTemplate}
          className="text-blue-600 hover:text-blue-800 underline mb-4 hover:cursor-pointer"
        >
          Download Template
        </button>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setOpenUpdateBillModal(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            className={`px-4 py-2 rounded-md text-white ${
              !selectedFile || loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:cursor-pointer'
            }`}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};
