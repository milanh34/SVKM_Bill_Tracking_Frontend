import { generatedAtText } from "./reportExportCommon";

/**
 * Print Bill Journey (1.10, item O-17): one page per selected bill, from the
 * rows the Bill Journey report already holds.
 *
 * The button used to open the bill checklist page, which printed a fixed
 * list of step labels with the Date, Name and Signature cells hard-coded
 * blank (only "Bill Received at Site" read a value), so a bill with every
 * step filled still printed empty. Each step below names the report field
 * its date, name and amount come from - the same keys the report columns use.
 */
export const JOURNEY_STEPS = [
    { label: "Bill Received at Site", date: "billReceivedAtSite", name: "billReceivedAtSiteName" },
    { label: "Bill send for Quality Certification", date: "billSendForQualityCertification", name: "billSendForQualityCertificationName" },
    /*
     * One step per date/name column pair, as built on 6 October: a bill sent
     * to QS for measurement AND for Prov COP, or to both a Site Engineer and a
     * Site Incharge, shows both dates. Her 9 October scans merged these into
     * one line each; kept separate by decision on 12 October.
     */
    { label: "Bill send to QS for measure", date: "qsMeasureGivenDate", name: "qsMeasureGivenName" },     // 35 / 36
    { label: "Bill send to QS for Prov COP", date: "qsProvCopGivenDate", name: "qsProvCopGivenName" },    // 40 / 41
    { label: "Certified by QS", date: "certifiedByQS", amount: "certifiedByQSAmount" },                  // 42 / 43
    { label: "Certified by Arch/PMC/SVKM", date: "certifiedByArch", name: "certifiedByArchName" },        // 53 / 54
    { label: "Bill send to Site Engineer", date: "siteEngineerGivenDate", name: "siteEngineerGivenName" }, // 51 / 52
    { label: "Bill send to Site Incharge", date: "siteInchargeGivenDate", name: "siteInchargeGivenName" }, // 55 / 56
    // Column 47 only - the MIGO no is gone from label and value (6.10, item 2 i).
    { label: "MIGO Date", date: "migoDate", name: "migoDoneBy", amount: "migoAmount" },                   // 47 / 49 / 48
    // Was "Dt given-Site Approval", printed first with no name; renamed and
    // placed after MIGO Date, name from col 59 (6.10, items 1 iii, 2 viii-ix).
    // Her 9 October mark names "Column 58" for this name; 58 is the date
    // column, so the name stays on 59 (9.10, item 1).
    { label: "Site Trustee/LPC", date: "siteApprovalDate", name: "siteApprovalName" },                    // 58 / 59
    { label: "Bill Send to PIMO Mumbai", date: "billSendToPIMOMumbai", name: "billSendToPIMOMumbaiName" },  // 61 / 61A
    { label: "Bill Received at PIMO Mumbai", date: "billReceivedAtPIMOMumbai", name: "billReceivedAtPIMOMumbaiName" },
    { label: "Bill Send to QS Certification", date: "billSendToQSCertification", name: "billSendToQSCertificationName" },
    { label: "Received from QS With COP", date: "receivedFromQSWithCOP", name: "receivedFromQSWithCOPName", amount: "receivedFromQSWithCOPAmount" },
    { label: "Given to I.T. Dept.", date: "givenToITDept", name: "givenToITDeptName" },
    { label: "Received Back from I.T.Dept.", date: "receivedBackFromITDept", name: "receivedBackFromITDeptName" },
    // Column 74 only - the SES no is gone from label and value (6.10, item 2 ii).
    { label: "SES Date", date: "sesDate", name: "sesDoneBy", amount: "sesAmount" },                      // 74 / 74A / 73
    { label: "Certified by Trustee, Adviser & Director", date: "certifiedByProjectDirector" },
    // Shorter labels (12.10, item 1 iii).
    { label: "Submitted to Accts Dept", date: "submittedToAccountsDepartment", name: "submittedToAccountsDepartmentName" },
    { label: "Received in Accts Dept", date: "receivedInAccountsDepartment", name: "receivedInAccountsDepartmentName" },
    { label: "Date of Payment", date: "paymentDate", amount: "paymentAmt" },
];

/** A step's date / name from a report row, falling back where the step names a second column. */
const firstFilled = (row, ...keys) => keys.reduce((found, key) => found || (key ? row?.[key] : "") || "", "");
export const journeyStepDate = (row, step) => firstFilled(row, step.date, step.fallbackDate);
export const journeyStepName = (row, step) => firstFilled(row, step.name, step.fallbackName);

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const pad = (n) => String(n).padStart(2, "0");

/**
 * DD-MM-YYYY. The report sends most dates already formatted that way, which
 * `new Date()` cannot read; a few header dates still come as ISO timestamps.
 */
const displayDate = (value) => {
    if (!value) return "";
    const text = String(value);
    if (/^\d{1,2}-\d{1,2}-\d{4}/.test(text)) return text; // already DD-MM-YYYY (or "date / no")
    const d = new Date(text);
    if (isNaN(d.getTime())) return text;
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};

const displayAmount = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const joinFilled = (parts, sep = " &nbsp;&nbsp; ") => parts.filter(Boolean).join(sep);

