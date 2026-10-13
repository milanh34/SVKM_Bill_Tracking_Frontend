import React, { useState } from "react";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import print from "../../assets/print.svg";
// Shared two-decimal en-IN amount formatter (1.10, item O-04).
import { formatAmount } from "../../utils/formatAmount";

const ITEMS_PER_PAGE = 1;

// ---------------------------------------------------------------------------
// Accounts checklist laid out exactly like the client's Excel sheet
// "09102026_FI checklist" (9.10, item 1 - "We need this font"):
// Times New Roman, header and body 13pt, column headings 12pt bold, amounts
// and Sr no 15pt bold, column widths 38.86 / 37.57 / 52.29 Excel chars,
// row heights 21.75pt (33pt for the two-line rows).
// The same row model drives the on-screen table (JSX) and the print window
// (HTML string), so the two can never drift apart.
// ---------------------------------------------------------------------------

// Sheet geometry in pt (9.10, item 1). The Excel widths (204 / 197.25 /
// 274.5pt) are widened ~2% because several of her lines fill their column
// almost exactly in Times New Roman 13pt ("Invoice Approved By Project
// Incharge", "Yes - Works Contract E-way bill avbl", "No - inter state; amt
// < 50,000/No-Mat hand delivery") and would otherwise wrap in a browser. The
// print is scaled to the page anyway, so only the proportions matter.
const COL_PT = [208, 203, 281];
const SHEET_WIDTH_PT = COL_PT[0] + COL_PT[1] + COL_PT[2];

// Styles shared by screen and print, scoped to .acc-sheet (9.10, item 1).
const SHEET_CSS = `
  .acc-sheet {
    border-collapse: collapse;
    table-layout: fixed;
    width: ${SHEET_WIDTH_PT}pt;
    font-family: "Times New Roman", Times, serif;
    font-size: 13pt;
    color: #000;
    background: #fff;
  }
  .acc-sheet col.c-a { width: ${COL_PT[0]}pt; }
  .acc-sheet col.c-b { width: ${COL_PT[1]}pt; }
  .acc-sheet col.c-c { width: ${COL_PT[2]}pt; }
  .acc-sheet tr { height: 21.75pt; }
  .acc-sheet tr.r-first { height: 19.5pt; }
  .acc-sheet tr.r-heading { height: 16.5pt; }
  .acc-sheet tr.r-tall { height: 33pt; }
  .acc-sheet td, .acc-sheet th {
    border: 1px solid #000;
    padding: 0 2pt;
    margin: 0;
    vertical-align: middle;
    text-align: left;
    font-weight: normal;
    font-size: 13pt;
    line-height: 1.15;
    /* Keep the sheet's own spacing (e.g. "Network:          Activity:")
       and let a long value wrap inside its own cell. */
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .acc-sheet th { font-size: 12pt; font-weight: bold; text-align: center; }
  .acc-sheet .b { font-weight: bold; }
  .acc-sheet .big { font-size: 15pt; font-weight: bold; }
  .acc-sheet td.amt { font-size: 15pt; font-weight: bold; }
  .acc-sheet td.right { text-align: right; }
  /* Cells the sheet shows without a line beneath them
     (VP / JKB ... -> Shirpur/Dhule, HS / HC ... -> Member -LMC,
     Bill for Material ... -> Total Material Purchases). */
  .acc-sheet td.open { border-bottom-style: hidden; }
`;

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

const joinAnd = (...parts) => parts.filter(Boolean).join(" and ");

