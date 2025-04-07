import * as XLSX from "xlsx";

const formatCurrency = (value) => {
    if (value === undefined || value === null) return "";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(value);
};

export const handleExportOutstandingReport = async (selectedRows, filteredData, columns, visibleColumnFields) => {
    try {
        const dataToExport = selectedRows.length > 0
            ? filteredData.filter((item) => selectedRows.includes(item._id))
            : filteredData;

        if (dataToExport.length === 0) {
            throw new Error("Please select at least one row to download");
        }

        const essentialFields = [
            "copAmt",
            "srNo",
            "region",
            "vendorNo",
            "vendorName",
            "taxInvNo",
            "taxInvDate",
            "taxInvAmt",
            "dtTaxInvRecdAtSite",
            "natureOfWork"
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

                // Format dates
                if (
                    column.field.includes("date") ||
                    column.field.includes("Date") ||
                    column.field.endsWith("Dt") ||
                    column.field.endsWith("_dt")
                ) {
                    if (value) {
                        const date = new Date(value);
                        if (!isNaN(date)) {
                            value = date.toISOString().split("T")[0];
                        }
                    }
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

                formattedRow[column.headerName] = value !== undefined && value !== null ? value : "";
            });
            return formattedRow;
        });

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
