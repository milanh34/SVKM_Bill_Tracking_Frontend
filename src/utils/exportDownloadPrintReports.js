import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from 'react-toastify';

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

/** DD-MM-YYYY, from either YYYY-MM-DD or something already formatted. */
const criteriaDate = (d) => {
    if (!d) return "";
    const parts = String(d).split("-");
    return parts.length === 3 && parts[0].length === 4
        ? `${parts[2]}-${parts[1]}-${parts[0]}`
        : String(d);
};

/**
 * The selection criteria a report was run with, as { region, dates }.
 *
 * Two bugs lived here. The region label treated ANY array as "All"
 * (observation N-02) - and the report pages seed their region state with the
 * user's whole list of regions, which IS an array, so the printed header said
 * "All" no matter what was chosen. And the download never received the
 * criteria at all, so neither region nor date range appeared in the Excel
 * file (observation N-03).
 */
export const describeReportCriteria = (filters) => {
    if (!filters) return null;

    const { region, fromDate, toDate } = filters;

    let regionLabel;
    if (region === undefined || region === null || region === "") {
        regionLabel = "All";
    } else if (Array.isArray(region)) {
        const named = region.filter(Boolean).map(String);
        // An empty list, or one that literally says ALL, is unrestricted.
        regionLabel =
            named.length === 0 || named.some((r) => r.toLowerCase() === "all")
                ? "All"
                : named.join(", ");
    } else {
        regionLabel = String(region).toLowerCase() === "all" ? "All" : String(region);
    }

    const dateParts = [];
    if (fromDate) dateParts.push(`From: ${criteriaDate(fromDate)}`);
    if (toDate) dateParts.push(`To: ${criteriaDate(toDate)}`);

    return { region: regionLabel, dates: dateParts.join(", ") };
};

