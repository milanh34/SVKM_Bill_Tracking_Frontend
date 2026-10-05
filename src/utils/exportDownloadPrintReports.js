import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from 'react-toastify';
import {
    describeReportCriteria,
    criteriaLine,
    generatedAtText,
    printCriteriaHtml,
    reportFileName,
} from './reportExportCommon';

const formatCurrency = (value) => {
    if (value === undefined || value === null) return "";
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true,
    }).format(value);
};

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
            // Use local date parts to preserve the intended date (avoids -5:30 shift)
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
        console.log("Here");
        return "";
    }

    if (!day || !month || !year || month < 1 || month > 12 || day < 1 || day > 31) {
        return "";
    }

    // Create date using UTC to prevent timezone offset during Excel serial number conversion
    return new Date(Date.UTC(year, month - 1, day));
};

/** Formats a date value as DD-MM-YYYY string for display/print */
const formatDateForDisplay = (value) => {
    const d = parseDateValue(value);
    if (d === "" || !(d instanceof Date)) return "";
    const dd = d.getUTCDate().toString().padStart(2, '0');
    const mm = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

// Shared with the Outstanding exporters (1.10, items O-16a-d).
export { describeReportCriteria };

const OUTSTANDING_TITLES = ["Outstanding Bills Report as on", "Outstanding Bills Report Subtotal as on"];

const isTotalRow = (row) => !!(row && (row.isGrandTotal || row.isSubtotal));

const formatTotal = (n) =>
    Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The sum of a column over the data rows, for a total the row does not carry.
const sumField = (rows, field) =>
    rows.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);

/*
 * A total the row carries, or the column's own sum when it carries none.
 * A missing key used to print "Grand Total: undefined" (Bill Kidhar's
 * Payment Amt, 1.10 item O-16e); a zero total now prints 0.00.
 */
const totalOf = (row, key, dataRows, field) => {
    const value = row[key];
    return value === undefined || value === null || value === ""
        ? sumField(dataRows, field)
        : Number(value) || 0;
};

/**
 * The text of one cell of the grand-total row, the same for download and
 * print. The count always shows: in the Count column, in Sr No, or - when a
 * report shows neither - in its first column (1.10, items O-16e/f, O-18).
 */
const grandTotalCellText = (column, columnIndex, row, titleName, dataRows, hasCountColumn) => {
    const field = column.field;
    const outstanding = OUTSTANDING_TITLES.includes(titleName);
    const count = (outstanding ? row.totalCount : row.count) ?? dataRows.length;

    if (field === "count") return `Total: ${count}`;
    if (field === "srNo" || (!hasCountColumn && columnIndex === 0)) return `Total Count: ${count}`;
    // A row added only to carry the count has no amounts.
    if (row.countOnly) return "";

    if (field === "taxInvAmt" || field === "invoiceAmount") {
        return `Grand Total: ${formatTotal(totalOf(row, outstanding ? "grandTotalAmount" : "grandTotalTaxAmount", dataRows, field))}`;
    }
    if (field === "copAmt" || field === "copAmount") {
        return `Grand Total: ${formatTotal(totalOf(row, "grandTotalCopAmt", dataRows, field))}`;
    }
    if (field === "paymentAmt" || field === "payentAmt") {
        return `Grand Total: ${formatTotal(totalOf(row, outstanding ? "grandTotalPaymentAmount" : "grandTotalAmount", dataRows, field))}`;
    }
    return "";
};

