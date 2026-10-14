import React, { useRef, useState } from "react";
import { JOURNEY_STEPS, journeyStepDate, journeyStepName } from "../../utils/printBillJourney";
import { billJourneyRow } from "../../utils/billJourneyRow";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import print from "../../assets/print.svg";
// Shared two-decimal en-IN amount formatter (1.10, item O-04).
import { formatAmount } from "../../utils/formatAmount";

const ITEMS_PER_PAGE = 1;

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

  /*
   * The journey steps, shared with Print Bill Journey on the report. This
   * page listed its own step labels with the Date and Name cells left blank -
   * only "Bill Received at Site" read a value - so a bill printed empty
   * however far it had travelled (1.10, item 17).
   */
  const rows = JOURNEY_STEPS;
  const stepDate = (item, step) => journeyStepDate(billJourneyRow(item), step);
  const stepName = (item, step) => journeyStepName(billJourneyRow(item), step);
  // Proforma no, date and amount joined by "&" (9.10, item 1).
  const proformaText = (item) =>
    [
      item?.proformaInvNo || "",
      formatDate(item?.proformaInvDate) || "",
      item?.proformaInvAmt ? `${item?.currency || ""} ${formatAmount(item?.proformaInvAmt)}`.trim() : "",
    ].filter(Boolean);

  console.log("Bill List:", billList);
  console.log("Bills Data:", billsData);

  const handlePrint = () => {
    const win = window.open("", "_blank");

    const printStyles = `
      <style>
        /* All lines and borders bold - solid black, 1.5px, table outline
           2px (13.10, item 1). */
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
            border-bottom: 1.5px solid #000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            border: 2px solid #000;
          }
          th, td {
            border: 1.5px solid #000;
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
            border-bottom: 1.5px solid #000;
          }
          .grid-2 {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
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
            border-bottom: 1.5px solid #000;
          }
          /* Long values wrap inside their own field/cell instead of spilling
             into the next one (1.10, item O-05). */
          table { table-layout: fixed; }
          td, th, .content-row, .grid-row > *, .vend-desc > * {
            min-width: 0;
            overflow-wrap: anywhere;
            word-break: break-word;
          }
          .vend-desc { gap: 16px; }
          /* Header as a grid so a long Project description wraps inside its
             own cell (6.10, P-27); "SVKM" in place of the logo (6.10, item 1 iv). */
          .head-row {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr) auto auto;
            gap: 16px;
            align-items: center;
            padding: 8px;
            font-size: 0.875rem;
            border-bottom: 1.5px solid #000;
            background-color: #e5e7eb;
          }
          .head-row > * { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
          .brand { font-size: 1rem; font-weight: 700; letter-spacing: 1px; }
          /* Created By kept to the right so the left field has the room
             (6.10, item 1 v). */
          .split-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 16px;
            padding: 8px;
            font-size: 0.875rem;
            border-bottom: 1.5px solid #000;
          }
          .split-row > * { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
          .split-row .right { text-align: right; max-width: 45ch; }
          .vend-desc { padding-right: 8px; }
          .vend-desc > :first-child { flex: 1 1 auto; }
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
          <div class="head-row">
            <span class="brand">SVKM</span>
            <div>Region-Project Name: <b>${item?.region || ""} - ${item?.projectDescription || ""}</b></div>
            <b>${item?.srNo || ""}</b>
            <div>Nature of Work: <b>${item?.natureOfWork || item?.typeOfInv || ""}</b></div>
          </div>

          <!--
            The three Proforma cells merged into one, with Created By and Team
            alongside - the layout she marked up (observation N-11).
          -->
          <div class="split-row">
            <!-- Labels per client mark-up (1.10, item O-07). -->
            <div>Proforma Inv &amp; Date &amp; Amt:
              <b>${proformaText(item).join(" &amp; ")}</b>
            </div>
            <div class="right">Created By:
              <b>${[item?.createdBy || "", item?.createdByTeam || ""].filter(Boolean).join(" &nbsp;&nbsp; ")}</b>
            </div>
          </div>

          <div class="grid-row grid-3">
            <div>Invoice No: <b>${item?.taxInvNo || ""}</b></div>
            <div>Dt: <b>${formatDate(item?.taxInvDate)}</b></div>
            <div>Invoice Amt: <b>${item?.currency || ""} ${formatAmount(item?.taxInvAmt) || ""}</b></div>
          </div>

          <div class="vend-desc">
            <div>Vendor: <b>${item?.vendorName || ""}</b></div>
            
            <div>SAP Code: <b>${item?.vendorNo || ""}</b></div>
          </div>

          <!-- PO no, date and amount on one line (1.10, item O-07). -->
          <div class="content-row">
            PO no and Date and Amt: <b>${[
              item?.poNo || "",
              formatDate(item?.poDate) || "",
              formatAmount(item?.poAmt) ? `${item?.currency || "INR"} ${formatAmount(item?.poAmt)}` : "",
            ].filter(Boolean).join(" &amp; ")}</b>
          </div>

          <!-- Remarks = col 27, Additional Info = col 26, E-Way Bill = col 25A (9.10, item 1). -->
          <div class="content-row">
            Remarks: <b>${item?.remarksBySiteTeam || ""}</b>
          </div>
          <div class="content-row">
            Additional Info: <b>${item?.department || ""}</b>
          </div>
          <div class="content-row">
            E-Way Bill: <b>${item?.eWayBill || ""}</b>
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
            (step, idx) => `
                <tr class="${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}">
                  <td>${stepDate(item, step)}</td>
                  <td>${step.label}</td>
                  <td>${stepName(item, step)}</td>
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
                {/* Long values wrap within their own field (1.10, item O-05). */}
                {/* All lines and borders bold - solid black (13.10, item 1). */}
                <div className="border-2 border-black bg-white font-semibold [overflow-wrap:anywhere] [word-break:break-word] [&_.grid>*]:min-w-0">
                  {/* "SVKM" in place of the logo (6.10, item 1 iv); a long
                      Project description wraps within its own cell (6.10, P-27). */}
                  <div className="grid grid-cols-4 bg-gray-200 items-center border-b-[1.5px] border-black">
                    <div className="p-2 col-span-2 flex items-center gap-3 min-w-0">
                      <div className="text-base font-bold tracking-wider shrink-0">
                        SVKM
                      </div>
                      <div className="text-sm min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
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

                  <div className="p-2 border-b-[1.5px] border-black">
                    {/*
                      The three Proforma cells merged into one, with Created By
                      and Team alongside - the layout she marked up
                      (observation N-11).
                    */}
                    {/* Created By on the right, the left field takes the room (6.10, item 1 v). */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 text-sm">
                      {/* Labels per client mark-up (1.10, item O-07). */}
                      <div>Proforma Inv &amp; Date &amp; Amt: <span className="font-bold">
                        {proformaText(item).join(" & ")}
                      </span></div>
                      <div className="text-right max-w-[45ch]">Created By: <span className="font-bold">
                        {[item?.createdBy || "", item?.createdByTeam || ""].filter(Boolean).join("   ")}
                      </span></div>
                    </div>
                  </div>

                  <div className="p-2 border-b-[1.5px] border-black">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Invoice No: <span className="font-bold">{item?.taxInvNo}</span></div>
                      <div className="text-center">Dt: <span className="font-bold">{formatDate(item?.taxInvDate)}</span></div>
                      <div>
                        Invoice Amt: <span className="font-bold">{item?.currency} {formatAmount(item?.taxInvAmt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-b-[1.5px] border-black">
                    <div className="grid grid-cols-4 text-sm">
                      <div className="col-span-3 min-w-0 break-words [overflow-wrap:anywhere]">Vendor: <span className="font-bold">{item?.vendorName}</span></div>
                      <div>SAP Code: <span className="font-bold">{item?.vendorNo}</span></div>
                    </div>
                  </div>

                  {/* PO no, date and amount on one line (1.10, item O-07). */}
                  <div className="p-2 border-b-[1.5px] border-black">
                    <div className="text-sm">
                      PO no and Date and Amt:{" "}
                      <span className="font-bold">
                        {[
                          item?.poNo || "",
                          formatDate(item?.poDate) || "",
                          formatAmount(item?.poAmt) ? `${item?.currency || "INR"} ${formatAmount(item?.poAmt)}` : "",
                        ].filter(Boolean).join(" & ")}
                      </span>
                    </div>
                  </div>

                  {/* Remarks = col 27, Additional Info = col 26, E-Way Bill = col 25A (9.10, item 1). */}
                  <div className="p-2 border-b-[1.5px] border-black">
                    <div className="text-sm">
                      Remarks: <span className="font-bold">{item?.remarksBySiteTeam}</span>
                    </div>
                  </div>
                  <div className="p-2 border-b-[1.5px] border-black">
                    <div className="text-sm">
                      Additional Info: <span className="font-bold">{item?.department}</span>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="text-sm">
                      E-Way Bill: <span className="font-bold">{item?.eWayBill}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing table code with updated margins */}
              <div className="w-full max-w-[90%] mx-auto flex flex-col gap-4">
                <table className="min-w-full border-2 border-black bg-white shadow-md rounded-xl [overflow-wrap:anywhere] [word-break:break-word]">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700 text-sm">
                      <th className="px-4 py-2 text-left w-1/6 border-r-[1.5px] border-black">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left w-2/5 border-r-[1.5px] border-black">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left w-1/4 border-r-[1.5px] border-black">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left">Signature</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((step, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-2 border-t-[1.5px] border-r-[1.5px] border-black">
                          {stepDate(item, step)}
                        </td>
                        <td className="px-4 py-2 border-t-[1.5px] border-r-[1.5px] border-black">
                          {step.label}
                        </td>
                        <td className="px-4 py-2 border-t-[1.5px] border-r-[1.5px] border-black">
                          {stepName(item, step)}
                        </td>
                        <td className="px-4 py-2 border-t-[1.5px] border-black"></td>
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
              <table className="min-w-full border-2 border-black bg-white shadow-md rounded-xl">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-sm">
                    <th className="px-4 py-2 text-left w-1/6 border-r-[1.5px] border-black">Date</th>
                    <th className="px-4 py-2 text-left w-2/5 border-r-[1.5px] border-black">
                      Description
                    </th>
                    <th className="px-4 py-2 text-left w-1/4 border-r-[1.5px] border-black">Name</th>
                    <th className="px-4 py-2 text-left">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((step, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-2 border-t-[1.5px] border-r-[1.5px] border-black"></td>
                      <td className="px-4 py-2 border-t-[1.5px] border-r-[1.5px] border-black">
                        {step.label}
                      </td>
                      <td className="px-4 py-2 border-t-[1.5px] border-r-[1.5px] border-black"></td>
                      <td className="px-4 py-2 border-t-[1.5px] border-black"></td>
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
