import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import print from "../assets/print.svg";
import logo from "../assets/logo.png";
import pen from "../assets/pen.svg";
import { vendors } from "../apis/vendor.api";
import axios from "axios";
import Cookies from "js-cookie";

const ITEMS_PER_PAGE = 1;

const ChecklistAccount = () => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);
  const printRef = useRef();
  const [isEditable, setIsEditable] = useState(false);
  const [vendorPANMap, setVendorPANMap] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(vendors, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        });
        console.log("Vendors data:", response.data);
        
        // Create map of vendor numbers to their PANs
        const panMap = {};
        response.data.forEach(vendor => {
          if (vendor.vendorNo && vendor.PAN) {
            panMap[vendor.vendorNo] = vendor.PAN;
          }
        });
        setVendorPANMap(panMap);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  const [formData, setFormData] = useState({
    taxInvoiceAttached: "",
    projectInchargeApproval: "",
    projectLocation: "",
    trusteeApproval: "",
    invoiceAmount: "",
    tdsCement: "",
    gstCharged: "",
    deliveryChallan: "",
    deliveryChallanStamp: "",
    ewayBill: "",
    loadingUnloadingAmount: "",
    purchaseOrderAttached: "",
    vendorGst: "",
    gstStatus: "",
    gleedsCertificationAmount: "",
    retentionAmount: "",
    billHoldAmount: "",
    earlierBillHoldReleaseAmount: "",
    measurementSheet: "",
    others: "",
    advanceVendorAccount: "",
    advanceAdjustThisInvoice: "",
    netPayable: "",
    projectCampus: "",
  });

  console.log("Bills Data:", billsData);

  const handlePrint = () => {
    const win = window.open("", "_blank");

    const printStyles = `
            <style>
                @media print {
                    @page {
                        margin: 10mm;
                        size: A4;
                    }
                    body { 
                        padding: 5px;
                        margin: 10px;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    }
                    .checklist-page {
                        width: 100%;
                        margin: 0 auto;
                        page-break-after: always;
                    }
                    .content-row {
                        padding: 8px;
                        font-size: 0.875rem;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .grid-row {
                        display: grid;
                        padding: 8px;
                        font-size: 0.875rem;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .grid-3 {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                    }
                    // ... rest of your print styles
                }
            </style>
        `;

    // ... rest of print function implementation similar to ChecklistBillJourney
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = billsData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleRadioChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const toggleEditMode = () => {
    setIsEditable(!isEditable);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add submission logic here
  };

  return (
    <>
      <Header />

      <div className="flex items-center justify-between px-20 mt-5">
        <button
          className="btn print"
          onClick={handlePrint}
          style={{
            width: "fit-content",
            padding: "1vh 2vw",
            display: "flex",
            alignItems: "center",
            background: "#208AF0",
            marginLeft: "auto",
            gap: "10px",
          }}
        >
          Print All Account Checklist <img src={print} alt="Print Icon" />
        </button>
      </div>

      <div className="overflow-x-auto p-6 bg-gray-50 min-h-screen">
        {currentItems.map((item, index) => (
          <div key={index}>
            <div className="w-full max-w-[90%] mx-auto">
              <div className="border border-gray-300 bg-white font-semibold">
                <div className="grid grid-cols-3 bg-gray-200 items-center">
                  <div className="p-2 border-b border-gray-300 flex items-center">
                    <div className="text-sm font-semibold">
                      <img src={logo} alt="" className="h-10" />
                    </div>
                    &nbsp; &nbsp;
                    <div className="text-sm">
                      Region-Project Name: {item?.region} -{" "}
                      {item?.projectDescription}
                    </div>
                  </div>
                  <div className="border-gray-300">
                    <div className="text-sm text-center">{item?.srNo}</div>
                  </div>
                  <div className="border-gray-300">
                    <div className="text-sm text-center">Due Date:</div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>Invoice No: {item?.taxInvNo}</div>
                    <div>Dt: {formatDate(item?.taxInvDate)}</div>
                    <div>
                      Nature of Work: {item?.typeOfInv || item?.natureOfWork}
                    </div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">Vendor Description: {item?.vendorName}</div>
                    <div>Vendor code: {item?.vendorNo}</div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">
                      PO Number and Date: {item?.poNo}{" "}
                      &nbsp;  &nbsp;    
                      {formatDate(item?.poDate)}
                    </div>
                    <div>
                      PO Amt: {item?.currency} {item?.poAmt}
                    </div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">Vendor GST No & PAN as per SAP: {item?.gstNumber || ''} / {vendorPANMap[item?.vendorNo] || ''}</div>
                    <div>LC exists in vendor A/c: &nbsp; Yes / No</div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">Compliance u/s 206AB: {item?.compliance206AB}</div>
                    <div>Pan Status: {item?.panStatus}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your existing table code */}
            <div className="w-full max-w-[90%] mx-auto flex flex-col gap-4">
              <div className="bg-white rounded shadow p-6 max-w-6xl mx-auto">
                <div className="checklist-header">
                  <h1 className="text-xl font-bold text-blue-800 mb-6">
                    Account Checklist
                  </h1>
                  <button
                    className="edit-button no-print"
                    onClick={toggleEditMode}
                    style={{
                      backgroundColor: isEditable ? "green" : "#011A99",
                      color: "white",
                    }}
                  >
                    {isEditable ? "Save" : "Edit"}
                    <img
                      src={pen}
                      style={{ background: "transparent" }}
                      alt="edit icon"
                    />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                            Description
                          </th>
                          <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                            Remarks
                          </th>
                          <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                            Additional remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Row 1 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Vendor Original Tax Invoice attached
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex gap-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="taxInvoice"
                                  value="Yes"
                                  checked={
                                    formData.taxInvoiceAttached === "Yes"
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      "taxInvoiceAttached",
                                      "Yes"
                                    )
                                  }
                                  className="mr-1"
                                />
                                Yes
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="taxInvoice"
                                  value="No"
                                  checked={formData.taxInvoiceAttached === "No"}
                                  onChange={() =>
                                    handleRadioChange(
                                      "taxInvoiceAttached",
                                      "No"
                                    )
                                  }
                                  className="mr-1"
                                />
                                No
                              </label>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <span>SAP doc no.</span>
                              <input
                                type="text"
                                className="border border-gray-300 p-1 w-full"
                              />
                            </div>
                          </td>
                        </tr>

                        {/* Row 2 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Invoice Approved By Project Incharge
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <select
                                className="border border-gray-300 p-1 w-full"
                                value={formData.projectInchargeApproval}
                                onChange={(e) =>
                                  handleInputChange(
                                    "projectInchargeApproval",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select</option>
                                <option value="VP">VP</option>
                                <option value="JKB">JKB</option>
                                <option value="RB">RB</option>
                                <option value="DG">DG</option>
                                <option value="PP">PP</option>
                              </select>

                              <select
                                className="border border-gray-300 p-1 w-full"
                                value={formData.projectLocation}
                                onChange={(e) =>
                                  handleInputChange(
                                    "projectLocation",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select Location</option>
                                <option value="Shirpur">Shirpur</option>
                                <option value="Dhule">Dhule</option>
                              </select>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  Same bill no.in vendor ledger:
                                </span>
                                <label className="flex items-center mr-2">
                                  <input
                                    type="radio"
                                    name="sameBillNo"
                                    value="Yes"
                                    className="mr-1"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="sameBillNo"
                                    value="No"
                                    className="mr-1"
                                  />
                                  No
                                </label>
                              </div>

                              <div className="flex items-center">
                                <span className="mr-2">Migo Entry done:</span>
                                <label className="flex items-center mr-2">
                                  <input
                                    type="radio"
                                    name="migoEntry"
                                    value="Yes"
                                    className="mr-1"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="migoEntry"
                                    value="No"
                                    className="mr-1"
                                  />
                                  No
                                </label>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 3 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Invoice Approved By Trustee
                          </td>
                          <td className="border border-gray-300 p-2">
                            <select
                              className="border border-gray-300 p-1 w-full"
                              value={formData.trusteeApproval}
                              onChange={(e) =>
                                handleInputChange(
                                  "trusteeApproval",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select</option>
                              <option value="HS">HS</option>
                              <option value="HC">HC</option>
                              <option value="JP">JP</option>
                              <option value="JK">JK</option>
                              <option value="BP">BP</option>
                              <option value="RB">RB</option>
                              <option value="Member-LMC">Member-LMC</option>
                            </select>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  IS PO no mentioned on Bill?
                                </span>
                                <label className="flex items-center mr-2">
                                  <input
                                    type="radio"
                                    name="poMentioned"
                                    value="Yes"
                                    className="mr-1"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="poMentioned"
                                    value="No"
                                    className="mr-1"
                                  />
                                  No
                                </label>
                              </div>

                              <div className="flex items-center">
                                <span className="mr-2">
                                  IS PO no mentioned is correct?
                                </span>
                                <label className="flex items-center mr-2">
                                  <input
                                    type="radio"
                                    name="poCorrect"
                                    value="Yes"
                                    className="mr-1"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="poCorrect"
                                    value="No"
                                    className="mr-1"
                                  />
                                  No
                                </label>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 4 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Invoice Amount
                          </td>
                          <td className="border border-gray-300 p-2">
                            <input
                              type="text"
                              placeholder="Column 22 -Column 23"
                              className="border border-gray-300 p-1 w-full"
                              value={formData.invoiceAmount}
                              onChange={(e) =>
                                handleInputChange(
                                  "invoiceAmount",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <span>
                                Bill for Material / services / material +
                                services
                              </span>
                              <select className="border border-gray-300 p-1 w-full">
                                <option value="">Select</option>
                                <option value="Material">Material</option>
                                <option value="Services">Services</option>
                                <option value="Material_Services">
                                  Material + Services
                                </option>
                              </select>
                              <div className="mt-1">
                                <span>
                                  Total Material Purchases -&lt;50lacs/&gt;50
                                  lacs
                                </span>
                                <select className="border border-gray-300 p-1 w-full mt-1">
                                  <option value="">&lt;50lacs</option>
                                  <option value="gt50lacs">&gt;50lacs</option>
                                </select>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 5 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            TDS u/s 194C / 194J/194I or 194Q + TDS
                            deducted-cement/steel,etc
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>
                              <select className="border border-gray-300 p-1 w-full">
                                <option value="">Select TDS Section</option>
                                <option value="194C">194C</option>
                                <option value="194J">194J</option>
                                <option value="194I">194I</option>
                                <option value="194Q">194Q</option>
                              </select>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2"></td>
                        </tr>

                        {/* Row 6 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            TDS deducted on cement/steel,etc.
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center">
                              <span className="mr-2">Rs.</span>
                              <input
                                type="number"
                                className="border border-gray-300 p-1 w-full"
                                value={formData.tdsCement || ""}
                                onChange={(e) =>
                                  handleInputChange("tdsCement", e.target.value)
                                }
                              />
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center">
                              <span className="mr-2">Net amount : Rs.</span>
                              <input
                                type="number"
                                className="border border-gray-300 p-1 w-full"
                              />
                            </div>
                          </td>
                        </tr>

                        {/* Row 7 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Is GST charged in bill
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="gstCharged"
                                    value="Yes"
                                    checked={formData.gstCharged === "Yes"}
                                    onChange={() =>
                                      handleRadioChange("gstCharged", "Yes")
                                    }
                                    className="mr-1"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="gstCharged"
                                    value="No"
                                    checked={formData.gstCharged === "No"}
                                    onChange={() =>
                                      handleRadioChange("gstCharged", "No")
                                    }
                                    className="mr-1"
                                  />
                                  No
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="gstCharged"
                                    value="RCM"
                                    checked={formData.gstCharged === "RCM"}
                                    onChange={() =>
                                      handleRadioChange("gstCharged", "RCM")
                                    }
                                    className="mr-1"
                                  />
                                  RCM
                                </label>
                              </div>
                              <div className="text-sm">(Consult Mr Mekap)</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center">
                                <span className="mr-2">
                                  SVKM GST no mentioned on bill ?
                                </span>
                                <label className="flex items-center mr-2">
                                  <input
                                    type="radio"
                                    name="svkmGst"
                                    value="Yes"
                                    className="mr-1"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="svkmGst"
                                    value="No"
                                    className="mr-1"
                                  />
                                  No
                                </label>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 8 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Vendor Original Delivery Challan
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex gap-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="deliveryChallan"
                                  value="Yes-with stamp"
                                  checked={
                                    formData.deliveryChallan ===
                                    "Yes-with stamp"
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      "deliveryChallan",
                                      "Yes-with stamp"
                                    )
                                  }
                                  className="mr-1"
                                />
                                Yes- with stamp
                              </label>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center">
                                <label className="flex items-center mr-4">
                                  <input
                                    type="radio"
                                    name="deliveryChallanStamp"
                                    value="Yes- w/o stamp"
                                    checked={
                                      formData.deliveryChallanStamp ===
                                      "Yes- w/o stamp"
                                    }
                                    onChange={() =>
                                      handleRadioChange(
                                        "deliveryChallanStamp",
                                        "Yes- w/o stamp"
                                      )
                                    }
                                    className="mr-1"
                                  />
                                  Yes- w/o stamp
                                </label>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="stampBill"
                                    value="No-with stamp on bill"
                                    className="mr-1"
                                  />
                                  No- with stamp on bill
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="stampBill"
                                    value="No-Services"
                                    className="mr-1"
                                  />
                                  No-Services
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name="stampBill"
                                    value="No-w/o stamp on bill"
                                    className="mr-1"
                                  />
                                  No- w/o stamp on bill
                                </label>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 9 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            E-Way bill attached
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayBill"
                                  value="Yes - Part A avbl & Part B avbl"
                                  checked={
                                    formData.ewayBill ===
                                    "Yes - Part A avbl & Part B avbl"
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      "ewayBill",
                                      "Yes - Part A avbl & Part B avbl"
                                    )
                                  }
                                  className="mr-1"
                                />
                                Yes - Part A avbl & Part B avbl
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayBill"
                                  value="Yes - bill to ship to E-Way bill avbl"
                                  checked={
                                    formData.ewayBill ===
                                    "Yes - bill to ship to E-Way bill avbl"
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      "ewayBill",
                                      "Yes - bill to ship to E-Way bill avbl"
                                    )
                                  }
                                  className="mr-1"
                                />
                                Yes - bill to ship to E-Way bill avbl
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayBill"
                                  value="Yes - Works Contract E-way bill avbl"
                                  checked={
                                    formData.ewayBill ===
                                    "Yes - Works Contract E-way bill avbl"
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      "ewayBill",
                                      "Yes - Works Contract E-way bill avbl"
                                    )
                                  }
                                  className="mr-1"
                                />
                                Yes - Works Contract E-way bill avbl
                              </label>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayStatus"
                                  value="No - distance < 50 kms"
                                  className="mr-1"
                                />
                                No - distance &lt; 50 kms
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayStatus"
                                  value="No- Mat counered"
                                  className="mr-1"
                                />
                                No- Mat counered
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayStatus"
                                  value="No- inter state, amt < 50,000"
                                  className="mr-1"
                                />
                                No- inter state, amt &lt; 50,000
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayStatus"
                                  value="No-Mat hand delivery"
                                  className="mr-1"
                                />
                                No-Mat hand delivery
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayStatus"
                                  value="No- intra state, amt < 1,00,000"
                                  className="mr-1"
                                />
                                No- intra state, amt &lt; 1,00,000
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="ewayStatus"
                                  value="No-Services"
                                  className="mr-1"
                                />
                                No-Services
                              </label>
                              <div className="mt-2">
                                <span>G L Account: 480</span>
                              </div>
                              <div className="flex gap-2">
                                <div>
                                  <span>Network:</span>
                                  <input
                                    type="text"
                                    className="border border-gray-300 p-1 w-full mt-1"
                                  />
                                </div>
                                <div>
                                  <span>Activity:</span>
                                  <input
                                    type="text"
                                    className="border border-gray-300 p-1 w-full mt-1"
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Continue with the rest of the rows... */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Loading/Unloading/Debris/Debit Note - by SVKM or
                            Vendor
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center">
                              <span className="mr-2">Rs.</span>
                              <input
                                type="number"
                                className="border border-gray-300 p-1 w-full"
                                value={formData.loadingUnloadingAmount || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "loadingUnloadingAmount",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2"></td>
                        </tr>

                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Purchase Order Copy attached
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex gap-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="purchaseOrder"
                                  value="Yes"
                                  checked={
                                    formData.purchaseOrderAttached === "Yes"
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      "purchaseOrderAttached",
                                      "Yes"
                                    )
                                  }
                                  className="mr-1"
                                />
                                Yes
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="purchaseOrder"
                                  value="No"
                                  checked={
                                    formData.purchaseOrderAttached === "No"
                                  }
                                  onChange={() =>
                                    handleRadioChange(
                                      "purchaseOrderAttached",
                                      "No"
                                    )
                                  }
                                  className="mr-1"
                                />
                                No
                              </label>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center">
                              <span className="mr-2">
                                Is PO signed by authorised?
                              </span>
                              <label className="flex items-center mr-2">
                                <input
                                  type="radio"
                                  name="poSigned"
                                  value="Yes"
                                  className="mr-1"
                                />
                                Yes
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name="poSigned"
                                  value="No"
                                  className="mr-1"
                                />
                                No
                              </label>
                            </div>
                          </td>
                        </tr>

                        {/* Add the rest of the rows following the same pattern */}
                      </tbody>
                    </table>
                  </div>

                  <div className="checklist-footer">
                    <button
                      className="download-button no-print"
                      style={{ color: "white" }}
                    >
                      Download
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ background: "transparent" }}
                      >
                        <path
                          d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button className="send-button no-print">
                      Send to
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ background: "transparent" }}
                      >
                        <path
                          d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 mb-6">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="btn px-4 py-2 bg-[#0047ab] rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="btn px-4 py-2 bg-[#0047ab] rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ChecklistAccount;
