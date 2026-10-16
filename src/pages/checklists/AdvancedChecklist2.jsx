import React, { useState } from "react";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import print from "../../assets/print.svg";
// Shared helpers: two-decimal en-IN amounts and words with paise (1.10, items O-04 / O-06).
import { formatAmount, numberToWords } from "../../utils/formatAmount";

const ITEMS_PER_PAGE = 1;

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

// Escape a value for the print window's HTML string.
const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// A value is a list of lines; a line is a list of parts { t, b (bold) }.
const bold = (t) => ({ t: t ?? "", b: true });
const line = (...parts) => parts.map((p) => (typeof p === "string" ? { t: p } : p));

// Rows of the checklist, shared by the screen and the print window so the
// two always match. `section` marks the "Accounts Department" divider.
const buildRows = (item) => {
  const panStatus = item?.panStatus || item?.vendor?.PANStatus?.name || item?.vendor?.PANStatus || "";
  const compliance =
    item?.compliance206AB || item?.vendor?.complianceStatus?.compliance206AB || item?.vendor?.complianceStatus || "";
  return [
    {
      label: "SAP Code & Vendor Name",
      value: [line(bold([item?.vendorNo || item?.vendor?.vendorNo, item?.vendorName || item?.vendor?.vendorName].filter(Boolean).join(" ")))],
    },
    {
      label: "Nature of advance",
      value: [
        line("Recoverable mobilisation/Non recoverable mobilisation/Ad hoc advance"),
        line("If mobilisation,QS certification attached - Yes / No"),
        // Spelling "expirty" -> "expiry" (9.10, item 5).
        line("If against BG,date of expiry -___________________"),
      ],
    },
    {
      label: "If advance on behalf of Contractor",
      value: [line("Yes / No"), line("If yes;Name of the Contractor-________________________________________")],
    },
    {
      label: "Project Name & Region",
      value: [line(bold(`${item?.projectDescription ? item.projectDescription + ", " : ""}${item?.region || ""}`))],
    },
    {
      label: "PO No and Date and Amount",
      value: item?.poNo
        ? [line("PO No: ", bold(item?.poNo), ", Date: ", bold(formatDate(item?.poDate)), ", Amount: ", bold(`INR ${formatAmount(item?.poAmt)}`))]
        : [],
    },
    { label: "If PO not raised, reason and other details", value: [] },
    { label: "GST No of Vendor", value: [line(bold(item?.gstNumber || item?.vendor?.GSTNumber || ""))] },
    { label: "Payment is towards", value: [line("Material / Services / Material + Services/Work Contract/Cement/Steel/Concrete/Aluminium")] },
    // Former rows 9 "PAN Status" and 10 "Compliance u/s 206 AB" merged into
    // one row (9.10, items 6 / 7); the rows below are renumbered (item 14).
    {
      label: "PAN Status & 206AB Compliance",
      value: [line(bold([panStatus, compliance].filter(Boolean).join(" & ")))],
    },
    {
      label: "Advance Percentage (%) and Remark",
      value: [line(bold(item?.advancePercentage ? item.advancePercentage + "%" : ""), " - ", bold(item?.remarksBySiteTeam || ""))],
    },
    {
      label: "Amount INR",
      value: [
        line(bold(item?.currency || ""), " ", bold(formatAmount(item?.advanceAmt) || ""), " (In words: ", bold(numberToWords(item?.advanceAmt)), ")"),
      ],
    },
    { label: "Advance request entered by", value: [line(bold(item?.createdBy || ""))] },
    { label: "Addl.Remarks/Queries", value: [line(bold(item?.department || ""))] },
    // "& CFO" added; the separate "Approval by CFO" row at the end is
    // removed (9.10, items 8 / 13).
    { label: "Approval by Project Incharge & Trustee & CFO", value: [] },
    // "Accounts Department ... Date______" kept (9.10, item 9).
    { section: true },
    // 194I / 194Q added and "Amt:" on the value side (9.10, items 10 / 11).
    { label: "TDS deductable u/s 194C/194J/194I/194Q @", value: [line("Amt:")] },
    // "WCT decuctable @" row removed (9.10, item 12).
    { label: "Net Amount Payable", value: [] },
    { label: "SAP Payment Doc.No", value: [] },
    { label: "Advance In Vendor Account as on Date", value: [] },
    { label: "Advance In Vendor Account agst above PO", value: [] },
    { label: "Total advance agst above PO after this advance", value: [] },
  ];
};

// Number the rows in sequence; the section divider has no number
// (9.10, item 14 - renumbered 1-20 after the merge and removals).
const numberRows = (rows) => {
  let n = 0;
  return rows.map((r) => (r.section ? r : { ...r, no: ++n }));
};

// "Project Incharge/Advance requested by - <name>" (9.10, item 4; column 32,
// 29.09 item 10).
const requestedByText = (item) => `Project Incharge/Advance requested by - ${item?.advRequestEnteredBy || ""}`;

// ---------- print (HTML string) ----------
const valueHtml = (value) =>
  value
    .map((ln) => `<div>${ln.map((p) => (p.b ? `<b>${esc(p.t)}</b>` : esc(p.t))).join("")}</div>`)
    .join("");

