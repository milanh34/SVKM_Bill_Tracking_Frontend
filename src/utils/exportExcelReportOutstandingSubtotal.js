import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
    describeReportCriteria,
    addCriteriaRows,
    fitCriteriaRows,
    generatedAtText,
    printCriteriaHtml,
    reportFileName,
} from "./reportExportCommon";

// The file is "<report name>_DDMMYYYY.xlsx" (1.10, item O-16a).
const REPORT_NAME = "Outstanding Bills Report Subtotal";
// The heading on the page, the sheet and the print.
const REPORT_TITLE = "Outstanding Bills Report Subtotal as on";

const DATE_FIELD = /date|Date|Dt|dt|Booking|booking|RecdAtSite|receivedBack|invReturnedToSite|returnedToPimo/i;
const isDateField = (field) => DATE_FIELD.test(field);
const isNumberField = (field) =>
    field.includes("amount") || field.includes("Amount") || field.endsWith("Amt") || field.endsWith("amt");

const formatCurrency = (value) => {
    if (value === undefined || value === null || value === "") return "";
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
    }).format(value);
};

const escapeHtml = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

/**
 * Parses a date value (DD-MM-YYYY string, ISO string, or Date object)
 * and returns a UTC Date object that preserves the original date
 * without any timezone conversion.
 */
const parseDateValue = (value) => {
    if (!value) return "";

    let day, month, year;

    if (typeof value === 'string') {
        // Check for DD-MM-YYYY format
        const ddmmyyyy = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
        if (ddmmyyyy) {
            day = parseInt(ddmmyyyy[1], 10);
            month = parseInt(ddmmyyyy[2], 10);
            year = parseInt(ddmmyyyy[3], 10);
        } else {
            // ISO string or other parseable date string
            const d = new Date(value);
            if (isNaN(d.getTime())) return "";
            day = d.getDate();
            month = d.getMonth() + 1;
            year = d.getFullYear();
        }
    } else if (value instanceof Date) {
        if (isNaN(value.getTime())) return "";
        day = value.getDate();
        month = value.getMonth() + 1;
        year = value.getFullYear();
    } else {
        return "";
    }

    if (!day || !month || !year || month < 1 || month > 12 || day < 1 || day > 31) {
        return "";
    }

    return new Date(Date.UTC(year, month - 1, day));
};

