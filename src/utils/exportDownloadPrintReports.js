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

export const handleExportAllReports = async (
    selectedRows,
    filteredData,
    columns,
    visibleColumnFields,
    titleName,
    toPrint
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
        const essentialFields = [...visibleColumnFields];

        const essentialColumns = essentialFields
            .map((field) => columns.find((col) => col.field === field))
            .filter((col) => col !== undefined);

        const allColumnsToExport = [...essentialColumns];

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
            const timestampText = `Report generated on: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour12: false })}`;

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
                            column.field.includes("date") ||
                            column.field.includes("Date") ||
                            column.field.includes("dt") ||
                            column.field.includes("Dt")
                        ) {
                            const [day, month, year] = value.split('-');
                            const jsDate = new Date(year, month - 1, day);
                            // const dateFormat = new Date(value);
                            return value ? jsDate : "";
                            // return typeof value === "date" ? value : 0;
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

                        formattedRow[column.headerName] = (value !== undefined && value !== null && value !== 'N/A') ? value : "";
                    });
                }

                return formattedRow;
            }).filter(row => row !== null); // Filter out null values (subtotal rows)

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
                        <div class="timestamp">Report generated on: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour12: false })}</div>
                    </div>
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
