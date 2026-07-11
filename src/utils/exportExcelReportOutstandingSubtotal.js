import * as XLSX from "xlsx";
import { outstanding } from "../apis/report.api";

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

export const handleExportOutstandingSubtotalReport = async (selectedRows, filteredData, columns, visibleColumnFields, toPrint) => {
    const titleName = 'Report Outstanding Subtotal';
    try {

        const dataToExport = selectedRows.length > 0
            ? filteredData.filter((item) => selectedRows.includes(item._id))
            : filteredData;

        if (dataToExport.length === 0) {
            throw new Error("Please select at least one row to download");
        }

        const allColumnsToExport = columns.filter((col) => visibleColumnFields.includes(col.field));
        const workbook = XLSX.utils.book_new();

        // Create timestamp row
        const now = new Date();
        const timestamp = [
            [`Report generated on: ${now.toLocaleDateString('en-IN')}`]
        ];

        // Create worksheet with data
        const excelData = [];

        // Dynamically determine date and number column indices based on selected columns
        const dateColumnIndices = [];
        const numberColumnIndices = [];
        allColumnsToExport.forEach((col, idx) => {
            const isDateField = /date|Date|Dt|dt|Booking|booking|RecdAtSite|receivedBack|invReturnedToSite|returnedToPimo/i.test(col.field);
            const isNumberField = col.field.includes("amount") || col.field.includes("Amount") || col.field.endsWith("Amt") || col.field.endsWith("amt");
            if (isDateField) dateColumnIndices.push(idx);
            if (isNumberField) numberColumnIndices.push(idx);
        });
        const numberFormat = '#,##0.00';
        const dateFormat = 'DD-MM-YYYY';

        dataToExport.forEach((item) => {
            if (!item.isSubtotal && !item.isGrandTotal) {
                const row = {};
                allColumnsToExport.forEach((col) => {
                    let value;
                    if (col.field.includes(".")) {
                        const [parentField, childField] = col.field.split(".");
                        value = item[parentField] ? item[parentField][childField] : "";
                    } else {
                        value = item[col.field];
                    }

                    const isDateField = /date|Date|Dt|dt|Booking|booking|RecdAtSite|receivedBack|invReturnedToSite|returnedToPimo/i.test(col.field);
                    const isNumberField = col.field.includes("amount") || col.field.includes("Amount") || col.field.endsWith("Amt") || col.field.endsWith("amt");

                    if (isDateField) {
                        const d = parseDateValue(value);
                        row[col.headerName] = (d instanceof Date && !isNaN(d.getTime())) ? d : "";
                    } else if (isNumberField) {
                        const num = (value !== null && value !== undefined && value !== "") 
                            ? Number(String(value).replace(/[^\d.-]/g, "")) : 0;
                        row[col.headerName] = !isNaN(num) ? num : 0;
                    } else {
                        row[col.headerName] = (value !== undefined && value !== null && value !== 'N/A') ? value : "";
                    }
                });
                excelData.push(row);
            } else if (item.isSubtotal) {
                const row = {};
                allColumnsToExport.forEach((col) => {
                    const isNumberField = col.field.includes("amount") || col.field.includes("Amount") || col.field.endsWith("Amt") || col.field.endsWith("amt");
                    if (col.field === "vendorNo") {
                        row[col.headerName] = `Count: ${item.count}`;
                    } else if (col.field === "vendorName") {
                        row[col.headerName] = item.vendorName;
                    } else if (isNumberField) {
                        // Try to get subtotal values
                        let val = 0;
                        if (col.field === "taxInvAmt" || col.field === "invoiceAmount") val = item.subtotalAmount || 0;
                        else if (col.field === "copAmt") val = item.subtotalCopAmt || 0;
                        else if (col.field === "paymentAmt") val = item.subtotalPaymentAmount || 0;
                        const num = (val !== null && val !== undefined && val !== "") 
                            ? Number(String(val).replace(/[^\d.-]/g, "")) : 0;
                        row[col.headerName] = !isNaN(num) ? num : 0;
                    } else {
                        row[col.headerName] = "";
                    }
                });
                excelData.push(row);
            } else if (item.isGrandTotal) {
                const row = {};
                allColumnsToExport.forEach((col) => {
                    const isNumberField = col.field.includes("amount") || col.field.includes("Amount") || col.field.endsWith("Amt") || col.field.endsWith("amt");
                    if (col.field === "vendorNo") {
                        row[col.headerName] = `Total Count: ${item.totalCount}`;
                    } else if (isNumberField) {
                        let val = 0;
                        if (col.field === "taxInvAmt" || col.field === "invoiceAmount") val = item.grandTotalAmount || 0;
                        else if (col.field === "copAmt") val = item.grandTotalCopAmt || 0;
                        else if (col.field === "paymentAmt") val = item.grandTotalPaymentAmount || 0;
                        const num = (val !== null && val !== undefined && val !== "") 
                            ? Number(String(val).replace(/[^\d.-]/g, "")) : 0;
                        row[col.headerName] = !isNaN(num) ? num : 0;
                    } else {
                        row[col.headerName] = "";
                    }
                });
                excelData.push(row);
            }
        });

        // Create and format worksheet
        if (!toPrint) {

            const worksheet = XLSX.utils.aoa_to_sheet(timestamp);
            worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
            XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A2', skipHeader: false, cellDates: true });

            // Apply number and date formatting to data cells
            const dataRange = XLSX.utils.decode_range(worksheet["!ref"]);
            for (let row = 2; row <= dataRange.e.r; row++) { // Start from row 2 (after timestamp + header)
                // Apply date format to date columns
                dateColumnIndices.forEach((colIndex) => {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
                    if (worksheet[cellAddress] && worksheet[cellAddress].v instanceof Date) {
                        worksheet[cellAddress].t = 'd';
                        worksheet[cellAddress].z = dateFormat;
                    }
                });
                // Apply number format to number columns
                numberColumnIndices.forEach((colIndex) => {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
                    if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === 'number') {
                        worksheet[cellAddress].z = numberFormat;
                    }
                });
            }

            // Style the worksheet
            const range = XLSX.utils.decode_range(worksheet["!ref"]);
            const colWidths = {};
            Object.keys(excelData[0] || {}).forEach((key, index) => {
                colWidths[index] = Math.max(key.length * 1.5, 15);
            });
            worksheet["!cols"] = Object.keys(colWidths).map((col) => ({
                wch: colWidths[col],
            }));

            // Style header cells
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!worksheet[cellAddress]) continue;
                worksheet[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                    fill: { fgColor: { rgb: "0172C2" } },
                    alignment: { horizontal: "center", vertical: "center", wrapText: true },
                    border: {
                        top: { style: "medium", color: { rgb: "000000" } },
                        bottom: { style: "medium", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } },
                    },
                };
            }

            // Style timestamp row
            const timestampCell = worksheet['A1'];
            if (timestampCell) {
                timestampCell.s = {
                    font: { bold: true, color: { rgb: "000000" }, sz: 12 },
                    alignment: { horizontal: "left" }
                };
            }

            const vendorNoCol = allColumnsToExport.find(c => c.field === "vendorNo");
            const vendorNoHeader = vendorNoCol ? vendorNoCol.headerName : null;
            excelData.forEach((row, idx) => {
                if (
                    vendorNoHeader &&
                    typeof row[vendorNoHeader] === 'string' &&
                    (row[vendorNoHeader]?.startsWith("Count:") || row[vendorNoHeader]?.startsWith("Total Count:"))
                ) {
                    const rowIndex = idx + 2;
                    for (let col = 0; col < Object.keys(row).length; col++) {
                        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
                        if (!worksheet[cellRef]) worksheet[cellRef] = {};
                        worksheet[cellRef].s = {
                            font: { bold: true },
                            fill: {
                                fgColor: { rgb: row[vendorNoHeader].startsWith("Total Count:") ? "E9ECEF" : "F8F9FA" }
                            }
                        };
                    }
                }
            });

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Bills Report");

            // Generate file and trigger download
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const now1 = new Date();
            const filename = `${titleName.replace(/[\/ ]/g, '_')}_${now1.getDate().toString().padStart(2, '0')}${(now1.getMonth() + 1).toString().padStart(2, '0')}${now1.getFullYear().toString().slice(-2)}_${now1.getHours().toString().padStart(2, '0')}${now1.getMinutes().toString().padStart(2, '0')}${now1.getSeconds().toString().padStart(2, '0')}.xlsx`;

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // if (toPrint) {

        //     // Print the report (create a printable HTML version)
        //     const printWindow = window.open("", "_blank", "width=800,height=600");
        //     printWindow.document.write("<html><head><title>Outstanding Report Subtotal as on:</title></head><body>");
        //     // printWindow.document.write("<h2>Outstanding Report</h2>");
        //     printWindow.document.write("<table border='1' cellpadding='5' style='border-collapse: collapse;'>");

        //     // Add the header row
        //     printWindow.document.write("<thead><tr>");
        //     printWindow.document.write(`<tr><th colSpan='1'></th>`);
        //     printWindow.document.write(`<th>Outstanding Report Subtotal as on:</th>`);
        //     printWindow.document.write(`<th colSpan='2'></th>`);
        //     printWindow.document.write(`<th>${timestamp}</th>`);
        //     printWindow.document.write(`</tr>`);
        //     // printWindow.document.write(`<th>Outstanding Report</th>`);
        //     allColumnsToExport.forEach((column) => {
        //         printWindow.document.write(`<th>${column.headerName}</th>`);
        //     });
        //     printWindow.document.write("</tr></thead>");

        //     // Add the data rows
        //     printWindow.document.write("<tbody>");
        //     excelData.forEach((row) => {
        //         printWindow.document.write("<tr>");
        //         allColumnsToExport.forEach((column) => {
        //             printWindow.document.write(`<td>${row[column.headerName]}</td>`);
        //         });
        //         printWindow.document.write("</tr>");
        //     });
        //     printWindow.document.write("</tbody>");
        //     printWindow.document.write("</table>");
        //     printWindow.document.write("</body></html>");
        //     printWindow.document.close();
        //     printWindow.print();  // Trigger print dialog
        //     printWindow.onafterprint = function () {
        //         printWindow.close();  // Close the print window after printing
        //     };
        // }

        if (toPrint) {
            // Original excel generation and download code
            const worksheet = XLSX.utils.aoa_to_sheet(timestamp);
            // const worksheet = XLSX.utils.aoa_to_sheet(`Outstanding Bills Report Subtotal as on\t\t${timestamp}`);
            worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
            XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A2', skipHeader: false, cellDates: true });

            // Apply number and date formatting to data cells
            const dataRange2 = XLSX.utils.decode_range(worksheet["!ref"]);
            for (let row = 2; row <= dataRange2.e.r; row++) {
                dateColumnIndices.forEach((colIndex) => {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
                    if (worksheet[cellAddress] && worksheet[cellAddress].v instanceof Date) {
                        worksheet[cellAddress].t = 'd';
                        worksheet[cellAddress].z = dateFormat;
                    }
                });
                numberColumnIndices.forEach((colIndex) => {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
                    if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === 'number') {
                        worksheet[cellAddress].z = numberFormat;
                    }
                });
            }

            // Style the worksheet
            const range = XLSX.utils.decode_range(worksheet["!ref"]);
            const colWidths = {};
            Object.keys(excelData[0] || {}).forEach((key, index) => {
                colWidths[index] = Math.max(key.length * 1.5, 15);
            });
            worksheet["!cols"] = Object.keys(colWidths).map((col) => ({
                wch: colWidths[col],
            }));

            // Style header cells
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                if (!worksheet[cellAddress]) continue;
                worksheet[cellAddress].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                    fill: {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "f8f9fa" }, // light grey
                    },
                    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
                    border: {
                        top: { style: "thin" },
                        bottom: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" },
                    },
                };
            }

            // Style timestamp row
            const timestampCell = worksheet['A1'];
            if (timestampCell) {
                timestampCell.s = {
                    font: { bold: true, color: { rgb: "000000" }, sz: 12 },
                    alignment: { horizontal: "left" }
                };
            }

            const vendorNoCol2 = allColumnsToExport.find(c => c.field === "vendorNo");
            const vendorNoHeader2 = vendorNoCol2 ? vendorNoCol2.headerName : null;
            excelData.forEach((row, idx) => {
                console.log(row);
                if (
                    vendorNoHeader2 &&
                    typeof row[vendorNoHeader2] === 'string' &&
                    (row[vendorNoHeader2]?.startsWith("Count:") || row[vendorNoHeader2]?.startsWith("Total Count:"))
                ) {
                    const rowIndex = idx + 2;
                    for (let col = 0; col < Object.keys(row).length; col++) {
                        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
                        if (!worksheet[cellRef]) worksheet[cellRef] = {};
                        worksheet[cellRef].s = {
                            font: { bold: true },
                            fill: {
                                fgColor: { rgb: row[vendorNoHeader2].startsWith("Total Count:") ? "E9ECEF" : "F8F9FA" }
                            }
                        };
                    }
                }
            });

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, "Bills Report");

            // APPROACH 1: Download file and prompt user to print
            const downloadAndPrintExcel = () => {
                // Generate file for download
                const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
                const blob = new Blob([excelBuffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                const url = URL.createObjectURL(blob);
                const now1 = new Date();
                const filename = `${titleName.replace(/[\/ ]/g, '_')}_${now1.getDate().toString().padStart(2, '0')}${(now1.getMonth() + 1).toString().padStart(2, '0')}${now1.getFullYear().toString().slice(-2)}_${now1.getHours().toString().padStart(2, '0')}${now1.getMinutes().toString().padStart(2, '0')}${now1.getSeconds().toString().padStart(2, '0')}.xlsx`;

                // Trigger download
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Generate HTML version for printing
                const htmlVersion = generateHTMLFromExcel(workbook);
                printHTMLContent(htmlVersion, filename);
            };

            // APPROACH 2: Convert Excel to HTML for printing
            const generateHTMLFromExcel = (workbook) => {
                // Convert Excel to HTML format
                const htmlOptions = {
                    header: `<html><head><style>
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
                      .timestamp { 
                        font-weight: bold; 
                        font-style: italic; 
                        padding: 15px; 
                        padding-right: 4px;
                      } 
                      .count-row { 
                        background-color: #F8F9FA; 
                        font-weight: bold; 
                      } 
                      .total-row { 
                        background-color: #E9ECEF; 
                        font-weight: bold;
                      } 
                      .report-header { 
                        background-color: #D3D3D3;
                        margin-bottom: 0px; 
                        display: flex; 
                        justify-content: space-between; 
                      } 
                      .report-title {  
                        font-size: 24px;  
                        font-weight: bold; 
                        text-align: left; 
                        padding: 15px; 
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
                    </style></head><body>`,
                    footer: "</body></html>"
                };

                // Create HTML table from worksheet data
                // let html = "<table>";

                // Get the worksheet
                const ws = workbook.Sheets["Bills Report"];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                // Add timestamp row (if present)
                let html = "";
                if (ws['A1']) {
                    const timestampValue = ws['A1'].v || '';
                    // html += `<tr><td colspan="${range.e.c + 1}" class="timestamp">Outstanding Bills Report Subtotal as on\t\t${timestampValue}</td></tr>`;
                    html += `<div class="report-header">
                      <div class="report-title">Outstanding Bills Report Subtotal as on</div>
                        <div class="timestamp">Report generated on: ${new Date().toLocaleDateString('en-IN')}</div>
                    </div>
                    <table>
                      <thead>
                        <tr>`
                }

                // Add header row
                // html += "<tr>";
                for (let col = range.s.c; col <= range.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
                    const cellValue = ws[cellAddress] ? ws[cellAddress].v || '' : '';
                    html += `<th>${cellValue}</th>`;
                }
                html += "</tr></thead><tbody>";

                // Add data rows
                const vendorNoColIdx = allColumnsToExport.findIndex(c => c.field === "vendorNo");
                for (let row = 2; row <= range.e.r; row++) {
                    // Check if this is a count or total row
                    let rowClass = '';
                    if (vendorNoColIdx >= 0) {
                        const firstCellAddress = XLSX.utils.encode_cell({ r: row, c: vendorNoColIdx });
                        if (ws[firstCellAddress] &&
                            typeof ws[firstCellAddress].v === 'string' &&
                            ws[firstCellAddress].v.startsWith('Count:')) {
                            rowClass = 'count-row';
                        } else if (ws[firstCellAddress] &&
                            typeof ws[firstCellAddress].v === 'string' &&
                            ws[firstCellAddress].v.startsWith('Total Count:')) {
                            rowClass = 'total-row';
                        }
                    }

                    html += `<tr class="${rowClass}">`;
                    for (let col = range.s.c; col <= range.e.c; col++) {
                        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                        const cellValue = ws[cellAddress] ? ws[cellAddress].v || '' : '';
                        html += `<td>${cellValue}</td>`;
                    }
                    html += "</tr>";
                }

                html += "</tbody></table>";
                return htmlOptions.header + html + htmlOptions.footer;
            };

            // Function to print HTML content
            const printHTMLContent = (htmlContent, filename) => {
                // Open a standard print window to avoid 0x0 iframe viewport layout bugs
                const printWindow = window.open("", "_blank", "width=800,height=600");
                if (!printWindow) {
                    alert("Please allow pop-ups to enable printing");
                    return;
                }

                printWindow.document.open();
                printWindow.document.write(htmlContent);
                printWindow.document.close();

                // Focus and print
                printWindow.focus();
                printWindow.print();

                // Close the window after print dialog is closed
                printWindow.onafterprint = function () {
                    printWindow.close();
                };
            };

            // Call the function to download and print
            downloadAndPrintExcel();
        }

        return { success: true, message: "Report downloaded successfully" };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "Failed to download report: " + (error.message || "Unknown error")
        };
    }
};
