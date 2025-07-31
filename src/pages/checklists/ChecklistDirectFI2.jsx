import React, { useState } from "react";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import print from "../../assets/print.svg";
import logo from "../../assets/logo.png";

const ITEMS_PER_PAGE = 1;

const ChecklistDirectFI = () => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);

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
          .checklist-page:last-child {
            page-break-after: avoid;
          }
          .content-row {
            padding: 8px;
            font-size: 0.875rem;
            border-bottom: 1px solid #e5e7eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            border: 1px solid #e5e7eb;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
            font-size: 0.875rem;
          }
          th {
            background-color: #f3f4f6;
            text-align: left;
          }
          tr:nth-child(even) { background-color: #f9fafb; }
          .logo-img { height: 40px; }
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
          .grid-4 {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .grid-span-2 {
            grid-column: span 2;
          }
        }
      </style>
    `;

    win.document.write(`
      <html>
        <head>
          <title>Direct FI Checklist</title>
          ${printStyles}
        </head>
        <body>
    `);

    billsData.forEach((item) => {
      const content = `
        <div class="checklist-page">
          <div class="content-row">
            <img src="${logo}" alt="" class="logo-img" style="height: 40px; vertical-align: middle;" />
            &nbsp;&nbsp;&nbsp;
            ${item?.srNo || ""}
          </div>

          <div class="grid-row">Check List - Direct FI entry</div>
          <div class="grid-row">Project Name: ${
            item?.projectDescription || ""
          }</div>
          <div class="grid-row">Campus: ${item?.region || ""}</div>
          <div class="grid-row">Project ID in SAP:</div>

          <table>
            <thead>
              <tr>
                <th style="width: 8%">Sr. No.</th>
                <th style="width: 32%">Description</th>
                <th style="width: 32%">Remarks</th>
                <th style="width: 28%">Additional Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td style="text-decoration: underline; font-weight: 500">To be filled in by Project Dept:</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>1</td>
                <td>SAP Code & Vendor Name</td>
                <td>${item?.vendorNo || ""} ${item?.vendorName || ""}</td>
                <td></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Purpose of expenses</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>3</td>
                <td>Amount</td>
                <td>${item?.taxInvAmt || ""}</td>
                <td></td>
              </tr>
              <tr>
                <td>4</td>
                <td>WBS No.</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>5</td>
                <td>Network & Activity No</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>6</td>
                <td>Cost Element</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>7</td>
                <td>Is Budget available</td>
                <td>Yes / No</td>
                <td></td>
              </tr>
              <tr>
                <td>8</td>
                <td>Approved by</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>9</td>
                <td>Submitted by</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>10</td>
                <td>Original invoice/intimation/etc attached</td>
                <td>Yes / No</td>
                <td></td>
              </tr>
              <tr>
                <td>11</td>
                <td>Whether exp of SVKM to be recovered from contractor</td>
                <td>Expenses of SVKM/to be recovered from contractor</td>
                <td></td>
              </tr>
              <tr>
                <td>12</td>
                <td>Compliances</td>
                <td>${item?.compliance206AB || ""}</td>
                <td>${item?.panStatus || ""}</td>
              </tr>
              <tr>
                <td></td>
                <td style="text-decoration: underline; font-weight: 500">To be filled in by Accounts Dept:</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>1</td>
                <td>Is GST charged in invoice</td>
                <td>Yes / No</td>
                <td></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Is RCM applicable</td>
                <td>Yes / No</td>
                <td></td>
              </tr>
              <tr>
                <td>3</td>
                <td>Approved by</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>4</td>
                <td>Document no in SAP</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>5</td>
                <td>Posting date in SAP</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      win.document.write(content);
    });

    win.document.write("</body></html>");
    win.document.close();

    const style = document.createElement("style");
    style.textContent = "@page { size: auto; margin: 0mm; }";
    win.document.head.appendChild(style);

    win.onload = () => {
      setTimeout(() => {
        win.document.title = "Direct FI Checklist";
        win.focus();
        win.print();
        win.close();
      }, 250);
    };
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = billsData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

            <div
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
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2 underline font-medium">
                        To be filled in by Project Dept:
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">1</td>
                      <td className="border border-gray-300 p-2">
                        SAP Code & Vendor Name
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item?.vendorNo} &nbsp; &nbsp; {item?.vendorName}
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">2</td>
                      <td className="border border-gray-300 p-2">
                        Purpose of expenses
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">3</td>
                      <td className="border border-gray-300 p-2">Amount</td>
                      <td className="border border-gray-300 p-2">
                        {item?.taxInvAmt}
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">4</td>
                      <td className="border border-gray-300 p-2">WBS No.</td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">5</td>
                      <td className="border border-gray-300 p-2">
                        Network & Activity No
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">6</td>
                      <td className="border border-gray-300 p-2">
                        Cost Element
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">7</td>
                      <td className="border border-gray-300 p-2">
                        Is Budget available
                      </td>
                      <td className="border border-gray-300 p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">8</td>
                      <td className="border border-gray-300 p-2">
                        Approved by
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">9</td>
                      <td className="border border-gray-300 p-2">
                        Submitted by
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">10</td>
                      <td className="border border-gray-300 p-2">
                        Original invoice/intimation/etc attached
                      </td>
                      <td className="border border-gray-300 p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">11</td>
                      <td className="border border-gray-300 p-2">
                        Whether exp of SVKM to be recovered from contractor
                      </td>
                      <td className="border border-gray-300 p-2">
                        Expenses of SVKM/to be recovered from contractor
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">12</td>
                      <td className="border border-gray-300 p-2">
                        Compliances
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item?.compliance206AB}
                      </td>
                      <td className="border border-gray-300 p-2">
                        {item?.panStatus}
                      </td>
                    </tr>

                    {/* Accounts Dept Section */}
                    <tr>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2 underline font-medium">
                        To be filled in by Accounts Dept:
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">1</td>
                      <td className="border border-gray-300 p-2">
                        Is GST charged in invoice
                      </td>
                      <td className="border border-gray-300 p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">2</td>
                      <td className="border border-gray-300 p-2">
                        Is RCM applicable
                      </td>
                      <td className="border border-gray-300 p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">3</td>
                      <td className="border border-gray-300 p-2">
                        Approved by
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">4</td>
                      <td className="border border-gray-300 p-2">
                        Document no in SAP
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">5</td>
                      <td className="border border-gray-300 p-2">
                        Posting date in SAP
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                      <td className="border border-gray-300 p-2"></td>
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
      </main>
    </>
  );
};

export default ChecklistDirectFI;
