import React, { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import { bills } from "../apis/bills.api";
import {
  natureOfWorks,
  vendors,
  currencies,
} from "../apis/master.api";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Paperclip, X } from "lucide-react";

const FullBillDetails = () => {
  const currentUserRole = Cookies.get("userRole");
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const availableRegions = JSON.parse(Cookies.get('availableRegions') || '[]');

  const [billFormData, setBillFormData] = useState({
    region: "",
    projectDescription: "",
    gstNumber: "",
    vendorName: "",
    vendorNo: "",
    compliance206AB: "",
    panStatus: "",
    poCreated: "No",
    poNo: "",
    poDate: "",
    poAmt: "",
    proformaInvNo: "",
    proformaInvAmt: "",
    proformaInvDate: "",
    proformaInvRecdAtSite: "",
    proformaInvRecdBy: "",
    taxInvNo: "",
    taxInvDate: "",
    taxInvAmt: "",
    taxInvRecdAtSite: today,
    taxInvRecdBy: "",
    currency: "INR",
    department: "",
    remarks: "",
    attachment: "",
    natureOfWork: "",
    vendor: null,
    billDate: "",
    amount: "",
    advDate: "",
    advAmt: "",
    advPercent: "",
    advReqEnteredBy: "",
  });
  const [vendorsData, setVendorsData] = useState([]);
  const [natureOfWorkOptions, setNatureOfWorkOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorSuggestions, setVendorSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [files, setFiles] = useState([]);

  const [natureOfWork, setNatureOfWork] = useState();
  const [currentRole, setCurrentRole] = Cookies.get("userRole");

  const [responseBill, setResponseBill] = useState();

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "application/rtf": [".rtf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
      "video/mp4": [".mp4"],
      "video/x-msvideo": [".avi"],
      "video/quicktime": [".mov"],
      "video/x-ms-wmv": [".wmv"],
      "video/webm": [".webm"],
      "video/x-matroska": [".mkv"],
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "audio/ogg": [".ogg"],
      "audio/aac": [".aac"],
    },
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get(vendors, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        });
        console.log(res.data);
        setVendorsData(res.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const headers = { Authorization: `Bearer ${Cookies.get("token")}` };

        const [naturesRes, currenciesRes] = await Promise.all([
          axios.get(natureOfWorks, { headers }),
          axios.get(currencies, { headers }),
        ]);

        const sortedNatureRes = naturesRes.data.sort((a, b) => {
          return String(a.natureOfWork).localeCompare(String(b.natureOfWork), undefined, {sensitivity: 'base'});
        })

        console.log("available regions: ", availableRegions);
        const sortedAvailableRegions = availableRegions.sort((a, b) => {
          return String(a).localeCompare(String(b), undefined, {sensitivity: 'base'});
        })

        setNatureOfWorkOptions(sortedNatureRes || []);
        setRegionOptions(sortedAvailableRegions);
        setCurrencyOptions(currenciesRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Failed to fetch some dropdown options");
      }
    };

    fetchDropdownData();
  }, []);

  const validateVendorNo = (x) => /^[0-9]{6}$/.test(x);
  const validatePoNo = (x) => /^[0-9]{10}$/.test(x);
  const validateTaxInvNo = (x) => /^[a-zA-Z0-9\-\/\.\\\_]{0,16}$/.test(x);

  const handleVendorLookup = async (e) => {
    if (e.key === "Enter" && billFormData.vendorNo) {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (!validateVendorNo(billFormData.vendorNo)) {
          toast.error('Vendor Number should be 6 Numbers');
          return;
        }
        else if (!validateTaxInvNo(billFormData.taxInvNo)) {
          toast.error('Tax Invoice Number can be max 16 characters');
          return;
        }
        else {
          const vendor = vendorsData.find(
            (v) => v.vendorNo.toString() === billFormData.vendorNo
          );

          if (vendor) {
            console.log("Found vendor data:", {
              vendorName: vendor.vendorName,
              complianceStatus: vendor.complianceStatus,
            });

            const updates = {
              vendorName: vendor.vendorName,
              vendorNo: vendor.vendorNo.toString(),
              vendor: vendor._id,
            };

            if (vendor.GSTNumber !== "Not Provided") {
              updates.gstNumber = vendor.GSTNumber;
            }

            if (vendor.PANStatus !== "Not Provided") {
              updates.panStatus = vendor.PANStatus;
            }

            if (vendor.complianceStatus !== "Not Provided") {
              updates.compliance206AB = vendor.complianceStatus;
            }

            console.log("Applying updates:", updates);

            setBillFormData((prev) => ({
              ...prev,
              ...updates,
            }));

            setTimeout(() => {
              console.log("Form data after update:", billFormData);
            }, 0);
          } else {
            const updates = {
              vendorName: "",
              gstNumber: "",
              compliance206AB: "",
              panStatus: "",
            };

            setBillFormData((prev) => ({
              ...prev,
              ...updates,
            }));
            console.log("Vendor not found");
            toast.error("Vendor not found");
          }
        }
      } catch (error) {
        console.error("Error looking up vendor:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }
  };

  const handleVendorNameChange = (e) => {
    const value = e.target.value;
    setBillFormData((prev) => ({ ...prev, vendorName: value }));

    if (value.length > 0) {
      const searchTerm = value.toLowerCase();
      const filteredVendors = vendorsData
        .filter((vendor) =>
          vendor.vendorName.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => {
          const aStartsWith = a.vendorName.toLowerCase().startsWith(searchTerm);
          const bStartsWith = b.vendorName.toLowerCase().startsWith(searchTerm);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.vendorName.localeCompare(b.vendorName);
        });

      setVendorSuggestions(filteredVendors);
      setShowSuggestions(true);
    } else {
      setVendorSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handlePoNoLookup = async (e) => {
    if (e.key === "Enter" && billFormData.poNo) {
      e.preventDefault();
      setIsLoading(true);
      try {
        if (!validatePoNo(billFormData.poNo)) {
          toast.error('PO Number should be 10 digits');
        }
      }
      catch (error) {
        console.error("Error in po no:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }

    }
  }

  const handleSuggestionClick = async (vendor) => {
    setIsLoading(true);

    const updates = {
      vendorName: vendor.vendorName,
      vendorNo: vendor.vendorNo.toString(),
      vendor: vendor._id,
    };

    if (vendor.GSTNumber !== "Not Provided") {
      updates.gstNumber = vendor.GSTNumber;
    }

    if (vendor.PANStatus !== "Not Provided") {
      updates.panStatus = vendor.PANStatus;
    }

    if (vendor.complianceStatus !== "Not Provided") {
      updates.compliance206AB = vendor.complianceStatus;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    setBillFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    setShowSuggestions(false);
    setIsLoading(false);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .bill-form select {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background: white url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>") no-repeat right 0.75rem center;
        padding-right: 2.5rem;
      }
      .bill-form select::-webkit-scrollbar {
        width: 6px;
      }
      .bill-form select::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
      .bill-form select::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
      }
      .bill-form select::-webkit-scrollbar-thumb:hover {
        background: #555;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.5); }
        to { opacity: 1; transform: scale(1); }
      }

      @keyframes slideDown {
        from { transform: translateY(-50px); }
        to { transform: translateY(0); }
      }

      @keyframes checkmark {
        from { stroke-dashoffset: 100; }
        to { stroke-dashoffset: 0; }
      }

      .success-overlay {
        animation: fadeIn 0.3s ease-out;
      }

      .success-modal {
        animation: slideDown 0.3s ease-out;
      }

      .success-checkmark {
        stroke-dasharray: 100;
        animation: checkmark 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [billImage, setBillImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { id, type, files, value } = e.target;

    if (id === "attachment" && files && files[0]) {
      setBillImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
      setBillFormData((prevData) => ({
        ...prevData,
        attachment: files[0].name,
      }));
    } else {
      if (id === "vendorNo") {
        const numericValue = value.replace(/[^0-9]/g, "");
        if (numericValue.length > 6) {
          toast.error('Vendor Number should be 6 digits');
          return;
        }
        setBillFormData((prev) => ({
          ...prev,
          [id]: numericValue,
        }));
        return;
      }
      if (id === "poNo" && value.length > 10) {
        if (!validatePoNo(billFormData.poNo)) {
          toast.error('PO NO should be 10 digits');
          return;
        }
      }
      if (id === "taxInvNo" && value.length > 16) {
        toast.error('Tax Invoice Number should be 16 digits');
        return;
      }
      if (id === "natureOfWork") {
        setBillFormData((prevData) => ({
          ...prevData,
          natureOfWork: value,
        }));
      }

      const amountFieldRegex = /(Amt|amt|Amount|amount)/;
      if (amountFieldRegex.test(id)) {
        let sanitized = String(value).replace(/[^0-9.]/g, "");
        const parts = sanitized.split('.');
        if (parts.length > 2) {
          sanitized = parts.shift() + '.' + parts.join('');
        }
        setBillFormData((prevData) => ({
          ...prevData,
          [id]: sanitized,
        }));
        return;
      }

      setBillFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();

    try {
      if (!validateVendorNo(billFormData.vendorNo) && !validatePoNo(billFormData.poNo)) {
        toast.error('Vendor Number should be 6 Numbers\nPO No should be 10 Digits');
        return;
      }
      if (!validateVendorNo(billFormData.vendorNo)) {
        toast.error('Vendor Number should be 6 Numbers');
        return;
      }
      if (billFormData.poNo && !validatePoNo(billFormData.poNo)) {
        toast.error('PO Number should be 10 Digits');
        return;
      }

      const requiredFields = [
        "natureOfWork",
        "region",
        "projectDescription",
        "vendorName",
        "vendorNo",
        "poCreated",
        "taxInvRecdAtSite",
        // "taxInvRecdBy",
        // "department",
      ];

      const missingFields = requiredFields.filter(
        (field) => !billFormData[field]
      );

      if (missingFields.length > 0) {
        toast.error(
          `Please fill in required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      const updatedFormData = {
        ...billFormData,
        billDate: new Date().toISOString().split("T")[0],
        amount: 0,
        siteStatus: "hold",
        currency: billFormData.currency || "INR",
        natureOfWork: billFormData.natureOfWork,
      };

      setBillFormData(updatedFormData);

      Object.keys(updatedFormData).forEach((key) => {
        formData.append(key, updatedFormData[key]);
      });

      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      // Add role=3 query parameter if user is site_pimo
      const queryParams = currentUserRole === "site_pimo" ? "?role=3" : "";
      const res = await axios.post(`${bills}${queryParams}`, formData, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        "Content-Type": "multipart/form-data",
      });

      console.log("nature of work: ", res.data.bill.natureOfWork);

      if (res.status === 200 || res.status === 201) {
        setShowSuccess(true);

        setNatureOfWork(res.data.bill.natureOfWork);
        console.log("Bill response: ", res.data.bill);

        setResponseBill(res.data.bill);

        setTimeout(() => {

          console.log("nature of work:", billFormData.natureOfWork);

          if (billFormData.natureOfWork === "Direct FI Entry") {
            navigate("/checklist-directFI2", {
              state: {
                selectedRows: [res.data.bill],
                bills: [res.data.bill],
              },
            });
          }

          else if (billFormData.natureOfWork === "Advance/LC/BG") {
            navigate("/checklist-advance2", {
              state: {
                selectedRows: [res.data.bill],
                bills: [res.data.bill],
              },
            });
          }

          else if (currentRole === "site_officer") {
            navigate("/checklist-bill-journey", {
              state: {
                selectedRows: [res.data.bill],
                bills: [res.data.bill],
              },
            });
          } else {
            navigate("/");
          }

        }, 3000);

      }
    } catch (error) {
      console.error("Error submitting bill:", error);
      toast.error(error.response?.data?.message || "Error creating bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBillFormData({
      region: "",
      projectDescription: "",
      gstNumber: "",
      vendorName: "",
      vendorNo: "",
      compliance206AB: "",
      panStatus: "",
      poCreated: "No",
      poNo: "",
      poDate: "",
      poAmt: "",
      proformaInvNo: "",
      proformaInvAmt: "",
      proformaInvDate: "",
      proformaInvRecdAtSite: "",
      proformaInvRecdBy: "",
      taxInvNo: "",
      taxInvDate: "",
      taxInvAmt: "",
      taxInvRecdAtSite: today,
      taxInvRecdBy: "",
      currency: "INR",
      department: "",
      remarks: "",
      attachment: "",
      natureOfWork: "",
      advDate: "",
      advAmt: "",
      advPercent: "",
      advReqEnteredBy: "",
    });
    setBillImage(null);
  };

  return (
    <div className="bg-white text-black pb-2">
      <Header />
      {isLoading && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-lg">Getting vendor details...</p>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-lg">Creating bill...</p>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 success-overlay">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center success-modal">
            <div className="w-16 h-16 mx-auto mb-4 text-green-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" className="success-checkmark" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Bill Created Successfully!
            </h2>
            <p> Bill SrNo: {responseBill.srNo} </p>
            <p className="text-gray-600 mt-2">Redirecting to checklist...</p>
          </div>
        </div>
      )}

      <div className="max-w-[92.55vw] border-2 border-[#4E4E4E25] rounded-xl p-[3vh_2vw] font-arial mx-auto bill-form">
        <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">
          Bill Details
        </h1>
        {/* First Section: Invoice and Region */}
        <div>
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="natureOfWork"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Nature Of Work *
              </label>
              <select
                id="natureOfWork"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                value={billFormData.natureOfWork}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>
                  Select Nature of Work
                </option>
                {natureOfWorkOptions.map((nature) => (
                  <option key={nature._id} value={nature.natureOfWork}>
                    {nature.natureOfWork}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="region"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Region *
              </label>
              <select
                id="region"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                value={billFormData.region}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>
                  Select Region
                </option>
                {regionOptions.map((region, i) => (
                  <option key={i} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project and GST Details */}
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="projectDescription"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Project Description *
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="projectDescription"
                value={billFormData.projectDescription}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="gstNumber"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                GST Number
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-gray-50 cursor-not-allowed shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="gstNumber"
                value={billFormData.gstNumber}
                readOnly
              />
            </div>
          </div>

          {/* Vendor and Compliance Details */}
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="vendorName"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Vendor Name *
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="vendorName"
                value={billFormData.vendorName}
                onChange={handleVendorNameChange}
                autoComplete="off"
                required
              />
              {showSuggestions && vendorSuggestions.length > 0 && (
                <div className="absolute w-5/6 max-h-[200px] overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {vendorSuggestions.map((vendor, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm transition-colors duration-200"
                      onClick={() => handleSuggestionClick(vendor)}
                    >
                      {vendor.vendorNo} - {vendor.vendorName} - {vendor.GSTNumber}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="vendorNo"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Vendor No *
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="vendorNo"
                value={billFormData.vendorNo}
                onChange={handleChange}
                onKeyDown={handleVendorLookup}
                pattern="\d{6}"
                maxLength={6}
                title="Vendor No must be exactly 6 digits"
                required
              />
            </div>
          </div>

          {/* Compliance and PAN Status */}
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="compliance206AB"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                206AB Compliance
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-gray-50 cursor-not-allowed shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="compliance206AB"
                value={billFormData.compliance206AB}
                readOnly
              />
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="panStatus"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                PAN Status
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-gray-50 cursor-not-allowed shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="panStatus"
                value={billFormData.panStatus}
                readOnly
              />
            </div>
          </div>
        </div>
        {/* PO Details Section */}
        <div>
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="poCreated"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Is PO already Created? *
              </label>
              <select
                id="poCreated"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                value={billFormData.poCreated}
                onChange={handleChange}
                required
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="poNo"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                PO No.
              </label>
              <input
                type="text"
                className={`w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] 
                  ${billFormData.poCreated === "No"
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                  }`}
                id="poNo"
                value={billFormData.poNo}
                onChange={handleChange}
                onKeyDown={handlePoNoLookup}
                pattern="\d{10}"
                maxLength={10}
                title="PO No must be exactly 10 digits"
                disabled={billFormData.poCreated === "No"}
                required={billFormData.poCreated === "Yes"}
              />
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="poDate"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                PO Date
              </label>
              <input
                type="date"
                className={`w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]
                  ${billFormData.poCreated === "No"
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                  }`}
                id="poDate"
                value={billFormData.poDate}
                onChange={handleChange}
                disabled={billFormData.poCreated === "No"}
                required={billFormData.poCreated === "Yes"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="poAmt"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                PO Amount
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                className={`w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]
                  ${billFormData.poCreated === "No"
                    ? "bg-gray-100 cursor-not-allowed"
                    : "bg-white"
                  }`}
                id="poAmt"
                value={billFormData.poAmt}
                onChange={handleChange}
                disabled={billFormData.poCreated === "No"}
                required={billFormData.poCreated === "Yes"}
              />
            </div>
          </div>
        </div>
        {/* Proforma Invoice Details */}
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="proformaInvNo"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Proforma Invoice No
            </label>
            <input
              type="text"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="proformaInvNo"
              value={billFormData.proformaInvNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative mb-[2.5vh]">
            <label
              htmlFor="proformaInvDate"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Proforma Inv Date
            </label>
            <input
              type="date"
              className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="proformaInvDate"
              value={billFormData.proformaInvDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="proformaInvAmt"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Proforma Invoice Amount
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="proformaInvAmt"
              value={billFormData.proformaInvAmt}
              onChange={handleChange}
              required
            />
          </div>

          <div className="relative mb-[4vh]">
            <label
              htmlFor="proformaInvRecdAtSite"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Proforma Inv Recd at Site
            </label>
            <input
              type="date"
              className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="proformaInvRecdAtSite"
              value={billFormData.proformaInvRecdAtSite}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="proformaInvRecdBy"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Proforma Invoice Received By
            </label>
            <input
              type="text"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="proformaInvRecdBy"
              value={billFormData.proformaInvRecdBy}
              onChange={handleChange}
              required
            />
          </div>
          <div></div>
        </div>
        {/* Tax Invoice and Final Details */}
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="taxInvNo"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Tax Invoice No.
            </label>
            <input
              type="text"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="taxInvNo"
              value={billFormData.taxInvNo}
              onChange={handleChange}
              pattern="[A-Za-z0-9]{16}"
              maxLength={16}
              title="Tax Invoice No must be exactly 16 alphanumeric characters"
              required
            />
          </div>

          <div className="relative mb-[2.5vh]">
            <label
              htmlFor="taxInvDate"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Tax Inv Date
            </label>
            <input
              type="date"
              className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="taxInvDate"
              value={billFormData.taxInvDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="currency"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Currency
            </label>
            <select
              id="currency"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
              value={billFormData.currency}
              onChange={handleChange}
              required
            >
              <option value="" disabled hidden>
                Select Currency
              </option>
              {currencyOptions.map((currency) => (
                <option key={currency._id} value={currency.currency}>
                  {currency.currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="taxInvAmt"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Tax Invoice Amount
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="taxInvAmt"
              value={billFormData.taxInvAmt}
              onChange={handleChange}
              required
            />
          </div>
          <div className="relative mb-[4vh]">
            <label
              htmlFor="taxInvRecdAtSite"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Invoice Received At Site *
            </label>
            <input
              type="date"
              className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="taxInvRecdAtSite"
              value={billFormData.taxInvRecdAtSite}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="taxInvRecdBy"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Tax Inv Received By
            </label>
            <input
              type="text"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="taxInvRecdBy"
              value={billFormData.taxInvRecdBy}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[4vh]">
            <label
              htmlFor="department"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Additional Info
            </label>
            <input
              type="text"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="department"
              value={billFormData.department}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[2vw]">
          <div className="relative mb-[2.5vh]">
            <label
              htmlFor="remarks"
              className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
            >
              Remarks by Site Team
            </label>
            <input
              type="text"
              className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
              id="remarks"
              value={billFormData.remarks}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        {/* File Upload Section */}
        {/* <div className="border border-dashed border-[#ccc] p-[2vh_2vw] text-center rounded-[0.5vw] mt-[2vh] w-[57vw] h-[45vh] relative">
          <label
            htmlFor="attachment"
            className="absolute inset-0 w-full h-full cursor-pointer flex flex-col items-center justify-center"
          >
            {imagePreview ? (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Bill preview"
                  className="max-w-[250px] max-h-[250px] object-contain mx-auto"
                />
              </div>
            ) : (
              <>
                <p className="text-[#666] text-[1vw]">
                  Upload image of the bill
                </p>
                <img
                  src={imageBox}
                  alt="Upload placeholder"
                  className="w-[6vw] h-[6vw] mb-[1vh]"
                />
              </>
            )}
            {billImage && (
              <p className="text-[#666] text-[0.8vw] mt-2">{billImage.name}</p>
            )}
          </label>
          <input
            type="file"
            id="attachment"
            onChange={handleChange}
            accept="image/*"
            className="hidden"
            required
          />
        </div> */}
        <div className="w-1/2">
          <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">
            Advance Details
          </h1>

          <div>
            <div className="relative mb-[4vh]">
              <label
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                htmlFor="advDate"
              >
                Advance Date
              </label>
              <input
                type="date"
                className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                id="advDate"
                value={billFormData.advDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative mb-[4vh]">
              <label
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                htmlFor="advAmt"
              >
                Advance Amount
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9.]*"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="advAmt"
                value={billFormData.advAmt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative mb-[4vh]">
              <label
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                htmlFor="advPercent"
              >
                Advance Percentage
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="advPercent"
                value={billFormData.advPercent}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative mb-[4vh]">
              <label
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                htmlFor="advReqEnteredBy"
              >
                Advance Request Entered By{" "}
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="advReqEnteredBy"
                value={billFormData.advReqEnteredBy}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg px-6 py-2 space-y-4 ont-semibold text-[#01073F]">
          <div>
            <h2 className="text-lg font-semibold">Attachments</h2>
          </div>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-[#011A99] rounded-lg p-8 text-center cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Drop files here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to select files
                </p>
              </div>
            </div>
          </div>
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files</p>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-accent/30 rounded-md"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <Paperclip className="h-4 w-4 shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4 cursor-pointer hover:bg-gray-200 hover:rounded-3xl" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        className="flex justify-center items-center bg-[#011A99] text-white mt-[12vh] w-[84vw] h-[6.8vh] border-none rounded-[0.5vw] cursor-pointer text-[2.5vh] mx-auto hover:bg-[#021678] active:bg-[#004085]"
        type="submit"
        onClick={handleSubmitForm}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create"}
      </button>
    </div>
  );
};

export default FullBillDetails;
