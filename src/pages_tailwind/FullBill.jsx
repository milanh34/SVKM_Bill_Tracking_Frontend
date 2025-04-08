import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import { bills } from "../apis/bills.api";
import imageBox from "../assets/img-box.svg";

const FullBillDetails = () => {
  useEffect(() => {
    const style = document.createElement('style');
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
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [billFormData, setBillFormData] = useState({
    invoiceType: "",
    region: "",
    projectDesc: "",
    gstNo: "",
    vendorName: "",
    vendorNo: "",
    compliance206: "",
    panStatus: "",
    poCreated: "No",
    poNo: "",
    poDate: "",
    poAmt: "",
    proformaInvNo: "",
    proformaInvAmt: "",
    proformaInvDate: "",
    proformaInvRecdDate: "",
    taxInvNo: "",
    taxInvDate: "",
    taxInvAmt: "",
    taxInvRecdBy: "",
    currency: "",
    department: "",
    remarks: "",
    billImg: "",
    natureOfWork: "others",
  });

  const [billImage, setBillImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { id, type, files } = e.target;

    if (id === "billImg" && files && files[0]) {
      setBillImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
      setBillFormData((prevData) => ({
        ...prevData,
        billImg: files[0].name,
      }));
    } else {
      setBillFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  // Clean up the preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const dateInputRef = useRef(null);

  const handleInputClick = () => {
    dateInputRef.current?.focus();
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append all form data
    Object.keys(billFormData).forEach((key) => {
      formData.append(key, billFormData[key]);
    });

    // Append bill image if exists
    if (billImage) {
      formData.append("billImgFile", billImage);
    }

    fetch(bills, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        alert("Bill details submitted successfully");
        // Optional: Reset form after successful submission
        resetForm();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error submitting bill details");
      });
  };

  const resetForm = () => {
    setBillFormData({
      invoiceType: "",
      region: "",
      projectDesc: "",
      gstNo: "",
      vendorName: "",
      vendorNo: "",
      compliance206: "",
      panStatus: "",
      poCreated: "No",
      poNo: "",
      poDate: "",
      poAmt: "",
      proformaInvNo: "",
      proformaInvAmt: "",
      proformaInvDate: "",
      proformaInvRecdDate: "",
      taxInvNo: "",
      taxInvDate: "",
      taxInvAmt: "",
      taxInvRecdBy: "",
      currency: "",
      department: "",
      remarks: "",
      billImg: "",
      natureOfWork: "others",
    });
    setBillImage(null);
  };

  return (
    <div className="bg-white text-black pb-2">
      <Header />

      <div className="max-w-[92.55vw] border-2 border-[#4E4E4E25] rounded-xl p-[3vh_2vw] font-arial mx-auto bill-form">
        <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">
          Bill Details
        </h1>

        {/* First Section: Invoice and Region */}
        <div>
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="invoiceType"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Type of Invoice
              </label>
              <select
                id="invoiceType"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                value={billFormData.invoiceType}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>
                  Select Type of Invoice
                </option>
                <option value="Proforma Invoice">Proforma Invoice</option>
                <option value="Credit Note">Credit Note</option>
                <option value="Advance/LC/BG">Advance/LC/BG</option>
                <option value="Direct FI Entry">Direct FI Entry</option>
                <option value="Utility Work">Utility Work</option>
                <option value="Petty cash">Petty cash</option>
                <option value="Hold/Ret Release">Hold/Ret Release</option>
                <option value="Imports">Imports</option>
                <option value="Equipments">Equipments</option>
                <option value="Materials">Materials</option>
                <option value="IT related">IT related</option>
                <option value="IBMS">IBMS</option>
                <option value="Consultancy bill">Consultancy bill</option>
                <option value="Civil Works">Civil Works</option>
                <option value="Petrol/Diesel">Petrol/Diesel</option>
                <option value="STP Work">STP Work</option>
                <option value="HVAC Work">HVAC Work</option>
                <option value="MEP Work">MEP Work</option>
                <option value="Fire Fighting Work">Fire Fighting Work</option>
                <option value="Painting work">Painting work</option>
                <option value="Site Infra">Site Infra</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Housekeeping/Security">
                  Housekeeping/Security
                </option>
                <option value="Overheads">Overheads</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="region"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Region
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
                <option value="MUMBAI">MUMBAI</option>
                <option value="KHARGHAR">KHARGHAR</option>
                <option value="AHMEDABAD">AHMEDABAD</option>
                <option value="BANGALURU">BANGALURU</option>
                <option value="BHUBANESHWAR">BHUBANESHWAR</option>
                <option value="CHANDIGARH">CHANDIGARH</option>
                <option value="DELHI">DELHI</option>
                <option value="NOIDA">NOIDA</option>
                <option value="NAGPUR">NAGPUR</option>
                <option value="GANSOLI">GANSOLI</option>
                <option value="HOSPITAL">HOSPITAL</option>
                <option value="DHULE">DHULE</option>
                <option value="SHIRPUR">SHIRPUR</option>
                <option value="INDORE">INDORE</option>
                <option value="HYDERABAD">HYDERABAD</option>
              </select>
            </div>
          </div>

          {/* Project and GST Details */}
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="projectDesc"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Project Description
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="projectDesc"
                value={billFormData.projectDesc}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="gstNo"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                GST Number
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="gstNo"
                value={billFormData.gstNo}
                onChange={handleChange}
                required
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
                Vendor Name
              </label>
              <input
                type="text"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="vendorName"
                value={billFormData.vendorName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="vendorNo"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Vendor No
              </label>
              <input
                type="number"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="vendorNo"
                value={billFormData.vendorNo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Compliance and PAN Status */}
          <div className="grid grid-cols-2 gap-[2vw]">
            <div className="relative mb-[4vh]">
              <label
                htmlFor="compliance206"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                206AB Compliance
              </label>
              <select
                id="compliance206"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                value={billFormData.compliance206}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>
                  Select 206AB Compliance
                </option>
                <option value="206AB Check on Website">
                  206AB Check on Website
                </option>
                <option value="2024-Specified Person U/S 206AB">
                  2024-Specified Person U/S 206AB
                </option>
                <option value="2024-Non-Specified Person U/S 206AB">
                  2024-Non-Specified Person U/S 206AB
                </option>
                <option value="2025-Specified Person U/S 206AB">
                  2025-Specified Person U/S 206AB
                </option>
                <option value="2025-Non-Specified Person U/S 206AB">
                  2025-Non-Specified Person U/S 206AB
                </option>
              </select>
            </div>

            <div className="relative mb-[2.5vh]">
              <label
                htmlFor="panStatus"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                PAN Status
              </label>
              <select
                id="panStatus"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                value={billFormData.panStatus}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>
                  Select PAN Status
                </option>
                <option value="PAN operative/N.A">PAN operative/N.A</option>
                <option value="PAN inoperative">PAN inoperative</option>
              </select>
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
                Is PO already Created?
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
            <div></div>
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
                type="number"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="poNo"
                value={billFormData.poNo}
                onChange={handleChange}
                required
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
                className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="poDate"
                value={billFormData.poDate}
                onChange={handleChange}
                required
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
                type="number"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="poAmt"
                value={billFormData.poAmt}
                onChange={handleChange}
                required
              />
            </div>
            <div></div>
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
                type="number"
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
                type="number"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="proformaInvAmt"
                value={billFormData.proformaInvAmt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative mb-[4vh]">
              <label
                htmlFor="proformaInvRecdDate"
                className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
              >
                Proforma Inv Recd at Site
              </label>
              <input
                type="date"
                className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="proformaInvRecdDate"
                value={billFormData.proformaInvRecdDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Tax Invoice and Final Details */}
        <div className="mb-[60px]">
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
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="RMB">RMB</option>
                <option value="EURO">EURO</option>
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
                type="number"
                className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                id="taxInvAmt"
                value={billFormData.taxInvAmt}
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
                Department
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
        </div>

        {/* File Upload Section */}
        <div className="border border-dashed border-[#ccc] p-[2vh_2vw] text-center rounded-[0.5vw] mt-[2vh] w-[57vw] h-[45vh] relative">
          <label
            htmlFor="billImg"
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
            id="billImg"
            onChange={handleChange}
            accept="image/*"
            className="hidden"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          className="flex justify-center items-center bg-[#011A99] text-white mt-[12vh] w-[84vw] h-[6.8vh] border-none rounded-[0.5vw] cursor-pointer text-[2.5vh] mx-auto hover:bg-[#021678] active:bg-[#004085]"
          type="submit"
          onClick={handleSubmitForm}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default FullBillDetails;