export const handleExportAllReports = async (
    selectedRows,
    filteredData,
    columns,
    visibleColumnFields,
    titleName,
    toPrint,
    filters = null,
    options = {}
) => {
    // rowKey: the field `selectedRows` holds. Vendor Details passes "vendorNo";
    // matching on srNo, which vendors do not have, refused every download and
    // print with "Select at least one row" (1.10, item O-16g).
    const { rowKey = "srNo" } = options;
    try {
        // const dataToExport = selectedRows.length > 0
        //     ? filteredData.filter((item) => selectedRows.includes(item._id))
        //     : filteredData;
        var dataToExport = filteredData.filter((item) => selectedRows.includes(item[rowKey]) || item.isGrandTotal === true);

        if ((dataToExport.length === 1 && dataToExport[0].isGrandTotal === true) || dataToExport.length === 0) {
            // throw new Error("Please select at least one row to download");
            toast.error("Select atleast one row to download");
            return { success: false, message: "Select atleast one row to download" };
        }

        // const essentialFields = [
        //     "copAmt",
        //     "srNo",
        //     "region",
        //     "vendorNo",
        //     "vendorName",
        //     "taxInvNo",
        //     "taxInvDate",
        //     "taxInvAmt",
        //     "dateRecdInAcctsDept",
        //     "natureOfWorkSupply"
        // ];
        const allColumnsToExport = columns.filter((col) => visibleColumnFields.includes(col.field));
        const dataRows = dataToExport.filter((row) => !isTotalRow(row));
        const hasCountColumn = allColumnsToExport.some((col) => col.field === "count" || col.field === "srNo");

        // Reports without a grand-total row (Bill Journey, Vendor Details)
        // still end on their count (1.10, items O-16f, O-18).
        if (!dataToExport.some((row) => row.isGrandTotal)) {
            dataToExport = [...dataToExport, { isGrandTotal: true, countOnly: true, count: dataRows.length }];
        }

        if (!toPrint) {

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(titleName.replace(/\//g, '_'));

            const columnCount = allColumnsToExport.length;

            // Title should go from A to columnCount - 1
            const titleSpanEndCol = columnCount - 1;

            // Generate Excel column letters
            const getColLetter = (index) => {
                let col = "", temp;
                while (index > 0) {
                    temp = (index - 1) % 26;
                    col = String.fromCharCode(65 + temp) + col;
                    index = Math.floor((index - temp - 1) / 26);
                }
                return col;
            };

            const now = new Date();
            // Date and time at the top right of every report (1.10, item O-16b).
            const timestampText = generatedAtText(now);

            // Add an empty row of correct length
            const rowValues = Array(columnCount).fill("");
            // Set values
            rowValues[0] = titleName;
            rowValues[columnCount - 1] = timestampText;

            // Add the row to worksheet
            const titleRow = worksheet.addRow(rowValues);
            // Merge title across A to second-last column
            worksheet.mergeCells(`A1:${getColLetter(titleSpanEndCol)}1`);

            // Style title cell
            const titleCell = titleRow.getCell(1); // A1
            titleCell.font = { bold: true, size: 24 };
            titleCell.alignment = { horizontal: "left", vertical: "middle" };

            // Style timestamp cell
            const timestampCell = titleRow.getCell(columnCount); // Last cell
            timestampCell.font = { italic: true, size: 12 };
            timestampCell.alignment = { horizontal: "right", vertical: "middle" };

            /*
             * The criteria the report was run with, written into the sheet
             * itself. The download carried none at all (observation N-03), so
             * a saved file could not be told apart from one run on different
             * dates or a different region.
             */
            const criteria = describeReportCriteria(filters);
            let criteriaRow = null;
            if (criteria) {
                const criteriaValues = Array(columnCount).fill("");
                criteriaValues[0] = criteriaLine(criteria);
                criteriaRow = worksheet.addRow(criteriaValues);
                // Across the whole table and wrapped, so a long region list
                // cannot widen column A (1.10, item O-16d).
                if (columnCount >= 2) {
                    worksheet.mergeCells(`A2:${getColLetter(columnCount)}2`);
                }
                criteriaRow.getCell(1).font = { italic: true, size: 12 };
                criteriaRow.getCell(1).alignment = { horizontal: "left", vertical: "top", wrapText: true };
            }

            // Optionally, add spacing below
            worksheet.addRow([]);

            // Header Row
            const headerRow = worksheet.addRow(allColumnsToExport.map(col => col.headerName));
            const headerRowNumber = headerRow.number;
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: "000000" } };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "f8f9fa" }, // light grey
                };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                    top: { style: "thin" },
                    bottom: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                };
            });

            // Data Rows
            let dataRowNumber = 0;
            dataToExport.forEach((rowData) => {
                let rowValues;
                const rowIndex = isTotalRow(rowData) ? -1 : dataRowNumber++;
                // console.log("Row data: ", rowData);

                if (rowData.isSubtotal) {
                    // Subtotal row
                    //     console.log("In subtotal row");
                    //     rowValues = allColumnsToExport.map((column) => {
                    //     const field = column.field;
                    //     console.log("Column field: ", column.field);

                    //     if (field === "vendorName") {
                    //         return rowData.subtotalLabel || `Subtotal for ${rowData.vendorName}`;
                    //     }
                    //     if (field === "taxInvAmt") {
                    //         return rowData.subtotalAmount || 0;
                    //     }
                    //     if (field === "copAmt") {
                    //         return rowData.subtotalCopAmt || 0;
                    //     }
                    //     if (field === "srNo") {
                    //         return ""; // You can return empty or '—'
                    //     }

                    //     return ""; // Empty for other columns
                    // });
                    return;
                } else if (rowData.isGrandTotal) {
                    rowValues = allColumnsToExport.map((column, columnIndex) =>
                        grandTotalCellText(column, columnIndex, rowData, titleName, dataRows, hasCountColumn)
                    );
                } else {
                    // Normal data row
                    rowValues = allColumnsToExport.map((column) => {
                        let value;
                        // A running 1-based row number, not a field on the bill.
                        if (column.field === "count") return rowIndex + 1;
                        if (column.field.includes(".")) {
                            const [parentField, childField] = column.field.split(".");
                            value = rowData[parentField]?.[childField] ?? "";
                        } else {
                            value = rowData[column.field];
                        }

                        if (
                            column.field.includes("amount") ||
                            column.field.includes("Amount") ||
                            column.field.endsWith("Amt") ||
                            column.field.endsWith("amt")
                        ) {
                            return typeof value === "number" ? value : 0;
                        }

                        else if (
                            /date|Date|Dt|dt|Booking|booking|RecdAtSite|receivedBack|invReturnedToSite|returnedToPimo/i.test(column.field)
                        ) {
                            return parseDateValue(value);
                        }

                        // return value ?? "";
                        // to not print N/A
                        if (value === "N/A" || value === null || value === undefined) {
                            return "";
                        }

                        return value;
                    });
                }

                const newRow = worksheet.addRow(rowValues);

                // Row Styling
                newRow.eachCell((cell, colNumber) => {
                    const colField = allColumnsToExport[colNumber - 1].field;

                    if (rowData.isGrandTotal || rowData.isSubtotal) {
                        // Subtotal styling
                        cell.font = { bold: true };
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFF9F9F9" }, // Light orange
                        };
                    }
                    // else if ((rowIndex + 1) % 2 === 0) {
                    //     // Zebra striping for normal rows
                    //     cell.fill = {
                    //         type: "pattern",
                    //         pattern: "solid",
                    //         fgColor: { argb: "FFF9F9F9" },
                    //     };
                    // }

                    // Date field formatting
                    const isDateField = /date|Date|Dt|dt|Booking|booking|RecdAtSite|receivedBack|invReturnedToSite|returnedToPimo/i.test(colField);
                    if (isDateField && cell.value instanceof Date) {
                        cell.numFmt = 'DD-MM-YYYY';
                    }

                    if (
                        colField.includes("amount") ||
                        colField.includes("Amount") ||
                        colField.endsWith("Amt") ||
                        colField.endsWith("amt")
                    ) {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: "right" };
                    }
                });
            });

            // Auto column widths
            // The merged title and criteria never drive a width; the timestamp
            // still sizes the last column (1.10, item O-16d).
            worksheet.columns.forEach((column, columnIndex) => {
                let maxLength = 0;
                const isLastColumn = columnIndex === columnCount - 1;
                column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
                    if (rowNumber < headerRowNumber && !(rowNumber === titleRow.number && isLastColumn)) return;
                    const cellLength = cell.value
                        ? (cell.value instanceof Date ? 10 : cell.value.toString().length)
                        : 10;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                });
                column.width = Math.max(maxLength + 2, 15);
            });

            // A merged cell does not grow to fit wrapped text; size the criteria row.
            if (criteriaRow) {
                const tableWidth = worksheet.columns.reduce((acc, col) => acc + (col.width || 10), 0);
                const text = String(criteriaRow.getCell(1).value || "");
                const lines = Math.max(1, Math.ceil((text.length * 1.1) / Math.max(tableWidth, 1)));
                criteriaRow.height = Math.max(18, lines * 16);
            }

            // Export as Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // const filename = `${titleName.replace(/[\/ ]/g, '_')}_${now.toLocaleDateString('en-IN')}_${now.toLocaleTimeString('en-IN', { hour12: false })}.xlsx`;        // replace '/' and 'space' with _
            // const filename = `${titleName.replace(/[\/ ]/g, '_')}_${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.xlsx`;
            // "<report name>_DDMMYYYY.xlsx" (1.10, item O-16a).
            saveAs(blob, reportFileName(titleName, now));

            return { success: true, message: "Report downloaded successfully" };
        }

        if (toPrint) {

            let printRowNumber = 0;
            const excelData = dataToExport.map((row) => {
                // Skip subtotal rows (return null and filter out later)
                if (row.isSubtotal) {
                    return null;
                }

                const formattedRow = {};

                if (row.isSubtotal) {
                    return;
                }
                else if (row.isGrandTotal) {
                    // The same cells as the download, count included (1.10, item O-18).
                    allColumnsToExport.forEach((column, columnIndex) => {
                        formattedRow[column.headerName] =
                            grandTotalCellText(column, columnIndex, row, titleName, dataRows, hasCountColumn);
                    });
                } else {
                    // Normal data row handling
                    printRowNumber += 1;
                    allColumnsToExport.forEach((column) => {
                        let value;
                        // The Count column numbers the rows, as on screen and in
                        // the download; print left it blank (1.10, item O-18).
                        if (column.field === "count") {
                            formattedRow[column.headerName] = printRowNumber;
                            return;
                        }
                        if (column.field.includes(".")) {
                            const [parentField, childField] = column.field.split(".");
                            value = row[parentField] ? row[parentField][childField] : "";
                        } else {
                            value = row[column.field];
                        }

                        // Format currency values
                        if (
                            column.field.includes("amount") ||
                            column.field.includes("Amount") ||
                            column.field.endsWith("Amt") ||
                            column.field.endsWith("amt")
                        ) {
                            if (typeof value === "number") {
                                value = formatCurrency(value);
                            }
                        }

                        // Format date fields as DD-MM-YYYY for print display
                        const isDateField = /date|Date|Dt|dt|Booking|booking|RecdAtSite|receivedBack|invReturnedToSite|returnedToPimo/i.test(column.field);
                        if (isDateField) {
                            formattedRow[column.headerName] = formatDateForDisplay(value);
                        } else {
                            formattedRow[column.headerName] = (value !== undefined && value !== null && value !== 'N/A') ? value : "";
                        }
                    });
                }

                return formattedRow;
            }).filter(row => row !== null); // Filter out null values (subtotal rows)

            // Region, dates and the count below the title (1.10, item O-18).
            const filterDetailsHtml = printCriteriaHtml(describeReportCriteria(filters), dataRows.length);

            // Print the report (create a printable HTML version)
            const printWindow = window.open("", "_blank", "width=800,height=600");

            printWindow.document.write(`
                <html>
                  <head>
                    <title>${titleName}</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                      }
                      table {
                        width: 100%;
                        border-collapse: collapse;
                      }
                      thead {
                        background-color: #f2f2f2;
                      }
                      th {
                        background-color: #f8f9fa;
                        color: #000000;
                        font-size: 14px;
                        font-weight: bold;
                        text-align: center;
                        padding: 8px;
                        border: 1px solid #ddd;
                      }
                      td {
                        padding: 8px;
                        font-size: 10.5px;
                        border: 1px solid #ddd;
                        text-align: left;
                      }
                        .amount-column {
                        text-align: right;
                      }
                      .grand-total-row {
                        background-color: #e9ecef !important;
                        font-weight: bold;
                      }
                      tr:nth-child(even) {
                        background-color: #f9f9f9;
                      }
                      .report-header {
                        // background-color: #EADDCA;
                        background-color: #D3D3D3;
                        margin-bottom: 0px;
                        display: table-header-group;
                        display: flex;
                        justify-content: space-between;
                      }
                      .report-title {
                        font-size: 24px;
                        font-weight: bold;
                        text-align: left;
                        padding: 15px;
                      }
                      .timestamp {
                        text-align: right;
                        font-style: italic;
                        padding: 15px;
                        padding-right: 4px;
                      }
                      .report-filters {
                        font-size: 14px;
                        font-weight: normal;
                        text-align: left;
                        padding: 6px 15px 12px 15px;
                        line-height: 1.5;
                      }
                      .currency {
                        text-align: right;
                      }
                      .date {
                        white-space: nowrap;
                      }
                      /* Add page break control for printing */
                      @media print {
                        thead {
                          display: table-header-group;
                        }
                        tfoot {
                          display: table-footer-group;
                        }
                        @page {
                          margin: 0.5cm;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="report-header">
                      <div class="report-title">${titleName}</div>
                        <div class="timestamp">${generatedAtText()}</div>
                    </div>
                    ${filterDetailsHtml}
                    <table>
                      <thead>
                        <tr>
              `);
            allColumnsToExport.forEach((column) => {
                printWindow.document.write(`<th>${column.headerName}</th>`);
            });
            printWindow.document.write("</tr></thead>");

            // Add the data rows
            printWindow.document.write("<tbody>");

            let originalDataIndex = 0;
            excelData.forEach((row, index) => {
                // Check if this is a grand total row
                while (originalDataIndex < dataToExport.length && dataToExport[originalDataIndex].isSubtotal) {
                    originalDataIndex++;
                }
                const isGrandTotalRow = dataToExport[originalDataIndex]?.isGrandTotal;
                originalDataIndex++;

                // Add row with appropriate class
                const rowClass = isGrandTotalRow ? ' class="grand-total-row"' : '';
                printWindow.document.write(`<tr${rowClass}>`);

                // Generate cells for each column
                allColumnsToExport.forEach((column) => {
                    const value = row[column.headerName] || '';

                    // Check if this column should be right-aligned (amount columns)
                    const isAmountColumn = column.field.includes("amount") ||
                        column.field.includes("Amount") ||
                        column.field.endsWith("Amt") ||
                        column.field.endsWith("amt") ||
                        column.field === "taxInvAmt" ||
                        column.field === "copAmt" ||
                        column.field === "paymentAmt" ||
                        column.field === "invoiceAmount";

                    const cellClass = isAmountColumn ? ' class="amount-column"' : '';
                    printWindow.document.write(`<td${cellClass}>${value}</td>`);
                });

                printWindow.document.write('</tr>');
            });
            printWindow.document.write("</tbody>");
            printWindow.document.write("</table>");
            printWindow.document.write("</body></html>");
            printWindow.document.close();
            printWindow.print();  // Trigger print dialog
            printWindow.onafterprint = function () {
                printWindow.close();  // Close the print window after printing
            };
        }

        return { success: true, message: "Successful execution" };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Failed to download report: " + (error.message || "Unknown error")
        };
    }
};
