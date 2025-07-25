import * as XLSX from "xlsx";

const formatCurrency = (value) => {
  if (value === undefined || value === null) return "";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1971) return "";
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  } catch (e) {
    return "";
  }
};

export const handleExportReport = async (selectedRows, filteredData, columns, visibleColumnFields) => {
  try {
    const dataToExport = selectedRows.length > 0
      ? filteredData.filter((item) => selectedRows.includes(item._id))
      : filteredData;

    if (dataToExport.length === 0) {
      throw new Error("Please select at least one row to download");
    }

    const essentialFields = [
      "srNo",
      "natureOfWork",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "poNo",
      "poDt",
      "poAmt",
      "taxInvNo",
      "taxInvDt",
      "currency",
      "taxInvAmt",
      "remarksBySiteTeam",
      "status",
    ];

    const essentialColumns = essentialFields
      .map((field) => columns.find((col) => col.field === field))
      .filter((col) => col !== undefined);

    const additionalColumns = columns.filter(
      (col) =>
        visibleColumnFields.includes(col.field) &&
        col.field !== "srNoOld" &&
        !essentialFields.includes(col.field)
    );

    const allColumnsToExport = [...essentialColumns, ...additionalColumns];
    const workbook = XLSX.utils.book_new();

    // Define which fields should be treated as numbers
    const numberFields = ["taxInvAmt", "poAmt", "copDetails.amount", "accountsDept.paymentAmt"];

    // Create timestamp row
    const now = new Date();
    const timestamp = [
      [`Report generated on: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}`]
    ];

    // Create worksheet with data
    const excelData = dataToExport.map((row) => {
      const formattedRow = {};
      allColumnsToExport.forEach((column) => {
        let value;
        if (column.field.includes(".")) {
          const [parentField, childField] = column.field.split(".");
          value = row[parentField] ? row[parentField][childField] : "";
        } else {
          value = row[column.field];
        }

        console.log(column.field, value);
        // Format dates
        if (
          column.field.includes("date") ||
          column.field.includes("Date") ||
          column.field.includes("Booking") ||
          column.field.includes("booking") ||
          column.field.includes("receivedBack") ||
          column.field.includes("RecdAtSite") ||
          column.field.includes("invReturnedToSite") ||
          column.field.includes("returnedToPimo")
        ) {
          if (value) {
            value = formatDate(value);
          }
        }

        // Keep numeric values as numbers for specific fields, format others as currency strings
        if (
          column.field.includes("amount") ||
          column.field.includes("Amount") ||
          column.field.endsWith("Amt") ||
          column.field.endsWith("amt")
        ) {
          if (typeof value === "number") {
            // Keep as number if it's one of the specified number fields
            if (numberFields.includes(column.field)) {
              // Keep as number - don't format to string
              value = value;
            } else {
              // Format as currency string for other amount fields
              value = formatCurrency(value);
            }
          }
        }

        formattedRow[column.headerName] = value !== undefined && value !== null ? value : "";
      });
      return formattedRow;
    });

    // Calculate grand totals for multiple fields
    const grandTotals = {};
    
    // Always calculate taxInvAmt total
    grandTotals.taxInvAmt = dataToExport.reduce((total, row) => {
      const taxInvAmt = row.taxInvAmt || 0;
      return total + (typeof taxInvAmt === 'number' ? taxInvAmt : 0);
    }, 0);

    // Check if copDetails.amount is visible and calculate its total
    const copAmountColumn = allColumnsToExport.find(col => col.field === "copDetails.amount");
    if (copAmountColumn) {
      grandTotals["copDetails.amount"] = dataToExport.reduce((total, row) => {
        const copAmount = row.copDetails?.amount || 0;
        return total + (typeof copAmount === 'number' ? copAmount : 0);
      }, 0);
    }

    // Check if accountsDept.paymentAmt is visible and calculate its total
    const paymentAmtColumn = allColumnsToExport.find(col => col.field === "accountsDept.paymentAmt");
    if (paymentAmtColumn) {
      grandTotals["accountsDept.paymentAmt"] = dataToExport.reduce((total, row) => {
        const paymentAmt = row.accountsDept?.paymentAmt || 0;
        return total + (typeof paymentAmt === 'number' ? paymentAmt : 0);
      }, 0);
    }

    const poAmtColumn = allColumnsToExport.find(col => col.field === "poAmt");
    if (poAmtColumn) {
      grandTotals["poAmt"] = dataToExport.reduce((total, row) => {
        const valuePoAmt = row.poAmt || 0;
        return total + (typeof valuePoAmt === 'number' ? valuePoAmt : 0);
      }, 0);
    }

    // Create grand total row
    const grandTotalRow = {};
    allColumnsToExport.forEach((column) => {
      if (column.field === "srNo") {
        grandTotalRow[column.headerName] = "Grand Total";
      } else if (grandTotals.hasOwnProperty(column.field)) {
        // Keep grand total as number for number fields
        if (numberFields.includes(column.field)) {
          grandTotalRow[column.headerName] = grandTotals[column.field];
        } else {
          grandTotalRow[column.headerName] = formatCurrency(grandTotals[column.field]);
        }
      } else {
        grandTotalRow[column.headerName] = "";
      }
    });

    // Add grand total row to excel data
    excelData.push(grandTotalRow);

    // Create and format worksheet
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

    // Apply number formatting to specific columns
    const numberFormat = '#,##0.00'; // Indian number format with 2 decimal places
    
    // Get column indices for number fields
    const numberColumnIndices = [];
    allColumnsToExport.forEach((column, index) => {
      if (numberFields.includes(column.field)) {
        numberColumnIndices.push(index);
      }
    });

    // Apply number formatting to data rows (excluding header and timestamp)
    for (let row = 2; row <= range.e.r; row++) { // Start from row 2 (after timestamp and header)
      numberColumnIndices.forEach((colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex });
        if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === 'number') {
          worksheet[cellAddress].z = numberFormat;
        }
      });
    }

    // Style header cells
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col }); // Header is now at row 1
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

    // Style grand total row (last row)
    const grandTotalRowIndex = range.e.r;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: grandTotalRowIndex, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "000000" }, sz: 12 },
        fill: { fgColor: { rgb: "FFFF00" } }, // Yellow background for grand total
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: "000000" } },
          bottom: { style: "medium", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };
      
      // Apply number formatting to grand total cells that are numbers
      if (numberColumnIndices.includes(col) && worksheet[cellAddress] && typeof worksheet[cellAddress].v === 'number') {
        worksheet[cellAddress].z = numberFormat;
      }
    }

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

    return { success: true, message: "Report downloaded successfully" };
  } catch (error) {
    return { 
      success: false, 
      message: "Failed to download report: " + (error.message || "Unknown error") 
    };
  }
};