const billPage = (bill) => {
    // Amounts print as the number alone, two decimals - no currency
    // (6.10, item 2 v).
    const amountText = (amount) => escapeHtml(displayAmount(amount));

    const stepRows = JOURNEY_STEPS.map((step) => {
        const date = displayDate(journeyStepDate(bill, step));
        const name = journeyStepName(bill, step);
        const amount = step.amount ? amountText(bill[step.amount]) : "";
        return `<tr>
            <td class="nowrap">${escapeHtml(date)}</td>
            <td>${escapeHtml(step.label)}</td>
            <td>${escapeHtml(name)}</td>
            <td class="amount">${amount}</td>
        </tr>`;
    }).join("");

    return `<div class="journey-page">
        <div class="generated">${generatedAtText()}</div>
        <div class="row head">
            <b class="brand">SVKM</b>
            <!-- "Name" struck out of the label (9.10, item 1). -->
            <span class="grow">Region-Project: <b>${escapeHtml(bill.region)} - ${escapeHtml(bill.projectDescription)}</b></span>
            <b>${escapeHtml(bill.srNo)}</b>
            <span>Nature of Work: <b>${escapeHtml(bill.natureOfWork || bill.typeOfInv || "")}</b></span>
        </div>
        <!--
            The right-hand column lines up Created by, Invoice Amt, SAP Code and
            Payment Status (9.10, item 1): Created by (col 2) takes Payment
            Status's place here, and Payment Status (col 93) moves to the PO row.
            Proforma no, date and amount joined by "&".
        -->
        <div class="row grid-3">
            <div class="span-2">Proforma Inv &amp; Date &amp; Amt: <b>${joinFilled([
                escapeHtml(bill.proformaInvNo),
                escapeHtml(displayDate(bill.proformaInvDate)),
                amountText(bill.proformaInvAmt),
            ], " &amp; ")}</b></div>
            <div>Created by: <b>${escapeHtml(bill.createdBy)}</b></div>
        </div>
        <div class="row grid-3">
            <div>Invoice No: <b>${escapeHtml(bill.taxInvNo)}</b></div>
            <div>Dt: <b>${escapeHtml(displayDate(bill.invoiceDate || bill.taxInvDate))}</b></div>
            <div>Invoice Amt: <b>${amountText(bill.invoiceAmount ?? bill.taxInvAmt)}</b></div>
        </div>
        <div class="row grid-3">
            <div class="span-2">Vendor: <b>${escapeHtml(bill.vendorName)}</b></div>
            <div>SAP Code: <b>${escapeHtml(bill.vendorNo)}</b></div>
        </div>
        <div class="row grid-3">
            <div class="span-2">PO no and Date and Amt: <b>${joinFilled([
                escapeHtml(bill.poNo),
                escapeHtml(displayDate(bill.poDate)),
                amountText(bill.poAmt),
            ], " &amp; ")}</b></div>
            <div>Payment Status: <b>${escapeHtml(bill.status)}</b></div>
        </div>
        <!-- Remarks = col 27, Additional Info = col 26, E-Way Bill = col 25A (9.10, item 1). -->
        <div class="row">Remarks: <b>${escapeHtml(bill.remarksBySiteTeam)}</b></div>
        <div class="row">Additional Info: <b>${escapeHtml(bill.department)}</b></div>
        <div class="row">E-Way Bill: <b>${escapeHtml(bill.eWayBill)}</b></div>
        <!-- No Signature column (6.10, item 2 vi); Name column widened (9.10, item 1). -->
        <table>
            <thead>
                <tr>
                    <!-- Date and Description narrower so Amt fits 99,12,10,256.12 on
                         one line (12.10, item 1 i-ii). -->
                    <th style="width: 12%">Date</th>
                    <th style="width: 29%">Description</th>
                    <th style="width: 36%">Name</th>
                    <th style="width: 23%">Amt</th>
                </tr>
            </thead>
            <tbody>${stepRows}</tbody>
        </table>
    </div>`;
};

export const printBillJourney = (bills) => {
    const list = (bills || []).filter((bill) => bill && !bill.isGrandTotal && !bill.isSubtotal);
    if (list.length === 0) return;

    const win = window.open("", "_blank");
    if (!win) {
        alert("Please allow pop-ups to enable printing");
        return;
    }

    /*
     * No browser header/footer - date/time, "Bill Journey", "about:blank",
     * page number (9.10, item 1). The page margin is zero, so the browser has
     * no room to print them, and the title is blank; the white space comes
     * from padding on each bill's page, repeated if a bill runs onto a second
     * sheet.
     */
    win.document.write(`<html>
        <head>
            <title></title>
            <style>
                @page { size: A4; margin: 0; }
                html, body { margin: 0; padding: 0; }
                body { font-family: Arial, sans-serif; font-size: 12px; }
                .journey-page {
                    padding: 10mm 12mm;
                    box-decoration-break: clone;
                    -webkit-box-decoration-break: clone;
                    page-break-after: always;
                }
                .journey-page:last-child { page-break-after: avoid; }
                .generated { text-align: right; font-style: italic; margin-bottom: 6px; }
                .row { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; overflow-wrap: anywhere; }
                .head { display: flex; align-items: center; gap: 16px; background: #e5e7eb; }
                .head > * { min-width: 0; }
                .head .grow { flex: 1 1 auto; }
                .brand { font-size: 16px; letter-spacing: 1px; }
                .split { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; }
                .split .right { text-align: right; max-width: 40ch; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
                .grid-2 > *, .grid-3 > * { min-width: 0; }
                .span-2 { grid-column: span 2; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                th, td { border: 1px solid #d1d5db; padding: 5px 7px; text-align: left; overflow-wrap: anywhere; }
                th { background: #f3f4f6; }
                td.amount { text-align: right; white-space: nowrap; overflow-wrap: normal; }
                td.nowrap { white-space: nowrap; }
            </style>
        </head>
        <body>
            ${list.map(billPage).join("")}
        </body>
    </html>`);
    win.document.close();

    win.onload = () => {
        setTimeout(() => {
            win.focus();
            win.print();
            win.close();
        }, 250);
    };
};

export default printBillJourney;