const pageHtml = (item) => {
  const rows = numberRows(buildRows(item))
    .map((r) =>
      r.section
        ? `<tr class="section"><td></td><td>Accounts Department</td><td>Date______</td></tr>`
        : `<tr><td class="no">${r.no}</td><td>${esc(r.label)}</td><td>${valueHtml(r.value)}</td></tr>`
    )
    .join("");
  return `
    <div class="checklist-page">
      <div class="top-row">
        <div class="brand">SVKM</div>
        <div class="title">Check List For - Advance/LC/BG</div>
        <div class="sr">${esc(item?.srNo || "")}</div>
      </div>
      <div class="requested-by">${esc(requestedByText(item))}</div>
      <table>
        <colgroup><col style="width:5%"/><col style="width:42%"/><col style="width:53%"/></colgroup>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
};

// ---------- screen (JSX) ----------
const Value = ({ value }) =>
  value.map((ln, i) => (
    <div key={i}>
      {ln.map((p, j) =>
        p.b ? (
          <span key={j} className="font-bold">
            {p.t}
          </span>
        ) : (
          <React.Fragment key={j}>{p.t}</React.Fragment>
        )
      )}
    </div>
  ));

const AdvancedChecklist = () => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);

  console.log("Bills Data:", billsData);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to enable printing");
      return;
    }

    // One A4 page per bill at 100% scale (9.10, mail item 4). The old sheet
    // ran onto 3 pages: "page-break-inside: avoid" on the whole page and
    // table pushed a table slightly taller than the space left onto the
    // next sheet. Now: compact type and padding, page breaks only between
    // bills, and the fit check below scales a bill down only if it would
    // still exceed the printable height (297mm - 2 x 10mm = 277mm).
    const printStyles = `
      <style>
        @page { size: A4 portrait; margin: 10mm; }
        html, body { margin: 0; padding: 0; background: #fff; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.2;
          color: #000;
        }
        /* Printable A4 width, so the fit check measures the printed height. */
        .checklist-page { width: 190mm; }
        .checklist-page + .checklist-page { break-before: page; page-break-before: always; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        /* Long values wrap inside their own cell (1.10, item O-05; 6.10, item P-27). */
        td, .checklist-page div {
          min-width: 0;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        /* "SVKM" text in place of the logo, title bold, Sr no bold at the
           top right (9.10, items 1 / 2 / 3). */
        .top-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
          padding: 2px 0 4px;
          border-bottom: 1.5px solid #000;
          font-weight: bold;
        }
        .brand { font-size: 12pt; }
        .title { font-size: 11pt; text-align: center; }
        .sr { font-size: 11pt; text-align: right; }
        .requested-by { font-weight: bold; font-size: 11pt; padding: 3px 0; }
        table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          /* All lines and borders bold - solid black (13.10, item 1). */
          border: 2px solid #000;
        }
        td {
          border: 1.5px solid #000;
          padding: 2px 6px;
          vertical-align: middle;
        }
        tr:nth-child(even) { background-color: #f9fafb; }
        tr.section td { background-color: #e5e7eb; font-weight: bold; font-size: 10.5pt; }
        tr.section td:nth-child(2) { text-align: center; }
      </style>
    `;

    let html = `<html><head><title>Advanced Checklist</title>${printStyles}</head><body>`;
    billsData.forEach((item) => {
      html += pageHtml(item);
    });
    html += "</body></html>";

    win.document.write(html);
    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        // Safety net for one sheet per bill: scale a bill down only if it is
        // taller than the A4 printable height (9.10, mail item 4). 3% headroom
        // because the printed layout can run slightly taller than the
        // on-screen measurement.
        try {
          const maxHeight = 277 * (96 / 25.4) * 0.97;
          win.document.querySelectorAll(".checklist-page").forEach((page) => {
            const height = page.scrollHeight;
            if (height > maxHeight) page.style.zoom = String(maxHeight / height);
          });
        } catch (e) {
          console.error("Checklist fit check failed:", e);
        }
        win.document.title = "Advanced Checklist";
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
          Print All Advanced Checklist <img src={print} alt="Print Icon" />
        </button>
      </div>

      <main className="flex-grow p-4">
        {currentItems.map((item, index) => (
          <div key={index}>
            <div className="w-full max-w-[90%] mx-auto">
              {/* All lines and borders bold - solid black (13.10, item 1). */}
              <div className="border-2 border-black bg-white [overflow-wrap:anywhere] [word-break:break-word]">
                {/* "SVKM" text in place of the logo, title bold, Sr no bold at
                    the top right (9.10, items 1 / 2 / 3). */}
                <div className="grid grid-cols-[1fr_2fr_1fr] bg-gray-200 items-center p-2 font-bold [&>*]:min-w-0">
                  <div className="text-2xl">SVKM</div>
                  <div className="text-xl text-center">Check List For - Advance/LC/BG</div>
                  <div className="text-xl text-right">{item?.srNo}</div>
                </div>
                {/* Heading relabelled (9.10, item 4). */}
                <div className="p-2 border-t-[1.5px] border-black bg-gray-200 text-xl font-bold">
                  {requestedByText(item)}
                </div>
              </div>

              <div className="overflow-x-auto">
                {/* Long values wrap within their own cell (1.10, item O-05). */}
                <table className="w-full table-fixed border-collapse border-2 border-black [overflow-wrap:anywhere] [word-break:break-word]">
                  <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[42%]" />
                    <col className="w-[53%]" />
                  </colgroup>
                  <tbody>
                    {numberRows(buildRows(item)).map((r, i) =>
                      r.section ? (
                        <tr key={i} className="font-bold text-xl">
                          <td className="bg-gray-200 p-2 border-l-[1.5px] border-black"></td>
                          <td className="bg-gray-200 p-2 text-center">Accounts Department</td>
                          <td className="bg-gray-200 p-2 border-r-[1.5px] border-black text-center">Date______</td>
                        </tr>
                      ) : (
                        <tr key={i}>
                          <td className="border-[1.5px] border-black p-2">{r.no}</td>
                          <td className="border-[1.5px] border-black p-2">{r.label}</td>
                          <td className="border-[1.5px] border-black p-2">
                            <Value value={r.value} />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
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
      </main>
    </>
  );
};

export default AdvancedChecklist;
