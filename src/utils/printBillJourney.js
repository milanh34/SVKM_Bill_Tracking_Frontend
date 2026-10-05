import logo from "../assets/logo.png";
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
    { label: "Dt given-Site Approval", date: "siteApprovalDate" },
    { label: "Bill Received at Site", date: "billReceivedAtSite", name: "billReceivedAtSiteName" },
    { label: "Bill send for Quality Certification", date: "billSendForQualityCertification", name: "billSendForQualityCertificationName" },
    { label: "Bill send to QS", date: "billSendToQS", name: "billSendToQSName" },
    { label: "Certified by QS", date: "certifiedByQS", amount: "certifiedByQSAmount" },
    { label: "Certified by Arch/PMC/SVKM", date: "certifiedByArch", name: "certifiedByArchName" },
    { label: "Bill send to Site Engineer/ Site Incharge", date: "billSendToSiteEngineer", name: "billSendToSiteEngineerName" },
    { label: "MIGO Date / MIGO No.", date: "migoDateNo", fallbackDate: "migoDate", name: "migoDoneBy", amount: "migoAmount" },
    { label: "Bill Send to PIMO Mumbai", date: "billSendToPIMOMumbai" },
    { label: "Bill Received at PIMO Mumbai", date: "billReceivedAtPIMOMumbai", name: "billReceivedAtPIMOMumbaiName" },
    { label: "Bill Send to QS Certification", date: "billSendToQSCertification", name: "billSendToQSCertificationName" },
    { label: "Received from QS With COP", date: "receivedFromQSWithCOP", name: "receivedFromQSWithCOPName", amount: "receivedFromQSWithCOPAmount" },
    { label: "Given to I.T. Dept.", date: "givenToITDept", name: "givenToITDeptName" },
    { label: "Received Back from I.T.Dept.", date: "receivedBackFromITDept", name: "receivedBackFromITDeptName" },
    { label: "SES Date / SES No.", date: "sesDateNo", fallbackDate: "sesDate", name: "sesDoneBy", amount: "sesAmount" },
    { label: "Certified by Trustee, Adviser & Director", date: "certifiedByProjectDirector" },
    { label: "Submitted to Accounts Department", date: "submittedToAccountsDepartment", name: "submittedToAccountsDepartmentName" },
    { label: "Received in Accounts Department", date: "receivedInAccountsDepartment", name: "receivedInAccountsDepartmentName" },
    { label: "Date of Payment", date: "paymentDate", amount: "paymentAmt" },
];

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
    const currency = escapeHtml(bill.currency || "");
    const withCurrency = (amount) => {
        const text = displayAmount(amount);
        return text ? `${currency} ${text}`.trim() : "";
    };

    const stepRows = JOURNEY_STEPS.map((step) => {
        const date = displayDate(bill[step.date] || (step.fallbackDate ? bill[step.fallbackDate] : ""));
        const name = step.name ? bill[step.name] : "";
        const amount = step.amount ? withCurrency(bill[step.amount]) : "";
        return `<tr>
            <td class="nowrap">${escapeHtml(date)}</td>
            <td>${escapeHtml(step.label)}</td>
            <td>${escapeHtml(name)}</td>
            <td class="amount">${amount}</td>
            <td></td>
        </tr>`;
    }).join("");

    return `<div class="journey-page">
        <div class="row head">
            <img src="${logo}" alt="" class="logo" />
            <span>Region-Project Name: <b>${escapeHtml(bill.region)} - ${escapeHtml(bill.projectDescription)}</b></span>
            <b>${escapeHtml(bill.srNo)}</b>
            <span>Nature of Work: <b>${escapeHtml(bill.natureOfWork || bill.typeOfInv || "")}</b></span>
        </div>
        <div class="row grid-2">
            <div>Proforma Inv &amp; Date &amp; Amt: <b>${joinFilled([
                escapeHtml(bill.proformaInvNo),
                escapeHtml(displayDate(bill.proformaInvDate)),
                withCurrency(bill.proformaInvAmt),
            ])}</b></div>
            <div>Payment Status: <b>${escapeHtml(bill.status)}</b></div>
        </div>
        <div class="row grid-3">
            <div>Invoice No: <b>${escapeHtml(bill.taxInvNo)}</b></div>
            <div>Dt: <b>${escapeHtml(displayDate(bill.invoiceDate || bill.taxInvDate))}</b></div>
            <div>Invoice Amt: <b>${withCurrency(bill.invoiceAmount ?? bill.taxInvAmt)}</b></div>
        </div>
        <div class="row grid-2">
            <div>Vendor: <b>${escapeHtml(bill.vendorName)}</b></div>
            <div>SAP Code: <b>${escapeHtml(bill.vendorNo)}</b></div>
        </div>
        <div class="row">PO no and Date and Amt: <b>${joinFilled([
            escapeHtml(bill.poNo),
            escapeHtml(displayDate(bill.poDate)),
            withCurrency(bill.poAmt),
        ], " &amp; ")}</b></div>
        <div class="row">Remarks: <b>${escapeHtml(bill.department)}</b></div>
        <table>
            <thead>
                <tr>
                    <th style="width: 15%">Date</th>
                    <th style="width: 35%">Description</th>
                    <th style="width: 22%">Name</th>
                    <th style="width: 14%">Amount</th>
                    <th>Signature</th>
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

    win.document.write(`<html>
        <head>
            <title>Bill Journey</title>
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: Arial, sans-serif; font-size: 12px; margin: 10px; }
                .journey-page { page-break-after: always; }
                .journey-page:last-child { page-break-after: avoid; }
                .generated { text-align: right; font-style: italic; margin-bottom: 6px; }
                .row { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; overflow-wrap: anywhere; }
                .head { display: flex; align-items: center; gap: 16px; background: #e5e7eb; }
                .logo { height: 36px; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
                .grid-2 > *, .grid-3 > * { min-width: 0; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                th, td { border: 1px solid #d1d5db; padding: 5px 7px; text-align: left; overflow-wrap: anywhere; }
                th { background: #f3f4f6; }
                td.amount { text-align: right; }
                td.nowrap { white-space: nowrap; }
            </style>
        </head>
        <body>
            <div class="generated">${generatedAtText()}</div>
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