// Escape a value for the print window's HTML string.
const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Header block: six rows, each "left (spans cols A-B) | right (col C)".
// A part is { t: text, cls: "b" | "big" }; data values are bold as in the
// sheet's rich text (9.10, item 1).
const buildHeader = (item) => {
  const project = [item?.region, item?.projectDescription].filter(Boolean).join("-");
  const poAmt = formatAmount(item?.poAmt);
  return [
    {
      cls: "r-first",
      rightCls: "right",
      left: [{ t: "SVKM", cls: "b" }, { t: "  Project: " }, { t: project, cls: "b" }],
      right: [{ t: item?.srNo || "", cls: "big" }, { t: "            Due Date:__/__/____" }],
    },
    {
      left: [{ t: "Invoice no and Date: " }, { t: joinAnd(item?.taxInvNo, formatDate(item?.taxInvDate)), cls: "b" }],
      right: [{ t: "Nature of Work: " }, { t: item?.natureOfWork || item?.typeOfInv || "", cls: "b" }],
    },
    {
      left: [{ t: "Vendor: " }, { t: item?.vendorName || "", cls: "b" }],
      right: [{ t: "SAP Code: " }, { t: item?.vendorNo || "", cls: "b" }],
    },
    {
      left: [{ t: "PO No and Date: " }, { t: joinAnd(item?.poNo, formatDate(item?.poDate)), cls: "b" }],
      right: [{ t: "PO Amt: " }, { t: poAmt ? [item?.currency, poAmt].filter(Boolean).join(" ") : "", cls: "b" }],
    },
    {
      left: [{ t: "Vendor GST No as per SAP: " }, { t: item?.gstNumber || "", cls: "b" }],
      right: [{ t: "LC exist in vendor A/c: Yes / No" }],
    },
    {
      left: [{ t: "206AB Compliance: " }, { t: item?.compliance206AB || "", cls: "b" }],
      right: [{ t: "PAN Status: " }, { t: item?.panStatus || "", cls: "b" }],
    },
  ];
};

