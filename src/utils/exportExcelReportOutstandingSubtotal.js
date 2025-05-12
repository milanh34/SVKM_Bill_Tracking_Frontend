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

export const handleExportOutstandingSubtotalReport = async (selectedRows, filteredData, columns, visibleColumnFields, toPrint) => {
    try {
        const dataToExport = selectedRows.length > 0
            ? filteredData.filter((item) => selectedRows.includes(item._id))
            : filteredData;

        if (dataToExport.length === 0) {
            throw new Error("Please select at least one row to download");
        }

        const essentialFields = [
            // "copAmt",
            "srNo",
            "region",
            "vendorNo",
            "vendorName",
            "taxInvNo",
            "taxInvDate",
            "taxInvAmt",
            "copAmt",
            "dateRecdInAcctsDept"
        ];

        const essentialColumns = essentialFields
            .map((field) => columns.find((col) => col.field === field))
            .filter((col) => col !== undefined);

        // const additionalColumns = columns.filter(
        //     (col) =>
        //         visibleColumnFields.includes(col.field) &&
        //         col.field !== "srNoOld" &&
        //         !essentialFields.includes(col.field)
        // );

        // const allColumnsToExport = [...essentialColumns, ...additionalColumns];
        const allColumnsToExport = [...essentialColumns];
        const workbook = XLSX.utils.book_new();

        // Create timestamp row
        const now = new Date();
        const timestamp = [
            [`Report generated on: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}`]
        ];

        // Create worksheet with data
        const excelData = [];

        dataToExport.forEach((item) => {
            if (!item.isSubtotal && !item.isGrandTotal) {
                excelData.push({
                    "Sr. No": item.srNo,
                    "Region": item.region,
                    "Vendor No.": item.vendorNo,
                    "Vendor Name": item.vendorName,
                    "Tax Invoice No.": item.taxInvNo,
                    "Tax Invoice Date": item.taxInvDate,
                    "Tax Invoice Amount": formatCurrency(item.taxInvAmt),
                    "Cop Amount": formatCurrency(item.copAmt),
                    "Date Received in Accts Dept": item.dateRecdInAcctsDept
                });
            } else if (item.isSubtotal) {
                excelData.push({
                    "Sr. No": "",
                    "Region": "",
                    "Vendor No.": `Count: ${item.count}`,
                    "Vendor Name": item.vendorName,
                    "Tax Invoice No.": "",
                    "Tax Invoice Date": "",
                    "Tax Invoice Amount": formatCurrency(item.subtotalAmount),
                    "Cop Amount": formatCurrency(item.subtotalCopAmt),
                    "Date Received in Accts Dept": ""
                });
            } else if (item.isGrandTotal) {
                excelData.push({
                    "Sr. No": "",
                    "Region": "",
                    "Vendor No.": `Total Count: ${item.totalCount}`,
                    "Vendor Name": "",
                    "Tax Invoice No.": "",
                    "Tax Invoice Date": "",
                    "Tax Invoice Amount": formatCurrency(item.grandTotalAmount),
                    "Cop Amount": formatCurrency(item.grandTotalCopAmt),
                    "Date Received in Accts Dept": ""
                });
            }
        });

        // Create and format worksheet
        if (!toPrint) {

            const worksheet = XLSX.utils.aoa_to_sheet(timestamp);
            worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
            XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A2', skipHeader: false });

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

            excelData.forEach((row, idx) => {
                if (row["Vendor No."]?.startsWith("Count:") || row["Vendor No."]?.startsWith("Total Count:")) {
                    const rowIndex = idx + 2;
                    for (let col = 0; col < Object.keys(row).length; col++) {
                        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
                        if (!worksheet[cellRef]) worksheet[cellRef] = {};
                        worksheet[cellRef].s = {
                            font: { bold: true },
                            fill: {
                                fgColor: { rgb: row["Vendor No."].startsWith("Total Count:") ? "E9ECEF" : "F8F9FA" }
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
            const filename = `${now1.getDate().toString().padStart(2, '0')}${(now1.getMonth() + 1).toString().padStart(2, '0')}${now1.getFullYear().toString().slice(-2)}_${now1.getHours().toString().padStart(2, '0')}${now1.getMinutes().toString().padStart(2, '0')}${now1.getSeconds().toString().padStart(2, '0')}.xlsx`;

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
            XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A2', skipHeader: false });

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

            excelData.forEach((row, idx) => {
                if (row["Vendor No."]?.startsWith("Count:") || row["Vendor No."]?.startsWith("Total Count:")) {
                    const rowIndex = idx + 2;
                    for (let col = 0; col < Object.keys(row).length; col++) {
                        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: col });
                        if (!worksheet[cellRef]) worksheet[cellRef] = {};
                        worksheet[cellRef].s = {
                            font: { bold: true },
                            fill: {
                                fgColor: { rgb: row["Vendor No."].startsWith("Total Count:") ? "E9ECEF" : "F8F9FA" }
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
                const now = new Date();
                const filename = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().slice(-2)}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.xlsx`;

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
                    @media print{
                        table { 
                            page-break-inside: auto; 
                        } 
                        tr {
                            page-break-inside: avoid; 
                            page-break-after: auto; 
                        }
                        thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                    .no-break { page-break-inside: avoid; }
                    .page-break { page-break-before: always; }
                    .report-header { page-break-after: avoid; }
                    }
                    table {
                        border-collapse: collapse; 
                        width: 100%;
                    }
                    th, td { 
                        font-size: 10.5px; 
                        border: 1px solid #ddd; 
                        padding: 8px; 
                    } 
                    th { 
                        font-size: 14px; 
                        background-color: #f8f9fa; 
                        color: black; 
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
                    
                    </style></head><body>`,
                    footer: "</body></html>"
                };

                // Create HTML table from worksheet data
                // let html = "<table>";

                // Get the worksheet
                const ws = workbook.Sheets["Bills Report"];
                const range = XLSX.utils.decode_range(ws["!ref"]);

                // Add timestamp row (if present)
                let html = `<div></div>`;
                if (ws['A1']) {
                    const timestampValue = ws['A1'].v || '';
                    // html += `<tr><td colspan="${range.e.c + 1}" class="timestamp">Outstanding Bills Report Subtotal as on\t\t${timestampValue}</td></tr>`;
                    html += `<div class="report-header">
                      <div class="report-title">Outstanding Bills Report Subtotal as on</div>
                        <div class="timestamp">Report generated on: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour12: false })}</div>
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
                html += "</tr>";

                // Add data rows
                for (let row = 2; row <= range.e.r; row++) {
                    // Check if this is a count or total row
                    let rowClass = '';
                    const firstCellAddress = XLSX.utils.encode_cell({ r: row, c: 2 });
                    console.log("outside first cel add --> " + ws[firstCellAddress].v)
                    if (ws[firstCellAddress] &&
                        typeof ws[firstCellAddress].v === 'string' &&
                        ws[firstCellAddress].v.startsWith('Count:')) {
                        rowClass = 'count-row';
                        console.log("first cel add --> " + ws[firstCellAddress].v)
                    } else if (ws[firstCellAddress] &&
                        typeof ws[firstCellAddress].v === 'string' &&
                        ws[firstCellAddress].v.startsWith('Total Count:')) {
                        rowClass = 'total-row';
                    }

                    html += `<tr class="${rowClass}">`;
                    for (let col = range.s.c; col <= range.e.c; col++) {
                        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                        const cellValue = ws[cellAddress] ? ws[cellAddress].v || '' : '';
                        html += `<td>${cellValue}</td>`;
                    }
                    html += "</tr>";
                }

                html += "</table>";
                return htmlOptions.header + html + htmlOptions.footer;
            };

            // Function to print HTML content
            const printHTMLContent = (htmlContent, filename) => {
                // Create a hidden iframe
                const printFrame = document.createElement('iframe');
                printFrame.style.position = 'fixed';
                printFrame.style.right = '0';
                printFrame.style.bottom = '0';
                printFrame.style.width = '0';
                printFrame.style.height = '0';
                printFrame.style.border = '0';

                document.body.appendChild(printFrame);

                // Once the iframe is loaded, write content and print
                printFrame.onload = () => {
                    const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
                    frameDoc.open();
                    frameDoc.write(htmlContent);
                    frameDoc.close();

                    // Add a small delay to ensure content is fully rendered
                    setTimeout(() => {
                        try {
                            printFrame.contentWindow.focus();
                            printFrame.contentWindow.print();

                            // Show confirmation message to user
                            // alert(`File "${filename}" has been downloaded and sent to printer.`);

                            // Remove the iframe after a delay
                            setTimeout(() => {
                                document.body.removeChild(printFrame);
                            }, 1000);
                        } catch (err) {
                            console.error('Print failed:', err);
                            alert('Printing failed. The file has been downloaded successfully, but you will need to open and print it manually.');
                            document.body.removeChild(printFrame);
                        }
                    }, 500);
                };

                // Set src to trigger onload
                printFrame.src = 'about:blank';
            };

            // Call the function to download and print
            downloadAndPrintExcel();
        }

        return { success: true, message: "Report downloaded successfully" };
    } catch (error) {
        return {
            success: false,
            message: "Failed to download report: " + (error.message || "Unknown error")
        };
    }
};
