import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { bills, billWorkflow } from "../apis/bills.api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import DataTable from "../components_tailwind/dashboard/DataTable";
import {
  Funnel,
  Grid3x3,
  Download,
  Send,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import search from "../assets/search.svg";
import { getColumnsForRole } from "../utils/columnConfig";
import { FilterModal } from "../components_tailwind/dashboard/FilterModal";
import { SendToModal } from "../components_tailwind/dashboard/SendToModal";
import { SendBoxModal } from "../components_tailwind/dashboard/SendBoxModal";
import Loader from "../components/Loader";
import Cookies from "js-cookie";

const Dashboard = () => {
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState("taxInvDate");
  const [visibleColumnFields, setVisibleColumnFields] = useState([]);
  const columnSelectorRef = useRef(null);
  const [isSendBoxOpen, setIsSendBoxOpen] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [pagesToShow, setPagesToShow] = useState(5);
  const [showDownloadValidation, setShowDownloadValidation] = useState(false);

  const navigate = useNavigate();

  const roles = [
    { value: "site_officer", label: "Site Officer" },
    { value: "qs_site", label: "QS Team" },
    {
      value: "site_pimo",
      label: "PIMO Mumbai & MIGO/SES Team",
    },
    {
      value: "pimo_mumbai",
      label: "PIMO Mumbai for Advance & FI Entry",
    },
    { value: "accounts", label: "Accounts Team" },
    {
      value: "director",
      label: "Trustee, Advisor & Director",
    },
  ];

  const roleWorkflow = {
    site_officer: [{ value: "site_pimo", label: "Site PIMO Team" }],
    site_pimo: [{ value: "qs_site", label: "QS Site Team" }],
    qs_site: [{ value: "pimo_mumbai", label: "PIMO Mumbai Team" }],
    pimo_mumbai: [{ value: "director", label: "Director" }],
    director: [{ value: "accounts", label: "Accounts Team" }],
    accounts: [{ value: "completed", label: "Complete Payment" }],
  };

  const handleSendTo = () => {
    const userRole = Cookies.get("userRole");
    const availableRoles = roleWorkflow[userRole] || [];
    
    if (availableRoles.length === 0) {
      toast.error("You don't have permission to forward bills");
      return;
    }

    setIsSendBoxOpen(true);
  };

  const handleSendToRole = (role) => {
    const billsToSend =
      selectedRows.length === 0
        ? filteredData.map((row) => row._id)
        : selectedRows;
    setSelectedRole(role);
    setSelectedRows(billsToSend);
    setIsWindowOpen(true);
    setIsSendBoxOpen(false);
  };

  const handleSendBills = async (selectedBills, remarks) => {
    try {
      const actor = Cookies.get('userName');
      const promises = selectedBills.map(billId =>
        axios.post(`${billWorkflow}/${billId}/advance`, {
          actor,
          comments: remarks || "No remarks added"
        })
      );

      const results = await Promise.allSettled(promises);
      
      // Check if any requests failed
      const failedRequests = results.filter(result => result.status === 'rejected');
      const successfulRequests = results.filter(result => result.status === 'fulfilled');
      
      if (failedRequests.length > 0) {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>Failed to send {failedRequests.length} bill{failedRequests.length > 1 ? 's' : ''}</span>
          </div>
        );
      }

      if (successfulRequests.length > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <Send size={18} className="text-white" />
            <span>
              Successfully sent {successfulRequests.length} bill{successfulRequests.length > 1 ? 's' : ''} to {selectedRole.label}
            </span>
          </div>,
          {
            style: { background: "#4CAF50", color: "white" },
            progressStyle: { background: "white" }
          }
        );
      }

      setIsWindowOpen(false);
      setSelectedRole(null);
      fetchBills();
    } catch (error) {
      console.error("Error advancing bills:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error.response?.data?.message || "Failed to send bills. Please try again."}</span>
        </div>
      );
    }
  };

  useEffect(() => {
    const userRole = Cookies.get("userRole");
    const token = Cookies.get("token");

    if (!userRole || !token) {
      navigate("/login");
    }
  }, [navigate]);

  const filterBillsByWorkflowState = (bills, userRole) => {
    return bills.filter(bill => {
      const currentState = bill.workflowState?.currentState;
      
      // For completed or rejected bills
      if (currentState === "Completed" || currentState === "Rejected") {
        return ["pimo_mumbai", "accounts", "director", "admin"].includes(userRole);
      }

      // Map workflow states to roles that can see them
      const stateToRoleMap = {
        "Site_Officer": ["site_officer"],
        "Site_PIMO": ["site_pimo"],
        "QS_Site": ["qs_site"],
        "PIMO_Mumbai": ["pimo_mumbai"],
        "Directors": ["director"],
        "Accounts": ["accounts"]
      };

      // Admin can see all bills
      if (userRole === "admin") return true;

      // Check if user's role matches the current workflow state
      return stateToRoleMap[currentState]?.includes(userRole) || false;
    });
  };

  const fetchBills = async () => {
    try {
      const response = await axios.get(bills);
      const userRole = Cookies.get('userRole');
      
      console.log("Received response data:", response.data);
      
      // Filter bills based on workflow state and user role
      const filteredBills = filterBillsByWorkflowState(response.data, userRole);
      
      // Sort filtered bills by status
      const sortedData = filteredBills.sort((a, b) => {
        const aStatus = a.accountsDept.status.toLowerCase();
        const bStatus = b.accountsDept.status.toLowerCase();
        if (aStatus === "unpaid" && bStatus !== "unpaid") return -1;
        if (aStatus !== "unpaid" && bStatus === "unpaid") return 1;
        return 0;
      });

      console.log("Sorted & Filtered Data", sortedData);
      setBillsData(sortedData);
    } catch (error) {
      console.log(error);
      setError(
        "We are experiencing some technical difficulties. Our team is working to resolve this issue as quickly as possible."
      );
      setBillsData([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBills();
  }, []);

  const uniqueRegions = [...new Set(billsData.map((bill) => bill.region))];

  const dateFieldOptions = [
    { value: "taxInvDate", label: "Tax Invoice Date" },
    { value: "poDate", label: "PO Date" },
    { value: "proformaInvDate", label: "Proforma Invoice Date" },
    { value: "copDetails.date", label: "COP Date" },
    { value: "advanceDate", label: "Advance Date" },
    { value: "migoDetails.date", label: "MIGO Date" },
    { value: "accountsDept.paymentDate", label: "Payment Date" },
  ];

  const isWithinDateRange = (row) => {
    if (!fromDate && !toDate) return true;
    let dateString;
    if (selectedDateField.includes(".")) {
      const parts = selectedDateField.split(".");
      const nestedObj = row[parts[0]];
      dateString = nestedObj ? nestedObj[parts[1]] : null;
    } else {
      dateString = row[selectedDateField];
    }
    if (!dateString) return true;
    const date = new Date(dateString.split("T")[0]);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);
    if (from && to) {
      return date >= from && date <= to;
    } else if (from) {
      return date >= from;
    } else if (to) {
      return date <= to;
    }
    return true;
  };

  const getNestedValue = (obj, path) => {
    if (!obj || !path) return undefined;
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === "object") {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }
    return value;
  };

  const sortData = (data, sortConfig) => {
    if (!sortConfig.key || !sortConfig.direction) return data;
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return sortConfig.direction === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      if (aString < bString) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredData = useMemo(() => {
    let result = billsData;
    if (selectedRegion.length > 0) {
      result = result.filter((row) => selectedRegion.includes(row.region));
    }
    result = result.filter(isWithinDateRange);
    result = sortData(result, sortConfig);
    return result;
  }, [billsData, selectedRegion, sortConfig, isWithinDateRange]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelectedRows(isChecked ? filteredData.map((row) => row._id) : []);
  };

  const handleDownloadReport = async () => {
    try {
      const dataToExport =
        selectedRows.length > 0
          ? filteredData.filter((item) => selectedRows.includes(item._id))
          : filteredData;
      if (dataToExport.length === 0) {
        toast.warning(
          <div className="send-toast">
            <span>
              <AlertTriangle size={18} />
            </span>
            <span>Please select at least one row to download</span>
          </div>,
          { autoClose: 3000 }
        );
        setShowDownloadValidation(true);
        setTimeout(() => setShowDownloadValidation(false), 3000);
        return;
      }
      const essentialFields = [
        "srNo",
        "typeOfInv",
        "region",
        "projectDescription",
        "vendorNo",
        "vendorName",
        "gstNumber",
        "compliance206AB",
        "panStatus",
        "poNo",
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
      
      // Create timestamp row
      const now = new Date();
      const timestamp = [
        [`Report generated on: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}`]
      ];
      
      // First create the data worksheet
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
          formattedRow[column.headerName] =
            value !== undefined && value !== null ? value : "";
        });
        return formattedRow;
      });

      // Create worksheet with timestamp
      const worksheet = XLSX.utils.aoa_to_sheet(timestamp);
      
      // Merge cells for timestamp row
      worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
      
      // Add data starting from row 2
      XLSX.utils.sheet_add_json(worksheet, excelData, { 
        origin: 'A2',
        skipHeader: false
      });

      // Adjust column widths and styling
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const colWidths = {};
      Object.keys(excelData[0] || {}).forEach((key, index) => {
        colWidths[index] = Math.max(key.length * 1.5, 15);
      });
      worksheet["!cols"] = Object.keys(colWidths).map((col) => ({
        wch: colWidths[col],
      }));
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = {
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
            sz: 12,
          },
          fill: {
            fgColor: { rgb: "0172C2" },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "medium", color: { rgb: "000000" } },
            bottom: { style: "medium", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
      worksheet["!rows"] = [{ hpt: 30 }];
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) continue;
          worksheet[cellAddress].s = {
            border: {
              top: { style: "thin", color: { rgb: "CCCCCC" } },
              bottom: { style: "thin", color: { rgb: "CCCCCC" } },
              left: { style: "thin", color: { rgb: "CCCCCC" } },
              right: { style: "thin", color: { rgb: "CCCCCC" } },
            },
          };
          if (col >= 0 && typeof worksheet[cellAddress].v === "number") {
            worksheet[cellAddress].s.alignment = { horizontal: "right" };
            worksheet[cellAddress].s.numFmt = "#,##0.00";
          }
        }
      }

      // Adjust cell styles for timestamp row
      const timestampCell = worksheet['A1'];
      if (timestampCell) {
        timestampCell.s = {
          font: { bold: true, color: { rgb: "000000" }, sz: 12 },
          alignment: { horizontal: "left" }
        };
      }

      XLSX.utils.book_append_sheet(workbook, worksheet, "Bills Report");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const now1 = new Date();
      const filename = `${now1.getDate().toString().padStart(2, '0')}${(now1.getMonth() + 1).toString().padStart(2, '0')}${now1.getFullYear().toString().slice(-2)}_${now1.getHours().toString().padStart(2, '0')}${now1.getMinutes().toString().padStart(2, '0')}${now1.getSeconds().toString().padStart(2, '0')}.xlsx`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // Changed from "BillsReport.xlsx" to dynamic filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading the report:", error);
      toast.error(
        "Failed to download report: " + (error.message || "Unknown error")
      );
    }
  };

  const handleEditRow = (row) => {
    console.log("Edit row:", row);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRegion([]);
    setSortBy("");
    setFromDate("");
    setToDate("");
    setSelectedDateField("taxInvDate");
    setIsFilterPopupOpen(false);
  };

  const currentUserRole = Cookies.get("userRole"); // Replace localStorage usage
  const availableRoles = roles.filter((role) => role.value !== currentUserRole);

  const columns = useMemo(() => {
    let roleForColumns = currentUserRole;
    if (currentUserRole === "site_officer") {
      roleForColumns = "SITE_OFFICER";
    } else if (currentUserRole === "qs_site") {
      roleForColumns = "QS_TEAM";
    } else if (currentUserRole === "site_pimo") {
      roleForColumns = "PIMO_MUMBAI_MIGO_SES";
    } else if (currentUserRole === "pimo_mumbai") {
      roleForColumns = "PIMO_MUMBAI_ADVANCE_FI";
    } else if (currentUserRole === "accounts") {
      roleForColumns = "ACCOUNTS_TEAM";
    } else if (currentUserRole === "director") {
      roleForColumns = "DIRECTOR_TRUSTEE_ADVISOR";
    } else {
      roleForColumns = "ADMIN";
    }
    return getColumnsForRole(roleForColumns);
  }, [currentUserRole]);

  useEffect(() => {
    if (columns.length > 0) {
      setVisibleColumnFields(columns.slice(0, 12).map((col) => col.field));
    }
  }, [columns]);

  const toggleColumnVisibility = (field) => {
    setVisibleColumnFields((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  const toggleAllColumns = () => {
    const filteredColumns = columns.filter((col) => col.field !== "srNoOld");
    if (visibleColumnFields.length === filteredColumns.length) {
      setVisibleColumnFields([filteredColumns[0].field]);
    } else {
      setVisibleColumnFields(filteredColumns.map((col) => col.field));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        columnSelectorRef.current &&
        !columnSelectorRef.current.contains(event.target)
      ) {
        setIsColumnDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalPages = useMemo(
    () => Math.ceil(totalFilteredItems / itemsPerPage),
    [totalFilteredItems, itemsPerPage]
  );

  const pageNumbers = useMemo(() => {
    const totalPagesToShow = Math.min(pagesToShow, totalPages);
    let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);
    if (endPage - startPage + 1 < totalPagesToShow) {
      startPage = Math.max(1, endPage - totalPagesToShow + 1);
    }
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [currentPage, totalPages, pagesToShow]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      }
    }
    setSortConfig({ key, direction });
  };

  const handleSelectRow = (newSelectedRows) => {
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === filteredData.length);
  };

  const handleRegionChange = (e) => {
    const region = e.target.value;
    setSelectedRegion(region ? [region] : []);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <div className="flex-1 flex border border-gray-300 rounded-md text-sm">
                  <img src={search} alt="search" className="ml-1.5" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 outline-none text-sm w-full"
                  />
                </div>
                <button
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-400 hover:cursor-pointer"
                  onClick={() => setIsFilterPopupOpen(true)}
                  title="Filter Options"
                >
                  <Funnel className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    /* Add your checklist handler here */
                  }}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Checklist</span>
                </button>

                <div className="relative" ref={columnSelectorRef}>
                  <button
                    className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setIsColumnDropdownOpen(!isColumnDropdownOpen)
                    }
                  >
                    <Grid3x3 className="w-4 h-4" />
                    <span>Column List</span>
                  </button>

                  {isColumnDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200">
                        <div
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={toggleAllColumns}
                        >
                          <input
                            type="checkbox"
                            checked={
                              visibleColumnFields.length ===
                              columns.filter((col) => col.field !== "srNoOld")
                                .length
                            }
                            readOnly
                          />
                          <span>Select All</span>
                        </div>
                      </div>
                      <div className="p-2 space-y-2">
                        {columns
                          .filter((col) => col.field !== "srNoOld")
                          .map((column) => (
                            <div
                              key={column.field}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={`col-${column.field}`}
                                checked={visibleColumnFields.includes(
                                  column.field
                                )}
                                onChange={() =>
                                  toggleColumnVisibility(column.field)
                                }
                                className="hover:cursor-pointer"
                              />
                              <label
                                className="hover:cursor-pointer"
                                htmlFor={`col-${column.field}`}
                              >
                                {column.headerName}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className={`inline-flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                    showDownloadValidation
                      ? "animate-shake border-2 border-red-500"
                      : ""
                  }`}
                  onClick={handleDownloadReport}
                  title={
                    selectedRows.length === 0
                      ? "Select rows to download"
                      : "Download Excel Report"
                  }
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>

                <button
                  className={`inline-flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors ${
                    selectedRole
                      ? "relative after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:rounded-full"
                      : ""
                  }`}
                  onClick={handleSendTo}
                  title="Send Bills"
                >
                  <Send className="w-4 h-4" />
                  <span>Send To</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <Loader text="Fetching Bills..." />
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg font-semibold text-red-600">{error}</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto">
                  <DataTable
                    data={filteredData}
                    searchQuery={searchQuery}
                    availableColumns={columns.filter(
                      (col) => col.field !== "srNoOld"
                    )}
                    visibleColumnFields={visibleColumnFields}
                    onEdit={handleEditRow}
                    selectedRows={selectedRows}
                    onRowSelect={handleSelectRow}
                    totalSelected={selectedRows.length}
                    totalItems={filteredData.length}
                    selectAll={selectAll}
                    onSelectAll={handleSelectAll}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onFilteredDataChange={(filteredData) => {
                      setTotalItems(filteredData.length);
                      const maxPage = Math.ceil(
                        filteredData.length / itemsPerPage
                      );
                      if (currentPage > maxPage) {
                        setCurrentPage(1);
                      }
                    }}
                    onPaginatedDataChange={(totalItems) => {
                      setTotalFilteredItems(totalItems);
                    }}
                  />
                </div>

                <div className="border-t border-gray-200 bg-white px-4 py-2">
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-2">
                      <select
                        value={itemsPerPage}
                        onChange={(e) =>
                          setItemsPerPage(Number(e.target.value))
                        }
                        className="px-2 py-1.5 text-sm hover:cursor-pointer outline-none border border-gray-300 rounded-mdx"
                      >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={30}>30 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        First
                      </button>
                      <button
                        className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>

                      {pageNumbers.map((pageNumber) => (
                        <button
                          key={pageNumber}
                          className={`px-2.5 py-1.5 text-sm hover:cursor-pointer border rounded-md transition-colors ${
                            currentPage === pageNumber
                              ? "bg-[#011a99] text-white"
                              : "bg-white border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button
                        className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                      <button
                        className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Last
                      </button>
                    </div>

                    <div className="text-sm text-gray-600">
                      Showing{" "}
                      {filteredData.length
                        ? (currentPage - 1) * itemsPerPage + 1
                        : 0}{" "}
                      to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredData.length
                      )}{" "}
                      of {filteredData.length} entries
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterPopupOpen}
        onClose={() => setIsFilterPopupOpen(false)}
        selectedRegion={selectedRegion}
        uniqueRegions={uniqueRegions}
        handleRegionChange={handleRegionChange}
        selectedDateField={selectedDateField}
        setSelectedDateField={setSelectedDateField}
        dateFieldOptions={dateFieldOptions}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        handleClearFilters={handleClearFilters}
      />

      <SendToModal
        isOpen={isSendBoxOpen}
        onClose={() => setIsSendBoxOpen(false)}
        availableRoles={roleWorkflow[currentUserRole] || []}
        handleSendToRole={handleSendToRole}
      />

      <SendBoxModal
        isOpen={isWindowOpen}
        onClose={() => {
          setIsWindowOpen(false);
          setSelectedRole(null);
        }}
        selectedBills={selectedRows}
        billsData={billsData}
        singleRole={selectedRole}
        handleSend={handleSendBills}
      />
    </div>
  );
};

export default Dashboard;
