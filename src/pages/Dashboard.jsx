import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { bills, billWorkflow, importReport } from "../apis/bills.api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataTable from "../components/dashboard/DataTable";
import {
  Funnel,
  Grid3x3,
  Download,
  Send,
  AlertTriangle,
  CheckSquare,
  ArrowLeftFromLine,
  ArrowRightFromLine,
} from "lucide-react";
import search from "../assets/search.svg";
import { getColumnsForRole } from "../utils/columnView";
import { FilterModal } from "../components/dashboard/FilterModal";
import { SendToModal } from "../components/dashboard/SendToModal";
import SendBox from "../components/Sendbox";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
import ImportModal from "../components/dashboard/ImportModal";
import { handleExportReport } from "../utils/exportExcelDashboard";

const ChecklistModal = ({ isOpen, onClose, selectedRows, billsData }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Select Checklist Type</h2>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/checklist-directFI2", {state: { selectedRows, bills: billsData.filter((bill) => selectedRows?.includes(bill._id)) }})}
            className="bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors hover:cursor-pointer w-full py-2 px-4"
          >
            Direct FI Checklist
          </button>
          <button
            onClick={() => navigate("/checklist-advance", {state: { selectedRows, bills: billsData.filter((bill) => selectedRows?.includes(bill._id)) }})}
            className="bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors hover:cursor-pointer w-full py-2 px-4"
          >
            Advanced Checklist
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const currentUserRole = Cookies.get("userRole");
  
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [columnSearchQuery, setColumnSearchQuery] = useState("");
  const [showIncomingBills, setShowIncomingBills] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  const navigate = useNavigate();

  console.log(selectedRows);

  const handleChecklist = () => {
    if (currentUserRole === 'site_officer') {
      navigate("/checklist-bill-journey", {state: { selectedRows, bills: billsData.filter((bill) => selectedRows?.includes(bill._id)) }});
    } else if (currentUserRole === 'pimo_mumbai') {
      setIsChecklistModalOpen(true);
    } else if (currentUserRole === 'accounts') {
      navigate("/checklist-account2", {state: { selectedRows, bills: billsData.filter((bill) => selectedRows?.includes(bill._id)) }});
    }
  };

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
    site_officer: [
      { value: "quantity_inspector", label: "Quantity Inspector" },
      { value: "architect", label: "Architect" },
      { value: "engineer", label: "Site Engineer" },
      { value: "incharge", label: "Site Incharge" },
      { value: "site_pimo", label: "Site PIMO" }
    ],
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
      const actor = Cookies.get("userName");
      const promises = selectedBills.map((billId) =>
        axios.post(`${billWorkflow}/${billId}/advance`, {
          actor,
          comments: remarks || "No remarks added",
        })
      );

      const results = await Promise.allSettled(promises);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );
      const successfulRequests = results.filter(
        (result) => result.status === "fulfilled"
      );

      if (failedRequests.length > 0) {
        toast.error(
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>
              Failed to send {failedRequests.length} bill
              {failedRequests.length > 1 ? "s" : ""}
            </span>
          </div>
        );
      }

      if (successfulRequests.length > 0) {
        toast.success(
          <div className="flex items-center gap-2">
            <Send size={18} className="text-white" />
            <span>
              Successfully sent {successfulRequests.length} bill
              {successfulRequests.length > 1 ? "s" : ""} to {selectedRole.label}
            </span>
          </div>,
          {
            style: { background: "#4CAF50", color: "white" },
            progressStyle: { background: "white" },
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
          <span>
            {error.response?.data?.message ||
              "Failed to send bills. Please try again."}
          </span>
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

  // const filterBillsByWorkflowState = (bills, userRole) => {
  //   return bills.filter((bill) => {
  //     const currentState = bill.workflowState?.currentState;

  //     if (currentState === "Completed" || currentState === "Rejected") {
  //       return ["pimo_mumbai", "accounts", "director", "admin"].includes(
  //         userRole
  //       );
  //     }

  //     const stateToRoleMap = {
  //       Site_Officer: ["site_officer"],
  //       Site_PIMO: ["site_pimo"],
  //       QS_Site: ["qs_site"],
  //       PIMO_Mumbai: ["pimo_mumbai"],
  //       Directors: ["director"],
  //       Accounts: ["accounts"],
  //     };

  //     if (userRole === "admin") return true;

  //     return stateToRoleMap[currentState]?.includes(userRole) || false;
  //   });
  // };

  const fetchBills = async () => {
    try {
      const response = await axios.get(bills, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      const userRole = Cookies.get("userRole");

      console.log("Received response data:", response.data);

      // const filteredBills = filterBillsByWorkflowState(response.data, userRole);

      const sortedData = response.data.sort((a, b) => {
        const aHasHistory = (a.workflowState?.history?.length || 0) > 0;
        const bHasHistory = (b.workflowState?.history?.length || 0) > 0;
        
        if (aHasHistory !== bHasHistory) {
          return aHasHistory ? 1 : -1;
        }
        
        const aDate = new Date(a.taxInvDate || 0);
        const bDate = new Date(b.taxInvDate || 0);
        return bDate - aDate;
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

    // Filter for incoming bills when showIncomingBills is true
    if (showIncomingBills) {
      if (currentUserRole === 'accounts') {
        result = result.filter(bill => 
          bill.accountsDept?.dateGiven && !bill.accountsDept?.dateReceived
        );
      } else if (currentUserRole === 'pimo_mumbai') {
        result = result.filter(bill => 
          bill.pimoMumbai?.dateGiven && !bill.pimoMumbai?.dateReceived
        );
      }
    } else {
      // Your existing filtering logic
      if (selectedRegion.length > 0) {
        result = result.filter((row) => selectedRegion.includes(row.region));
      }
      result = result.filter(isWithinDateRange);
    }
    
    result = sortData(result, sortConfig);
    return result;
  }, [billsData, selectedRegion, sortConfig, isWithinDateRange, showIncomingBills, currentUserRole]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelectedRows(isChecked ? filteredData.map((row) => row._id) : []);
  };

  const handleDownloadReport = async () => {
    const result = await handleExportReport(
      selectedRows,
      filteredData,
      columns,
      visibleColumnFields
    );
    if (result.success) {
      toast.success(result.message);
    } else {
      if (result.message.includes("Please select at least one row")) {
        toast.warning(
          <div className="send-toast">
            <span>
              <AlertTriangle size={18} />
            </span>
            <span>{result.message}</span>
          </div>,
          { autoClose: 3000 }
        );
        setShowDownloadValidation(true);
        setTimeout(() => setShowDownloadValidation(false), 3000);
      } else {
        toast.error(result.message);
      }
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

  // const availableRoles = roles.filter((role) => role.value !== currentUserRole);

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
      const initialColumns = columns.slice(0, 12).map((col) => col.field);
      if (!initialColumns.includes("srNo")) {
        initialColumns.unshift("srNo");
      }
      setVisibleColumnFields(initialColumns);
    }
  }, [columns]);

  const toggleColumnVisibility = (field) => {
    if (field === "srNo") return;

    setVisibleColumnFields((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field && f !== "srNo");
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

  const handleImportBills = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(importReport, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Bills updated successfully");
    } catch (error) {
      console.error("Error updating bills:", error);
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>Failed to update bills. Please try again.</span>
        </div>
      );
    }
  };

  const showIncomingBillsButton = ["accounts", "pimo_mumbai"].includes(
    currentUserRole
  );

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
                {showIncomingBillsButton && (
                  <button
                    className="flex items-center hover:cursor-pointer space-x-1.5 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => setShowIncomingBills(!showIncomingBills)}
                  >
                    {showIncomingBills ? (
                      <>
                        <ArrowLeftFromLine className="w-4 h-4" />
                        <span>Go Back</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightFromLine className="w-4 h-4" />
                        <span>Incoming Bills</span>
                      </>
                    )}
                  </button>
                )}

                {['site_officer', 'pimo_mumbai', 'accounts'].includes(currentUserRole) && (
                  <button
                    className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={handleChecklist}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Checklist</span>
                  </button>
                )}

                {/* 
                <button
                  className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => setIsImportModalOpen(true)}
                >
                  <Upload className="w-4 h-4" />
                  <span>Update Bills</span>
                </button> */}

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
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search columns..."
                          value={columnSearchQuery}
                          onChange={(e) => setColumnSearchQuery(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="p-2 border-b border-gray-200 bg-white sticky top-[52px]">
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
                          <span className="text-sm">Select All</span>
                        </div>
                      </div>
                      <div className="overflow-y-auto p-2 space-y-2">
                        {columns
                          .filter((col) => col.field !== "srNoOld")
                          .filter((col) =>
                            col.headerName
                              .toLowerCase()
                              .includes(columnSearchQuery.toLowerCase())
                          )
                          .map((column) => (
                            <div
                              key={column.field}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={`col-${column.field}`}
                                checked={
                                  column.field === "srNo" ||
                                  visibleColumnFields.includes(column.field)
                                }
                                onChange={() =>
                                  toggleColumnVisibility(column.field)
                                }
                                className={`hover:cursor-pointer ${
                                  column.field === "srNo" ? "opacity-60" : ""
                                }`}
                                disabled={column.field === "srNo"}
                              />
                              <label
                                className={`hover:cursor-pointer text-sm ${
                                  column.field === "srNo" ? "opacity-60" : ""
                                }`}
                                htmlFor={`col-${column.field}`}
                              >
                                {column.headerName}
                              </label>
                            </div>
                          ))}
                        {columns.filter(
                          (col) =>
                            col.field !== "srNoOld" &&
                            col.headerName
                              .toLowerCase()
                              .includes(columnSearchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="text-gray-500 text-sm text-center py-2">
                            No columns found
                          </div>
                        )}
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
                    currentUserRole={currentUserRole} // Add this line
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

                    <div className="flex items-center text-sm text-gray-600">
                      <div>
                        Showing{" "}
                        {filteredData.length
                          ? (currentPage - 1) * itemsPerPage + 1
                          : 0}{" "}
                        to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          totalFilteredItems
                        )}{" "}
                        entries
                        <span className="ml-2">
                          <span className="text-gray-400">|</span>
                          <span className="ml-2">
                            Total:{" "}
                            <span className="font-medium">
                              {billsData.length}
                            </span>
                          </span>
                          {totalFilteredItems !== billsData.length && (
                            <>
                              <span className="text-gray-400 mx-2">|</span>
                              <span className="text-blue-600">
                                Filtered:{" "}
                                <span className="font-medium">
                                  {totalFilteredItems}
                                </span>
                              </span>
                            </>
                          )}
                        </span>
                      </div>
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

      {isWindowOpen && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <SendBox
            closeWindow={() => {
              setIsWindowOpen(false);
              setSelectedRole(null);
            }}
            selectedBills={selectedRows}
            billsData={filteredData}  // Changed from billsData to filteredData
            singleRole={selectedRole}
          />
        </div>
      )}

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportBills}
      />

      <ChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        selectedRows={selectedRows}
        billsData={billsData}
      />
    </div>
  );
};

export default Dashboard;
