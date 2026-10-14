import React, { useState } from "react";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import print from "../../assets/print.svg";
// Shared two-decimal en-IN amount formatter (1.10, item O-04).
import { formatAmount } from "../../utils/formatAmount";

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
        /* Applied on screen too, so the one-page fit check below measures
           the page as it will print (9.10, items 1-5). All lines and borders
           bold - solid black, 1.5px, table outline 2px (13.10, item 1). */
        @media print, screen {
          @page {
            margin: 10mm;
            size: A4 portrait;
          }
          body { 
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .checklist-page {
            width: 100%;
            margin: 0 auto;
          }
          /* Page breaks only between bills, never a trailing blank sheet. */
          .checklist-page + .checklist-page { break-before: page; page-break-before: always; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          /* "SVKM" text in place of the logo, Sr no bold at the top right
             (9.10, items 1 / 2). */
          .top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 8px;
            border-bottom: 1.5px solid #000;
            font-weight: bold;
          }
          .top-row .brand { font-size: 1.25rem; }
          .top-row .sr { font-size: 1rem; }
          /* Title bold (9.10, item 3). */
          .title { font-weight: bold; }
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
          .grid-row {
            display: grid;
            padding: 8px;
            font-size: 0.875rem;
            border-bottom: 1.5px solid #000;
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
          /* Long values wrap inside their own cell instead of spilling into
             the next one; column widths above are honoured (1.10, item O-05).
             Header blocks (project / campus / Sr no) too (6.10, item P-27). */
          table { table-layout: fixed; }
          td, th, .content-row, .grid-row, .grid-row > *, .field-row, .field-row > *,
          .checklist-page div, .checklist-page b {
            min-width: 0;
            overflow-wrap: anywhere;
            word-break: break-word;
          }
          /* Label + value on one line: the label never wraps and the value
             takes the rest of the row, wrapping inside it only if very long
             (6.10, items P-41 / P-27). */
          .field-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            padding: 8px;
            font-size: 0.875rem;
            border-bottom: 1.5px solid #000;
          }
          .field-label { flex: 0 0 auto; white-space: nowrap; }
          .field-value { flex: 1 1 auto; min-width: 0; }
        }
        /* Lay out at the printable A4 width (210mm - 2 x 10mm) so the fit
           check measures the real printed height. */
        @media screen {
          .checklist-page { width: 190mm; }
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
          <!-- "SVKM" replaces the logo; Sr no moved to the top right (9.10, items 1 / 2). -->
          <div class="top-row">
            <span class="brand">SVKM</span>
            <span class="sr">${item?.srNo || ""}</span>
          </div>

          <!-- Title bold (9.10, item 3). -->
          <div class="grid-row title">Check List - Direct FI entry</div>
          <!-- Project Name / Campus value on the label's line (9.10, items 4 / 5). -->
          <div class="field-row"><span class="field-label">Project Name:</span><b class="field-value">${
            item?.projectDescription || ""
          }</b></div>
          <div class="field-row"><span class="field-label">Campus:</span><b class="field-value">${item?.region || ""}</b></div>
          <div class="grid-row">Project ID in SAP:</div>

          <table>
            <thead>
              <tr>
                <!-- Narrower Sr No column (6.10, item P-41). -->
                <th style="width: 6%">Sr. No.</th>
                <th style="width: 34%">Description</th>
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
                <td><b>${item?.vendorNo || ""} ${item?.vendorName || ""}</b></td>
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
                <td><b>${formatAmount(item?.taxInvAmt) || ""}</b></td>
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
                <td><b>${item?.compliance206AB || ""}</b></td>
                <td><b>${item?.panStatus || ""}</b></td>
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

    // The extra "@page { margin: 0 }" that used to be appended here
    // overrode the 10mm margin above and let printers clip the edges; it is
    // gone so the sheet prints inside a normal A4 margin (9.10).

    win.onload = () => {
      setTimeout(() => {
        // Safety net for one sheet per bill: scale a bill down only if it is
        // taller than the A4 printable height, 297mm - 2 x 10mm (9.10).
        // 3% headroom because the printed layout can run slightly taller
        // than the on-screen measurement.
        try {
          const maxHeight = 277 * (96 / 25.4) * 0.97;
          win.document.querySelectorAll(".checklist-page").forEach((page) => {
            const height = page.scrollHeight;
            if (height > maxHeight) page.style.zoom = String(maxHeight / height);
          });
        } catch (e) {
          console.error("Checklist fit check failed:", e);
        }
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
              {/* All lines and borders bold - solid black (13.10, item 1). */}
              <div className="border-2 border-black bg-white font-semibold [overflow-wrap:anywhere] [word-break:break-word]">
                {/* "SVKM" replaces the logo; Sr no moved to the top right
                    (9.10, items 1 / 2). */}
                <div className="flex justify-between items-center gap-4 p-2 bg-gray-200 border-b-[1.5px] border-black font-bold [&>*]:min-w-0">
                  <div className="text-2xl">SVKM</div>
                  <div className="text-lg text-right">{item?.srNo}</div>
                </div>

                {/* Title bold (9.10, item 3). */}
                <div className="p-2 border-b-[1.5px] border-black font-bold">
                  Check List - Direct FI entry
                </div>

                {/* Label + value on one line; label never wraps, value wraps
                    only within its own width (6.10, items P-41 / P-27;
                    re-checked 9.10, items 4 / 5). */}
                <div className="p-2 border-b-[1.5px] border-black flex items-baseline gap-1.5">
                  <span className="shrink-0 whitespace-nowrap">Project Name:</span>
                  <span className="font-bold flex-1 min-w-0">{item?.projectDescription}</span>
                </div>

                <div className="p-2 border-b-[1.5px] border-black flex items-baseline gap-1.5">
                  <span className="shrink-0 whitespace-nowrap">Campus:</span>
                  <span className="font-bold flex-1 min-w-0">{item?.region}</span>
                </div>

                <div className="p-2 border-b-[1.5px] border-black">
                  Project ID in SAP:
                </div>
              </div>
            </div>

            <div
              className="w-full max-w-[90%] mx-auto"
            >
              <div className="overflow-x-auto">
                {/* Long values wrap within their own cell (1.10, item O-05). */}
                {/* Fixed layout so the narrower Sr No width is honoured
                    (6.10, item P-41). */}
                <table className="w-full table-fixed border-collapse border-2 border-black [overflow-wrap:anywhere] [word-break:break-word]">
                  <thead>
                    <tr>
                      <th className="border-[1.5px] border-black p-2 bg-gray-100 w-[5%]">
                        Sr. No.
                      </th>
                      <th className="border-[1.5px] border-black p-2 bg-gray-100 w-[35%]">
                        Description
                      </th>
                      <th className="border-[1.5px] border-black p-2 bg-gray-100 w-[32%]">
                        Remarks
                      </th>
                      <th className="border-[1.5px] border-black p-2 bg-gray-100 w-[28%]">
                        Additional Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Project Dept Section */}
                    <tr>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2 underline font-medium">
                        To be filled in by Project Dept:
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">1</td>
                      <td className="border-[1.5px] border-black p-2">
                        SAP Code & Vendor Name
                      </td>
                      <td className="border-[1.5px] border-black p-2 font-bold">
                        {item?.vendorNo} &nbsp; &nbsp; {item?.vendorName}
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">2</td>
                      <td className="border-[1.5px] border-black p-2">
                        Purpose of expenses
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">3</td>
                      <td className="border-[1.5px] border-black p-2">Amount</td>
                      <td className="border-[1.5px] border-black p-2 font-bold">
                        {formatAmount(item?.taxInvAmt)}
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">4</td>
                      <td className="border-[1.5px] border-black p-2">WBS No.</td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">5</td>
                      <td className="border-[1.5px] border-black p-2">
                        Network & Activity No
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">6</td>
                      <td className="border-[1.5px] border-black p-2">
                        Cost Element
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">7</td>
                      <td className="border-[1.5px] border-black p-2">
                        Is Budget available
                      </td>
                      <td className="border-[1.5px] border-black p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">8</td>
                      <td className="border-[1.5px] border-black p-2">
                        Approved by
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">9</td>
                      <td className="border-[1.5px] border-black p-2">
                        Submitted by
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">10</td>
                      <td className="border-[1.5px] border-black p-2">
                        Original invoice/intimation/etc attached
                      </td>
                      <td className="border-[1.5px] border-black p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">11</td>
                      <td className="border-[1.5px] border-black p-2">
                        Whether exp of SVKM to be recovered from contractor
                      </td>
                      <td className="border-[1.5px] border-black p-2">
                        Expenses of SVKM/to be recovered from contractor
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">12</td>
                      <td className="border-[1.5px] border-black p-2">
                        Compliances
                      </td>
                      <td className="border-[1.5px] border-black p-2 font-bold">
                        {item?.compliance206AB}
                      </td>
                      <td className="border-[1.5px] border-black p-2 font-bold">
                        {item?.panStatus}
                      </td>
                    </tr>

                    {/* Accounts Dept Section */}
                    <tr>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2 underline font-medium">
                        To be filled in by Accounts Dept:
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">1</td>
                      <td className="border-[1.5px] border-black p-2">
                        Is GST charged in invoice
                      </td>
                      <td className="border-[1.5px] border-black p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">2</td>
                      <td className="border-[1.5px] border-black p-2">
                        Is RCM applicable
                      </td>
                      <td className="border-[1.5px] border-black p-2">
                        Yes &nbsp; / &nbsp; No
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">3</td>
                      <td className="border-[1.5px] border-black p-2">
                        Approved by
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">4</td>
                      <td className="border-[1.5px] border-black p-2">
                        Document no in SAP
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border-[1.5px] border-black p-2">5</td>
                      <td className="border-[1.5px] border-black p-2">
                        Posting date in SAP
                      </td>
                      <td className="border-[1.5px] border-black p-2"></td>
                      <td className="border-[1.5px] border-black p-2"></td>
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