// Body rows 8-41 of the sheet. A cell is a string or
// { t, rs (row span), cls ("amt" | "open") }. Rows the sheet makes 33pt
// tall carry tall: true (9.10, item 1).
const buildBody = (item) => {
  const invAmt = formatAmount(item?.taxInvAmt);
  // Gleed's Certification Amount = COP amount.
  const copAmt = formatAmount(item?.copDetails?.amount);
  return [
    // Taller: amounts and doc nos are written here by hand (12.10, item 2).
    { tall: true, cells: ["Vendor Original Tax Invoice attached", "Yes / No", "SAP doc no. 17/"] },
    { cells: [{ t: "Invoice Approved By Project Incharge", rs: 2 }, { t: "VP / JKB / RB / DG / PP /", cls: "open" }, "Same bill no. in vendor ledger: Yes / No"] },
    { cells: ["Shirpur/Dhule", "Is MIGO entry done: Yes / No"] },
    { cells: [{ t: "Invoice Approved By Trustee", rs: 2 }, { t: "HS / HC / JP / JK / BP / RB /", cls: "open" }, "IS PO no mentioned on Bill? Yes / No"] },
    { cells: ["Member -LMC", "IS PO no mentioned is correct? Yes / No"] },
    { cells: [{ t: "Invoice Amount", rs: 2 }, { t: invAmt ? `${item?.currency || "INR"} ${invAmt}` : "", rs: 2, cls: "amt" }, { t: "Bill for Material / services / material + services", cls: "open" }] },
    { cells: ["Total Material Purchases - < 50 lacs / > 50 lacs"] },
    { tall: true, cells: ["TDS u/s 194C / 194J / 194I or 194Q + TDS deducted- cement/steel,etc.", "Rs.", "Net amount : Rs."] },
    { cells: ["Is GST charged in bill", "Yes / No / RCM (consult Mr Mekap)", "SVKM GST no mentioned on bill? Yes / No"] },
    { cells: [{ t: "Vendor Original Delivery Challan", rs: 2 }, "Yes - with Stamp", "No - with Stamp on bill / No - Services"] },
    { cells: ["Yes - w/o Stamp", "No - w/o Stamp on bill"] },
    { cells: [{ t: "E Way bill attached", rs: 3 }, "Yes - Part A avbl & Part B avbl", "No - distance < 50 kms / No- Mat couriered"] },
    { cells: ["Yes - bill to ship to E-Way bill avbl", "No - inter state; amt < 50,000/No-Mat hand delivery"] },
    { cells: ["Yes - Works Contract E-way bill avbl", "No - intra state; amt < 1,00,000 /No -Services"] },
    { cells: [{ t: "Loading / Unloading / Debris / Debit Note - by SVKM or Vendor", rs: 2 }, { t: "Rs.", rs: 2 }, "G L account: 480"] },
    { cells: ["Network:                             Activity:"] },
    { cells: ["Purchase Order Copy attached", "Yes / No", "Is PO signed by authorised? Yes/No"] },
    { tall: true, cells: ["Vendor GST No as per Invoice", "Same / different (If diff, check Vendor PAN & RTGS details)", "Vendor GST validity: Yes / No"] },
    { cells: [{ t: "Gleed's Certification Amount", rs: 2 }, { t: copAmt ? `INR ${copAmt}` : "", cls: "amt" }, "Is certificate signed & stamped? Yes / No"] },
    { cells: ["N.A. for Mumbai; amt < 50,000", "Is PO no correct? Yes / No"] },
    { cells: [{ t: "Retention Amount", rs: 2 }, { t: "Rs.", rs: 2 }, "Gleeds COP amt: Rs."] },
    { cells: ["SAP doc no: 35/"] },
    { cells: [{ t: "This bill hold amount", rs: 2 }, { t: "Rs.", rs: 2 }, "SAP doc no: 10/"] },
    { cells: ["SAP doc no: 10/"] },
    { tall: true, cells: ["Earlier bill hold/retention release amt", "Rs.", ""] },
    { cells: [{ t: "Measurment Sheet/Drawings", rs: 2 }, { t: "Yes / No", rs: 2 }, "PO no on measurement sheet same?"] },
    { cells: ["Yes / No / Not mentioned"] },
    { cells: [{ t: "Others", rs: 2 }, { t: "", rs: 2 }, "Declaration for no TDS : u/s 194 C (6) received/"] },
    { cells: ["under notification 21/dated 13.06.12 received"] },
    { tall: true, cells: ["Advance in Vendor Account", "Rs.", "In various POs as on"] }, // 12.10, item 2
    { tall: true, cells: ["Advance adj. agst this invoice", "Rs.", ""] }, // 12.10, item 2
    { tall: true, cells: ["Net Payable", "Rs.", ""] }, // 12.10, item 2
    { cells: [{ t: "Project / Campus on Bill, PO and Certificate", rs: 2 }, { t: "Same / different", rs: 2 }, "Not for payment since adjusted against advance."] },
    { cells: ["Email sent?_______ / Entered in Access ________"] },
  ];
};

const asCell = (c) => (typeof c === "string" ? { t: c } : c);

// ---------- print (HTML string) ----------
const partsHtml = (parts) =>
  parts.map((p) => (p.cls ? `<span class="${p.cls}">${esc(p.t)}</span>` : esc(p.t))).join("");

const sheetHtml = (item) => {
  const header = buildHeader(item)
    .map(
      (r) =>
        `<tr${r.cls ? ` class="${r.cls}"` : ""}><td colspan="2">${partsHtml(r.left)}</td><td${
          r.rightCls ? ` class="${r.rightCls}"` : ""
        }>${partsHtml(r.right)}</td></tr>`
    )
    .join("");
  const body = buildBody(item)
    .map(
      (r) =>
        `<tr${r.tall ? ' class="r-tall"' : ""}>${r.cells
          .map(asCell)
          .map((c) => `<td${c.rs ? ` rowspan="${c.rs}"` : ""}${c.cls ? ` class="${c.cls}"` : ""}>${esc(c.t)}</td>`)
          .join("")}</tr>`
    )
    .join("");
  return `<table class="acc-sheet"><colgroup><col class="c-a"/><col class="c-b"/><col class="c-c"/></colgroup><tbody>${header}<tr class="r-heading"><th>Description</th><th>Remarks</th><th>Additional remarks</th></tr>${body}</tbody></table>`;
};