export const handleExportAllReports = async (
    selectedRows,
    filteredData,
    columns,
    visibleColumnFields,
    titleName,
    toPrint,
    filters = null
) => {
    try {
        // const dataToExport = selectedRows.length > 0
        //     ? filteredData.filter((item) => selectedRows.includes(item._id))
        //     : filteredData;
        var dataToExport = filteredData.filter((item) => selectedRows.includes(item.srNo) || item.isGrandTotal === true);
        console.log(dataToExport);

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
            // Spec asks for date and time at the top right of every report.
            const timestampText = `Report generated on: ${now.toLocaleString('en-IN')}`;

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
            if (criteria) {
                const criteriaText = criteria.dates
                    ? `Region: ${criteria.region}   |   ${criteria.dates}`
                    : `Region: ${criteria.region}`;
                const criteriaValues = Array(columnCount).fill("");
                criteriaValues[0] = criteriaText;
                const criteriaRow = worksheet.addRow(criteriaValues);
                if (titleSpanEndCol >= 1) {
                    worksheet.mergeCells(`A2:${getColLetter(titleSpanEndCol)}2`);
                }
                criteriaRow.getCell(1).font = { italic: true, size: 12 };
                criteriaRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
            }

            // Optionally, add spacing below
            worksheet.addRow([]);

            // Header Row
            const headerRow = worksheet.addRow(allColumnsToExport.map(col => col.headerName));
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
            dataToExport.forEach((rowData, rowIndex) => {
                let rowValues;
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
                    // if (rowData.isGrandTotal) {
                    rowValues = allColumnsToExport.map((column) => {
                        const field = column.field;

                        if (titleName === "Outstanding Bills Report as on" || titleName === "Outstanding Bills Report Subtotal as on") {
                            if (field === "srNo") {
                                return `Total Count: ${rowData.totalCount}`
                            }
                            if (field === "taxInvAmt" || field === "invoiceAmount") {
                                return `Grand Total: ${rowData.grandTotalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || 0;
                            }
                            if (field === "copAmt") {
                                return `Grand Total: ${rowData.grandTotalCopAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || 0;
                            }
                            if (field === "paymentAmt") {
                                return `Grand Total: ${rowData.grandTotalPaymentAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || 0;
                            }

                            return ""; // Empty for other columns
                        }

                        else {
                            // The five "sent/returned" reports carry Count as a
                            // real column (Report logics, General #2).
                            if (field === "count") {
                                return `Total: ${rowData.count ?? ""}`;
                            }
                            if (field === "srNo") {
                                return `Total Count: ${rowData.count}`
                            }
                            if (field === "taxInvAmt" || field === "invoiceAmount") {
                                return `Grand Total: ${rowData.grandTotalTaxAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || 0;
                            }
                            if (field === "copAmount") {
                                return `Grand Total: ${rowData.grandTotalCopAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || 0;
                            }
                            if (field === "paymentAmt" || field === "payentAmt") {
                                return `Grand Total: ${rowData.grandTotalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` || 0;
                            }
                            return ""; // Empty for other columns
                        }

                        return ""; // Empty for other columns

                    });
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
            worksheet.columns.forEach((column) => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const cellLength = cell.value ? cell.value.toString().length : 10;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                });
                column.width = Math.max(maxLength + 2, 15);
            });

            // Export as Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // const filename = `${titleName.replace(/[\/ ]/g, '_')}_${now.toLocaleDateString('en-IN')}_${now.toLocaleTimeString('en-IN', { hour12: false })}.xlsx`;        // replace '/' and 'space' with _
            // const filename = `${titleName.replace(/[\/ ]/g, '_')}_${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.xlsx`;
            const filename = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${now.getFullYear()}.xlsx`;
            saveAs(blob, filename);

            return { success: true, message: "Report downloaded successfully" };
        }

        if (toPrint) {

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
                    // Grand Total row handling
                    allColumnsToExport.forEach((column) => {
                        const field = column.field;
                        if (titleName === "Outstanding Bills Report as on" || titleName === "Outstanding Bills Report Subtotal as on") {
                            if (field === "srNo") {
                                formattedRow[column.headerName] = `Total Count: ${row.totalCount}`;
                            } else if (field === "taxInvAmt" || field === "invoiceAmount") {
                                formattedRow[column.headerName] = `Grand Total: ${formatCurrency(row.grandTotalAmount || 0)}`;
                            } else if (field === "copAmt") {
                                formattedRow[column.headerName] = `Grand Total: ${formatCurrency(row.grandTotalCopAmt || 0)}`;
                            } else if (field === "paymentAmt") {
                                formattedRow[column.headerName] = `Grand Total: ${formatCurrency(row.grandTotalPaymentAmount || 0)}`;
                            } else {
                                formattedRow[column.headerName] = ""; // Empty for other columns
                            }
                        }
                        else {
                            if (field === "srNo") {
                                formattedRow[column.headerName] = `Total Count: ${row.count}`;
                            } else if (field === "taxInvAmt" || field === "invoiceAmount") {
                                formattedRow[column.headerName] = `Grand Total: ${formatCurrency(row.grandTotalTaxAmount || 0)}`;
                            } else if (field === "copAmt" || field === "copAmount") {
                                formattedRow[column.headerName] = `Grand Total: ${formatCurrency(row.grandTotalCopAmt || 0)}`;
                            } else if (field === "paymentAmt" || field === "payentAmt") {
                                formattedRow[column.headerName] = `Grand Total: ${formatCurrency(row.grandTotalAmount || 0)}`;
                            } else {
                                formattedRow[column.headerName] = ""; // Empty for other columns
                            }
                        }
                    });
                } else {
                    // Normal data row handling
                    allColumnsToExport.forEach((column) => {
                        let value;
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

            // Build filter details line (Region, From, To) to show below the title
            const formatFilterDate = (d) => {
                if (!d) return "";
                const parts = d.split("-");
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD -> DD-MM-YYYY
                }
                return d;
            };
            let filterDetailsHtml = "";
            const printCriteria = describeReportCriteria(filters);
            if (printCriteria) {
                filterDetailsHtml =
                    `<div class="report-filters">` +
                    `<div>Region: <strong>${printCriteria.region}</strong></div>` +
                    (printCriteria.dates ? `<div><strong>${printCriteria.dates}</strong></div>` : "") +
                    `</div>`;
            }

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
                        <div class="timestamp">Report generated on: ${new Date().toLocaleString('en-IN')}</div>
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
