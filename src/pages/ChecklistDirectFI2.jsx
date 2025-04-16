import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import print from "../assets/print.svg";
import logo from "../assets/logo.png";
import pen from "../assets/pen.svg";

const ITEMS_PER_PAGE = 1;

const ChecklistDirectFI = () => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);
  const printRef = useRef();
  const [isEditable, setIsEditable] = useState(false);

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

  const [formData, setFormData] = useState({
    sapCode: "",
    vendorName: "",
    purpose: "",
    amount: "",
    wbsNo: "",
    networkActivityNo: "",
    costElement: "",
    isBudgetAvailable: "",
    approvedByProject: "",
    submittedBy: "",
    isInvoiceAttached: "",
    expensesRecovered: "",
    compliances1: "",
    compliances2: "",
    isGstCharged: "",
    isRcmApplicable: "",
    approvedByAccounts: "",
    documentNo: "",
    postingDate: "",
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

  const toggleEditMode = () => {
    setIsEditable(!isEditable);
  };

  const handleRadioChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
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
          Print All Direct FI Checklist <img src={print} alt="Print Icon" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-grow p-4">
        {currentItems.map((item, index) => (
          <div key={index}>
            <div className="w-full max-w-[90%] mx-auto">
              <div className="border border-gray-300 bg-white font-semibold">
                <div className="grid grid-cols-2 bg-gray-200 items-center">
                  <div className="p-2 border-b border-gray-300 flex items-center">
                    <div className="text-sm font-semibold">
                      <img src={logo} alt="" className="h-10" />
                    </div>
                  </div>
                  <div className="border-gray-300">
                    <div className="text-sm">{item?.srNo}</div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  Check List - Direct FI entry
                </div>

                <div className="p-2 border-b border-gray-300">
                  Project Name: {item?.projectDescription}
                </div>

                <div className="p-2 border-b border-gray-300">
                  Campus: {item?.region}
                </div>

                <div className="p-2 border-b border-gray-300">
                  Project ID in SAP:
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[90%] mx-auto"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-100 w-12">
                        Sr. No.
                      </th>
                      <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                        Description
                      </th>
                      <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                        Remarks
                      </th>
                      <th className="border border-gray-300 p-2 bg-gray-100 w-1/4">
                        Additional Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Project Dept Section */}
                    <tr>
                      <td
                        colSpan="4"
                        className="border border-gray-300 p-2 bg-gray-100 font-bold"
                      >
                        To be filled in by Project Dept:
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">1</td>
                      <td className="border border-gray-300 p-2">
                        SAP Code & Vendor Name
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Column 6"
                            className="border border-gray-300 p-1 w-1/2"
                            value={formData.sapCode}
                            onChange={(e) =>
                              handleInputChange("sapCode", e.target.value)
                            }
                          />
                          <input
                            type="text"
                            placeholder="Column 7"
                            className="border border-gray-300 p-1 w-1/2"
                            value={formData.vendorName}
                            onChange={(e) =>
                              handleInputChange("vendorName", e.target.value)
                            }
                          />
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">2</td>
                      <td className="border border-gray-300 p-2">
                        Purpose of expenses
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.purpose}
                          onChange={(e) =>
                            handleInputChange("purpose", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">3</td>
                      <td className="border border-gray-300 p-2">Amount</td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="number"
                          placeholder="Column 23"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.amount}
                          onChange={(e) =>
                            handleInputChange("amount", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">4</td>
                      <td className="border border-gray-300 p-2">WBS No.</td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.wbsNo}
                          onChange={(e) =>
                            handleInputChange("wbsNo", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">5</td>
                      <td className="border border-gray-300 p-2">
                        Network & Activity No
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.networkActivityNo}
                          onChange={(e) =>
                            handleInputChange(
                              "networkActivityNo",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">6</td>
                      <td className="border border-gray-300 p-2">
                        Cost Element
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.costElement}
                          onChange={(e) =>
                            handleInputChange("costElement", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">7</td>
                      <td className="border border-gray-300 p-2">
                        Is Budget available
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="budget"
                              value="Yes"
                              checked={formData.isBudgetAvailable === "Yes"}
                              onChange={() =>
                                handleRadioChange("isBudgetAvailable", "Yes")
                              }
                              className="mr-1"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="budget"
                              value="No"
                              checked={formData.isBudgetAvailable === "No"}
                              onChange={() =>
                                handleRadioChange("isBudgetAvailable", "No")
                              }
                              className="mr-1"
                            />
                            No
                          </label>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">8</td>
                      <td className="border border-gray-300 p-2">
                        Approved by
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.approvedByProject}
                          onChange={(e) =>
                            handleInputChange(
                              "approvedByProject",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">9</td>
                      <td className="border border-gray-300 p-2">
                        Submitted by
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.submittedBy}
                          onChange={(e) =>
                            handleInputChange("submittedBy", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">10</td>
                      <td className="border border-gray-300 p-2">
                        Original invoice/intimation/etc attached
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="invoice"
                              value="Yes"
                              checked={formData.isInvoiceAttached === "Yes"}
                              onChange={() =>
                                handleRadioChange("isInvoiceAttached", "Yes")
                              }
                              className="mr-1"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="invoice"
                              value="No"
                              checked={formData.isInvoiceAttached === "No"}
                              onChange={() =>
                                handleRadioChange("isInvoiceAttached", "No")
                              }
                              className="mr-1"
                            />
                            No
                          </label>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">11</td>
                      <td className="border border-gray-300 p-2">
                        Whether exp of SVKM to be recovered from contractor
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          placeholder="Expenses of SVKM/to be recovered from contractor"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.expensesRecovered}
                          onChange={(e) =>
                            handleInputChange(
                              "expensesRecovered",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">12</td>
                      <td className="border border-gray-300 p-2">
                        Compliances
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          placeholder="Column 9"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.compliances1}
                          onChange={(e) =>
                            handleInputChange("compliances1", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          placeholder="Column 10"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.compliances2}
                          onChange={(e) =>
                            handleInputChange("compliances2", e.target.value)
                          }
                        />
                      </td>
                    </tr>

                    {/* Accounts Dept Section */}
                    <tr>
                      <td
                        colSpan="4"
                        className="border border-gray-300 p-2 bg-gray-100 font-bold"
                      >
                        To be filled in by Accounts Dept:
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">13</td>
                      <td className="border border-gray-300 p-2">
                        Is GST charged in invoice
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gst"
                              value="Yes"
                              checked={formData.isGstCharged === "Yes"}
                              onChange={() =>
                                handleRadioChange("isGstCharged", "Yes")
                              }
                              className="mr-1"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="gst"
                              value="No"
                              checked={formData.isGstCharged === "No"}
                              onChange={() =>
                                handleRadioChange("isGstCharged", "No")
                              }
                              className="mr-1"
                            />
                            No
                          </label>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">14</td>
                      <td className="border border-gray-300 p-2">
                        Is RCM applicable
                      </td>
                      <td className="border border-gray-300 p-2">
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="rcm"
                              value="Yes"
                              checked={formData.isRcmApplicable === "Yes"}
                              onChange={() =>
                                handleRadioChange("isRcmApplicable", "Yes")
                              }
                              className="mr-1"
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="rcm"
                              value="No"
                              checked={formData.isRcmApplicable === "No"}
                              onChange={() =>
                                handleRadioChange("isRcmApplicable", "No")
                              }
                              className="mr-1"
                            />
                            No
                          </label>
                        </div>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">15</td>
                      <td className="border border-gray-300 p-2">
                        Approved by
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.approvedByAccounts}
                          onChange={(e) =>
                            handleInputChange(
                              "approvedByAccounts",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">16</td>
                      <td className="border border-gray-300 p-2">
                        Document no in SAP
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.documentNo}
                          onChange={(e) =>
                            handleInputChange("documentNo", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">17</td>
                      <td className="border border-gray-300 p-2">
                        Posting date in SAP
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                          value={formData.postingDate}
                          onChange={(e) =>
                            handleInputChange("postingDate", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2">
                        <input
                          type="text"
                          className="border border-gray-300 p-1 w-full"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Continue ≫
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Submit ≫
                </button>
              </div> */}
            </form>
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
      </main>
    </>
  );
};

export default ChecklistDirectFI;