/** DD-MM-YYYY for the print. */
const formatDateForDisplay = (value) => {
    const d = parseDateValue(value);
    if (!(d instanceof Date)) return "";
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getUTCFullYear()}`;
};

const toNumber = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    const num = Number(String(value).replace(/[^\d.-]/g, ""));
    return !isNaN(num) ? num : 0;
};

const fieldValue = (item, field) => {
    if (field.includes(".")) {
        const [parentField, childField] = field.split(".");
        return item[parentField] ? item[parentField][childField] : "";
    }
    return item[field];
};

/**
 * One row of cell values per item, as { kind, values } where kind is
 * "data", "subtotal" or "total". Dates are Date objects and amounts numbers,
 * so the same rows serve the download and (formatted) the print.
 */
const buildRows = (dataToExport, columnsToExport) =>
    dataToExport.map((item) => {
        if (item.isSubtotal) {
            return {
                kind: "subtotal",
                values: columnsToExport.map(({ field }) => {
                    if (field === "vendorNo") return `Count: ${item.count}`;
                    if (field === "vendorName") return item.vendorName ?? "";
                    if (isNumberField(field)) {
                        if (field === "taxInvAmt" || field === "invoiceAmount") return toNumber(item.subtotalAmount);
                        if (field === "copAmt") return toNumber(item.subtotalCopAmt);
                        if (field === "paymentAmt") return toNumber(item.subtotalPaymentAmount);
                        return "";
                    }
                    return "";
                }),
            };
        }
        if (item.isGrandTotal) {
            return {
                kind: "total",
                values: columnsToExport.map(({ field }) => {
                    if (field === "vendorNo") return `Total Count: ${item.totalCount}`;
                    if (isNumberField(field)) {
                        if (field === "taxInvAmt" || field === "invoiceAmount") return toNumber(item.grandTotalAmount);
                        if (field === "copAmt") return toNumber(item.grandTotalCopAmt);
                        if (field === "paymentAmt") return toNumber(item.grandTotalPaymentAmount);
                        return "";
                    }
                    return "";
                }),
            };
        }
        return {
            kind: "data",
            values: columnsToExport.map(({ field }) => {
                const value = fieldValue(item, field);
                if (isDateField(field)) return parseDateValue(value);
                if (isNumberField(field)) return toNumber(value);
                return value !== undefined && value !== null && value !== "N/A" ? value : "";
            }),
        };
    });

/**
 * Download, as the other report downloads are built: title and date/time,
 * the selection criteria, a blank row, then the column headings and the rows.
 *
 * It was written with SheetJS, which drops cell styles, and opened straight
 * on the timestamp - there was no title or styled heading row (6.10, item 18).
 */
const downloadWorkbook = async (rows, columnsToExport, criteria) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bills Report");
    const columnCount = columnsToExport.length;
    const now = new Date();

    const titleValues = Array(columnCount).fill("");
    titleValues[0] = REPORT_TITLE;
    titleValues[columnCount - 1] = generatedAtText(now);
    const titleRow = worksheet.addRow(titleValues);
    if (columnCount >= 3) worksheet.mergeCells(1, 1, 1, columnCount - 1);
    titleRow.getCell(1).font = { bold: true, size: 24 };
    titleRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    const timestampCell = titleRow.getCell(columnCount);
    timestampCell.font = { italic: true, size: 12 };
    timestampCell.alignment = { horizontal: "right", vertical: "middle" };

    // "Selection Criteria - ", one row per line (6.10, items 14, 15).
    const criteriaRows = addCriteriaRows(worksheet, criteria, columnCount);

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(columnsToExport.map((col) => col.headerName));
    const headerRowNumber = headerRow.number;
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "000000" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "f8f9fa" } };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
        };
    });

    rows.forEach(({ kind, values }) => {
        const newRow = worksheet.addRow(values);
        newRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const field = columnsToExport[colNumber - 1]?.field || "";
            if (kind !== "data") {
                cell.font = { bold: true };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: kind === "total" ? "FFE9ECEF" : "FFF8F9FA" },
                };
            }
            if (isDateField(field) && cell.value instanceof Date) {
                cell.numFmt = "DD-MM-YYYY";
            }
            if (isNumberField(field) && typeof cell.value === "number") {
                cell.numFmt = "#,##0.00";
                cell.alignment = { horizontal: "right" };
            }
        });
    });

    // Widths from the heading and the rows; the merged title and criteria never
    // drive one, the timestamp still sizes the last column.
    worksheet.columns.forEach((column, columnIndex) => {
        let maxLength = 0;
        const isLastColumn = columnIndex === columnCount - 1;
        column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
            if (rowNumber < headerRowNumber && !(rowNumber === titleRow.number && isLastColumn)) return;
            const length = cell.value
                ? (cell.value instanceof Date ? 10 : cell.value.toString().length)
                : 10;
            if (length > maxLength) maxLength = length;
        });
        column.width = Math.max(maxLength + 2, 15);
    });

    fitCriteriaRows(worksheet, criteriaRows, columnCount);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    // "<report name>_DDMMYYYY.xlsx" (1.10, item O-16a).
    saveAs(blob, reportFileName(REPORT_NAME, now));
};

/**
 * Print only. It used to build the workbook, DOWNLOAD it, and then print an
 * HTML copy - so the save window opened before the print (6.10, items 17, 33).
 */
const printReport = (rows, columnsToExport, criteria, dataRowCount) => {
    const filterDetailsHtml = printCriteriaHtml(criteria, dataRowCount);

    const headHtml = columnsToExport.map((col) => `<th>${escapeHtml(col.headerName)}</th>`).join("");
    const bodyHtml = rows
        .map(({ kind, values }) => {
            const rowClass = kind === "subtotal" ? "count-row" : kind === "total" ? "total-row" : "";
            const cells = values
                .map((value, i) => {
                    const field = columnsToExport[i].field;
                    if (isDateField(field) && value instanceof Date) {
                        return `<td class="date">${formatDateForDisplay(value)}</td>`;
                    }
                    if (isNumberField(field) && typeof value === "number") {
                        return `<td class="amount-column">${formatCurrency(value)}</td>`;
                    }
                    return `<td>${escapeHtml(value)}</td>`;
                })
                .join("");
            return `<tr class="${rowClass}">${cells}</tr>`;
        })
        .join("");

    const html = `<html><head><title>${REPORT_TITLE}</title><style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f8f9fa; color: #000000; font-size: 14px; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #ddd; }
        td { padding: 8px; font-size: 10.5px; border: 1px solid #ddd; text-align: left; }
        .amount-column { text-align: right; }
        .date { white-space: nowrap; }
        .timestamp { font-style: italic; padding: 15px; padding-right: 4px; }
        .count-row { background-color: #F8F9FA; font-weight: bold; }
        .total-row { background-color: #E9ECEF; font-weight: bold; }
        .report-header { background-color: #D3D3D3; margin-bottom: 0px; display: flex; justify-content: space-between; }
        .report-title { font-size: 24px; font-weight: bold; text-align: left; padding: 15px; }
        .report-filters { font-size: 14px; font-weight: normal; text-align: left; padding: 6px 15px 12px 15px; line-height: 1.5; }
        @media print {
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            @page { margin: 0.5cm; }
        }
    </style></head><body>
        <div class="report-header">
            <div class="report-title">${REPORT_TITLE}</div>
            <div class="timestamp">${generatedAtText()}</div>
        </div>
        ${filterDetailsHtml}
        <table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
    </body></html>`;

    // A standard window, to avoid the 0x0 iframe viewport layout bugs.
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
        alert("Please allow pop-ups to enable printing");
        return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = function () {
        printWindow.close();
    };
};

export const handleExportOutstandingSubtotalReport = async (selectedRows, filteredData, columns, visibleColumnFields, toPrint, filters = null) => {
    try {
        const dataToExport = selectedRows.length > 0
            ? filteredData.filter((item) => selectedRows.includes(item._id))
            : filteredData;

        if (dataToExport.length === 0) {
            throw new Error("Please select at least one row to download");
        }

        const columnsToExport = columns.filter((col) => visibleColumnFields.includes(col.field));
        // Region and date range, as the other reports carry (1.10, item O-16c).
        const criteria = describeReportCriteria(filters);
        const dataRowCount = dataToExport.filter((item) => !item.isSubtotal && !item.isGrandTotal).length;
        const rows = buildRows(dataToExport, columnsToExport);

        if (toPrint) {
            printReport(rows, columnsToExport, criteria, dataRowCount);
            return { success: true, message: "Report sent to print" };
        }

        await downloadWorkbook(rows, columnsToExport, criteria);
        return { success: true, message: "Report downloaded successfully" };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Failed to download report: " + (error.message || "Unknown error")
        };
    }
};
