import React, { useRef, useState } from "react";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import print from "../../assets/print.svg";
import logo from "../../assets/logo.png";

const ITEMS_PER_PAGE = 1;

const formatAmount = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount) || amount === "") return amount || "";
  return Number(amount).toLocaleString('en-IN');
};

const ChecklistBillJourney = () => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);
  const printRef = useRef();

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

  const rows = [
    "Bill Received at Site",
    "Receipt By Project Team",
    "Received for PO",
    "Receipt of PO",
    "Bill send for Quality Certification",
    "Bill send to QS",
    "Certified by QS",
    "Certified by Arch/PMC/SVKM",
    "Bill send to Site Engineer/ Site Incharge",
    "Receipt By Site Project Director",
    "Receipt at MPTP",
    "Certified by LPC Members",
    "MIGO Date / MIGO No.",
    "Bill Send to PIMO Mumbai",
    "Bill Received at PIMO Mumbai",
    "Bill Send to QS Certification",
    "Received from QS With COP",
    "Given to I.T. Dept.",
    "Received Back from I.T.Dept.",
    "SES Date / SES No.",
    "Certified by Project DIRECTOR",
    "Certified by Project ADVISOR",
    "Certified by MC Members",
    "Submitted to Accounts Department",
  ];

  console.log("Bill List:", billList);
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
          .vend-desc {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            padding-right: 100px;
          }
        }
      </style>
    `;

    win.document.write(`
      <html>
        <head>
          <title>Bill Journey Checklist</title>
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
            Region-Project Name: <b>${item?.region || ""} - ${item?.projectDescription || ""}</b>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>${item?.srNo || ""}</b>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            Nature of Work: <b>${item?.natureOfWork || item?.typeOfInv || ""}</b>
          </div>

          <div class="grid-row grid-3">
            <div>Proforma Invoice No: <b>${item?.proformaInvNo || ""}</b></div>
            <div>Dt: <b>${formatDate(item?.proformaInvDate)}</b></div>
            <div>Proforma Invoice Amt: <b>${formatAmount(item?.proformaInvAmt) || ""}</b></div>
          </div>

          <div class="grid-row grid-3">
            <div>Invoice No: <b>${item?.taxInvNo || ""}</b></div>
            <div>Dt: <b>${formatDate(item?.taxInvDate)}</b></div>
            <div>Invoice Amt: <b>${item?.currency || ""} ${formatAmount(item?.taxInvAmt) || ""}</b></div>
          </div>

          <div class="vend-desc">
            <div>Vendor Description: <b>${item?.vendorName || ""}</b></div>
            
            <div>Vendor code: <b>${item?.vendorNo || ""}</b></div>
          </div>

          <div class="grid-row grid-3">
            <div class="grid-span-2">PO Number and Date: <b>${item?.poNo || ""}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>${formatDate(item?.poDate)}</b></div>
            <div>PO Amt: <b>${item?.currency || ""} ${formatAmount(item?.poAmt) || ""}</b></div>
          </div>

          <div class="content-row">
            Department: <b>${item?.department || ""}</b>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 16.666667%">Date</th>
                <th style="width: 40%">Description</th>
                <th style="width: 25%">Name</th>
                <th>Signature</th>
              </tr>
            </thead>
            <tbody>
              ${rows
          .map(
            (description) => `
                <tr class="${rows.indexOf(description) % 2 === 0
                ? "bg-gray-50"
                : "bg-white"
              }">
                  <td>${description === "Bill Received at Site"
                ? formatDate(item?.taxInvRecdAtSite)
                : ""
              }</td>
                  <td>${description}</td>
                  <td></td>
                  <td></td>
                </tr>
              `
          )
          .join("")}
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
        win.document.title = "Bill Journey Checklist";
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
          Print All Bill Journey Checklist <img src={print} alt="Print Icon" />
        </button>
      </div>

      <div className="overflow-x-auto p-6 min-h-screen">
        <div>
          {currentItems.map((item, index) => (
            <div key={index}>
              <div className="w-full max-w-[90%] mx-auto">
                <div className="border border-gray-300 bg-white font-semibold">
                  <div className="grid grid-cols-4 bg-gray-200 items-center">
                    <div className="p-2 border-b col-span-2 border-gray-300 flex items-center">
                      <div className="text-sm font-semibold">
                        <img src={logo} alt="" className="h-10" />
                      </div>
                      &nbsp; &nbsp;
                      <div className="text-sm">
                        Region-Project Name: <span className="font-bold">{item?.region} -{" "}
                        {item?.projectDescription}</span>
                      </div>
                    </div>
                    <div className="border-gray-300">
                      <div className="text-sm text-center font-bold">{item?.srNo}</div>
                    </div>
                    <div className="border-gray-300">
                      <div className="text-sm text-center">
                        Nature of Work: <span className="font-bold">{item?.natureOfWork || item?.typeOfInv}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-b border-gray-300">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Proforma Invoice No: <span className="font-bold">{item?.proformaInvNo}</span></div>
                      <div className="text-center">Dt: <span className="font-bold">{formatDate(item?.proformaInvDate)}</span></div>
                      <div>Proforma Invoice Amt: <span className="font-bold">{formatAmount(item?.proformaInvAmt)}</span></div>
                    </div>
                  </div>

                  <div className="p-2 border-b border-gray-300">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Invoice No: <span className="font-bold">{item?.taxInvNo}</span></div>
                      <div className="text-center">Dt: <span className="font-bold">{formatDate(item?.taxInvDate)}</span></div>
                      <div>
                        Invoice Amt: <span className="font-bold">{item?.currency} {formatAmount(item?.taxInvAmt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-b border-gray-300">
                    <div className="grid grid-cols-4 text-sm">
                      <div className="col-span-3">Vendor Description: <span className="font-bold">{item?.vendorName}</span></div>
                      <div>Vendor code: <span className="font-bold">{item?.vendorNo}</span></div>
                    </div>
                  </div>

                  <div className="p-2 border-b border-gray-300">
                    <div className="grid grid-cols-4 text-sm">
                      <div className="col-span-3">
                        PO Number and Date: <span className="font-bold">{item?.poNo}</span>{" "}
                        &nbsp; &nbsp;
                        <span className="font-bold">{formatDate(item?.poDate)}</span>
                      </div>
                      <div>
                        PO Amt: <span className="font-bold">{item?.currency} {formatAmount(item?.poAmt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="text-sm">
                      Department: C<span className="font-bold">{item?.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing table code with updated margins */}
              <div className="w-full max-w-[90%] mx-auto flex flex-col gap-4">
                <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-xl">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700 text-sm">
                      <th className="px-4 py-2 text-left w-1/6 border-r">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left w-2/5 border-r">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left w-1/4 border-r">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((description, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-2 border-t border-r border-gray-300">
                          {description == "Bill Received at Site"
                            ? formatDate(item?.taxInvRecdAtSite)
                            : ""}
                        </td>
                        <td className="px-4 py-2 border-t border-r border-gray-300">
                          {description}
                        </td>
                        <td className="px-4 py-2 border-t border-r border-gray-300"></td>
                        <td className="px-4 py-2 border-t border-gray-300"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Hidden print container */}
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            <div className="checklist-page w-full">
              <h1 className="text-2xl font-semibold mb-4 text-left text-blue-800">
                Bill Journey Checklist
              </h1>
              <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-xl">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-sm">
                    <th className="px-4 py-2 text-left w-1/6 border-r">Date</th>
                    <th className="px-4 py-2 text-left w-2/5 border-r">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left w-1/4 border-r">Name</th>
                    <th className="px-4 py-2 text-left">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((description, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-2 border-t border-r border-gray-300"></td>
                      <td className="px-4 py-2 border-t border-r border-gray-300">
                        {description}
                      </td>
                      <td className="px-4 py-2 border-t border-r border-gray-300"></td>
                      <td className="px-4 py-2 border-t border-gray-300"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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

export default ChecklistBillJourney;
