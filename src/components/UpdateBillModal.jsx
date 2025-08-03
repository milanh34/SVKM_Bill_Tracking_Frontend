import React from "react";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { importExcel } from "../apis/bills.api";

export const UpdateBillModal = ({ setOpenUpdateBillModal, loading, setLoading, fetchAllData, patch }) => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const allowedExtensions = /\.(xlsx|xls|csv)$/i;

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.test(file.name)
    ) {
      toast.error("Only .xlsx, .xls, .csv files are allowed");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post(
        `${importExcel}/${patch ? "patch-bills" : "import-report"}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);

      toast.success("File imported successfully");
      if(patch) {
        fetchAllData();
      }
    } catch (error) {
      console.error("Error importing file:", error);
      toast.error(error.response?.data?.message || "Error importing file");
    } finally {
      setLoading(false);
      event.target.value = "";
      setOpenUpdateBillModal(false);
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
        <p className="mb-2 font-semibold">Import A File To {patch ? "Update" : "Add"} Bills</p>
        <p className="mb-2">Here is a link to preview the required format.</p>
        <p>
          link:{" "}
          <a href="#" className="text-blue-600 underline">
            helloworld.com
          </a>
        </p>

        <label
          htmlFor="fileInput"
          className="inline-block mt-6 bg-[#364cbb] text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition duration-200 hover:bg-[#2a3c9e] hover:-translate-y-0.5 shadow-md"
        >
          {patch ? "Update" : "Add"} Bills (Import File)
          <input
            type="file"
            id="fileInput"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={loading}
          />
        </label>
      </div>
    </div>
  );
};