// ---------- screen (JSX) ----------
const Parts = ({ parts }) =>
  parts.map((p, i) =>
    p.cls ? (
      <span key={i} className={p.cls}>
        {p.t}
      </span>
    ) : (
      <React.Fragment key={i}>{p.t}</React.Fragment>
    )
  );

const AccountSheet = ({ item }) => (
  <table className="acc-sheet">
    <colgroup>
      <col className="c-a" />
      <col className="c-b" />
      <col className="c-c" />
    </colgroup>
    <tbody>
      {buildHeader(item).map((r, i) => (
        <tr key={`h${i}`} className={r.cls}>
          <td colSpan={2}>
            <Parts parts={r.left} />
          </td>
          <td className={r.rightCls}>
            <Parts parts={r.right} />
          </td>
        </tr>
      ))}
      <tr className="r-heading">
        <th>Description</th>
        <th>Remarks</th>
        <th>Additional remarks</th>
      </tr>
      {buildBody(item).map((r, i) => (
        <tr key={`b${i}`} className={r.tall ? "r-tall" : undefined}>
          {r.cells.map(asCell).map((c, j) => (
            <td key={j} rowSpan={c.rs} className={c.cls}>
              {c.t}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

const ChecklistAccount = () => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);

  console.log("Bills Data:", billsData[0]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to enable printing");
      return;
    }

    // One A4 sheet per bill (9.10, item 1). The sheet is laid out at the
    // Excel sheet's own size (~692pt wide, ~918pt tall) and then scaled to
    // the printable area, exactly as Excel prints it (the client's sheet is
    // set to 76%). With 10mm margins that is ~0.78, i.e. the 13pt text
    // prints at ~10pt - the same look as her printout.
    const printStyles = `
      <style>
        ${SHEET_CSS}
        @page { size: A4 portrait; margin: 10mm; }
        html, body { margin: 0; padding: 0; background: #fff; }
        .print-page { width: max-content; }
        .print-page + .print-page { break-before: page; page-break-before: always; }
        .acc-sheet tr { break-inside: avoid; page-break-inside: avoid; }
        @media print {
          /* Fallback if the fit script below cannot run:
             190mm printable width / ~692pt sheet width. */
          .print-page { zoom: 0.77; }
        }
      </style>
    `;

    let printContent = `<html><head><title>Account Checklist</title>${printStyles}</head><body>`;
    billsData.forEach((item) => {
      printContent += `<div class="print-page">${sheetHtml(item)}</div>`;
    });
    printContent += `</body></html>`;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
      // Scale each bill so it fills, but never exceeds, one A4 printable
      // area (210 x 297mm less 10mm margins) - width is normally the limit;
      // a very long vendor / project name can make height the limit instead
      // (9.10, item 1; 6.10, item P-28).
      try {
        const pxPerMm = 96 / 25.4;
        const maxWidth = 190 * pxPerMm - 2;
        // 3% headroom on height: the printed layout can run slightly taller
        // than the on-screen measurement.
        const maxHeight = 277 * pxPerMm * 0.97;
        printWindow.document.querySelectorAll(".print-page").forEach((page) => {
          page.style.zoom = "1";
          const sheet = page.firstElementChild;
          const width = sheet.offsetWidth;
          const height = sheet.offsetHeight;
          if (width && height) {
            page.style.zoom = String(Math.min(1, maxWidth / width, maxHeight / height));
          } else {
            page.style.zoom = "";
          }
        });
      } catch (e) {
        console.error("Checklist fit check failed:", e);
      }
      printWindow.focus();
      printWindow.print();
      // Don't close immediately to allow user to see print dialog
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
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
      <style>{SHEET_CSS}</style>

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

      {/* Same sheet as the printout, at the Excel sheet's own size
          (9.10, item 1); scrolls sideways on narrow screens. */}
      <div className="overflow-x-auto p-6 min-h-screen">
        {currentItems.map((item, index) => (
          <div key={index} className="w-fit mx-auto bg-white shadow">
            <AccountSheet item={item} />
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
