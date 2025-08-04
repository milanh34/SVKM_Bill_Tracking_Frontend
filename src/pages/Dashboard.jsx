import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { bills, receiveBills, notReceivedPimo, notReceivedAccounts } from "../apis/bills.api";
import {
  natureOfWorks,
  currencies,
  vendors,
} from "../apis/master.api";
import { user } from "../apis/user.apis";
import { toast } from 'react-toastify';
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
  Printer,
  EditIcon,
  X
} from "lucide-react";
import search from "../assets/search.svg";
import { getColumnsForRole } from "../utils/columnView";
import { FilterModal } from "../components/dashboard/FilterModal";
import { SendToModal } from "../components/dashboard/SendToModal";
import { UpdateBillModal } from "../components/UpdateBillModal";
import { SendBoxModal } from "../components/dashboard/SendBoxModal";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
import { handleExportReport } from "../utils/exportExcelDashboard";
import { patchBills } from "../apis/report.api";

const Dashboard = () => {
  const currentUserRole = Cookies.get("userRole");

  const [billsData, setBillsData] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [natureOfWorkOptions, setNatureOfWorkOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [userData, setUserData] = useState(null);
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
  const [columnSearchQuery, setColumnSearchQuery] = useState("");
  const [showIncomingBills, setShowIncomingBills] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openUpdateBillModal, setOpenUpdateBillModal] = useState(false);

  const navigate = useNavigate();

  const handleChecklist = () => {
    if (currentUserRole === "site_officer") {
      if (selectedRows.length === 0) {
        toast.error("Please select bills to proceed");
        return;
      }
      navigate("/checklist-bill-journey", {
        state: {
          selectedRows,
          bills: billsData.filter((bill) => selectedRows?.includes(bill._id)),
        },
      });
    } else if (currentUserRole === "site_pimo") {
      if (selectedRows.length === 0) {
        toast.error("Please select bills to proceed");
        return;
      }

      const selectedBills = billsData.filter((bill) => selectedRows.includes(bill._id));
      const natureOfWorkSet = new Set(selectedBills.map(bill => bill.natureOfWork));

      if (natureOfWorkSet.size !== 1) {
        toast.error("Selected bills must have the same nature of work");
        return;
      }

      const natureOfWork = Array.from(natureOfWorkSet)[0];

      if (natureOfWork === "Direct FI Entry") {
        navigate("/checklist-directFI2", {
          state: {
            selectedRows,
            bills: selectedBills,
          },
        });
      } else if (natureOfWork === "Advance/LC/BG") {
        navigate("/checklist-advance2", {
          state: {
            selectedRows,
            bills: selectedBills,
          },
        });
      } else {
        toast.error("Invalid nature of work. Bills must be either 'Direct FI Entry' or 'Advance/LC/BG'");
      }
    } else if (currentUserRole === "accounts") {
      if (selectedRows.length === 0) {
        toast.error("Please select bills to proceed");
        return;
      }
      navigate("/checklist-account2", {
        state: {
          selectedRows,
          bills: billsData.filter((bill) => selectedRows?.includes(bill._id)),
        },
      });
    }
  };

  const roleWorkflow = {
    site_officer: [
      { value: "quality_engineer", label: "Quality Engineer" },
      { value: "qs_measurement", label: "QS for measure" },
      { value: "qs_cop", label: "QS for Prov. COP" },
      { value: "site_engineer", label: "Site Engineer" },
      { value: "site_architect", label: "Site Architect" },
      { value: "site_incharge", label: "Site Incharge" },
      { value: "migo_entry", label: "MIGO Team" },
      { value: "migo_entry_return", label: "Ret to Site Team aft MIGO" },
      { value: "site_dispatch_team", label: "Site Dispatch Team" },
      { value: "pimo_mumbai", label: "PIMO Team" },
    ],
    qs_site: [
      { value: "measure", label: "Ret to Site Team aft measure" },
      { value: "site_cop", label: "Ret to Site Team aft COP" },
      { value: "pimo_cop", label: "Ret to PIMO Team aft COP" },
    ],
    site_pimo: [
      { value: "qs_mumbai", label: "QS Mumbai for COP" },
      { value: "it_team", label: "IT Team" },
      { value: "ses_team", label: "SES Team" },
      { value: "it_return_team", label: "Ret to PIMO Team by IT" },
      { value: "ses_return_team", label: " Ret to PIMO Team by SES" },
      { value: "trustee", label: "Director/Advisor/Trustee" },
      { value: "accounts_department", label: "Accounts Team" }
    ],
    director: [{ value: "pimo_mumbai", label: "Returned to PIMO" }],
  };

  const handleSendTo = () => {
    const availableRoles = roleWorkflow[currentUserRole] || [];

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

  const handleReceiveBills = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select bills to receive");
      return;
    }

    try {
      const token = Cookies.get("token");
      const promises = selectedRows.map((billId) =>
        axios.post(
          receiveBills,
          { billId, role: currentUserRole },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      await Promise.all(promises);
      toast.success("Bills marked as received successfully");
      await fetchAllData(); 
      setSelectedRows([]);
    } catch (error) {
      console.error("Error receiving bills:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark bills as received"
      );
    }
  };

  const handleNotReceiveBills = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select bills to mark as not received");
      return;
    }

    try {
      const token = Cookies.get("token");
      const endpoint = currentUserRole === "site_pimo" ? notReceivedPimo : notReceivedAccounts;
      
      const promises = selectedRows.map((billId) =>
        axios.post(
          endpoint,
          { billId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      await Promise.all(promises);
      toast.success("Bills marked as not received");
      await fetchAllData();
      setSelectedRows([]);
    } catch (error) {
      console.error("Error marking bills as not received:", error);
      toast.error(
        error.response?.data?.message || "Failed to mark bills as not received"
      );
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");

    if (!currentUserRole || !token) {
      navigate("/login");
    }
  }, [navigate]);

  const filterBillsByRole = (bills, userRole) => {
    console.log("Filtering bills for role:", bills);
    return bills.filter((bill) => {
      const currentCount = bill?.currentCount || 0;

      switch (userRole) {
        case "site_officer":
          return currentCount === 1;

        case "site_pimo":
          return currentCount === 3;

        // case "pimo_mumbai":
        //   return currentCount === 3;

        case "qs_site":
          return currentCount === 2;

        case "director":
          return currentCount === 4;

        case "accounts":
          return currentCount === 5 && bill.accountsDept.paymentDate === null;

        case "admin":
          return true;

        default:
          return false;
      }
    });
  };

  useEffect(() => {
    if (visibleColumnFields.length > 0) {
      localStorage.setItem("dashboard_visible_columns", JSON.stringify(visibleColumnFields));
    }
  }, [visibleColumnFields]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [
        billsResponse,
        natureOfWorksRes,
        currenciesRes,
        vendorsRes,
        userRes,
      ] = await Promise.all([
        axios.get(bills, { headers }),
        axios.get(natureOfWorks, { headers }),
        axios.get(currencies, { headers }),
        axios.get(vendors, { headers }),
        axios.get(user, { headers }),
      ]);

      const filteredBills = filterBillsByRole(billsResponse.data, currentUserRole);

      const sortedData = filteredBills.sort((a, b) => {
        const aDate = new Date(a.taxInvRecdAtSite || 0);
        const bDate = new Date(b.taxInvRecdAtSite || 0);
        return bDate - aDate;
      });

      setBillsData(sortedData);
      setRegionOptions(userRes.data?.data?.region || []);
      setNatureOfWorkOptions(natureOfWorksRes.data || []);
      setCurrencyOptions(currenciesRes.data || []);
      setVendorOptions(vendorsRes.data || []);
      setUserData(userRes.data?.data || null);
      setError(null);
    } catch (error) {
      setError(
        "We are experiencing some technical difficulties. Our team is working to resolve this issue as quickly as possible."
      );
      setBillsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
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

    // First filter based on role and received status
    if (["site_pimo", "accounts"].includes(currentUserRole)) {
      if (showIncomingBills) {
        // Show only bills that haven't been received
        if (currentUserRole === "accounts") {
          result = result.filter(
            (bill) =>
              bill.accountsDept?.dateGiven && !bill.accountsDept?.dateReceived
          );
        } else if (currentUserRole === "site_pimo") {
          result = result.filter(
            (bill) =>
              bill.pimoMumbai?.dateGiven && !bill.pimoMumbai?.dateReceived
          );
        }
      } else {
        // Show only bills that have been received
        if (currentUserRole === "accounts") {
          result = result.filter((bill) => bill.accountsDept?.dateReceived);
        } else if (currentUserRole === "site_pimo") {
          result = result.filter((bill) => bill.pimoMumbai?.markReceived === true);
        }
      }
    }

    // Apply other existing filters
    if (selectedRegion.length > 0) {
      result = result.filter((row) => selectedRegion.includes(row.region));
    }
    result = result.filter(isWithinDateRange);
    result = sortData(result, sortConfig);

    return result;
  }, [
    billsData,
    selectedRegion,
    sortConfig,
    isWithinDateRange,
    showIncomingBills,
    currentUserRole,
  ]);

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

  const handleEditRow = async () => {
    setLoading(true);
    try {
      await fetchAllData();
      setSelectedRows([]);
    } finally {
      setLoading(false);
    }
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

  const columns = useMemo(() => {
    let roleForColumns = currentUserRole;
    if (currentUserRole === "site_officer") {
      roleForColumns = "SITE_OFFICER";
    } else if (currentUserRole === "qs_site") {
      roleForColumns = "QS_TEAM";
    } else if (currentUserRole === "site_pimo") {
      roleForColumns = "PIMO_MUMBAI_MIGO_SES";
    // } else if (currentUserRole === "pimo_mumbai") {
    //   roleForColumns = "PIMO_MUMBAI_ADVANCE_FI";
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
      const stored = localStorage.getItem("dashboard_visible_columns");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only keep columns that still exist (in case columns change)
        const valid = parsed.filter(field => columns.some(col => col.field === field));
        setVisibleColumnFields(valid.length > 0 ? valid : columns.slice(0, 12).map(col => col.field));
      } else {
        const initialColumns = columns.slice(0, 12).map((col) => col.field);
        if (!initialColumns.includes("srNo")) {
          initialColumns.unshift("srNo");
        }
        setVisibleColumnFields(initialColumns);
      }
    }
  }, [columns]);

  const toggleColumnVisibility = (field) => {
    // Prevent srNo from being toggled off
    // if (field === "srNo") return;

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

  const showIncomingBillsButton = ["accounts", "site_pimo",].includes(
    currentUserRole
  );

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(patchBills, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (response.data?.success) {
        toast.success(response.data.message || "Bills patched successfully!");
        await fetchAllData();
      } else {
        toast.error(response.data?.message || "Failed to patch bills.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to upload and patch bills."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handlePrint = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to print");
      return;
    }

    const selectedData = filteredData.filter(row => selectedRows.includes(row._id));

    const visibleColumns = columns.filter(col =>
      visibleColumnFields.includes(col.field) && col.field !== "srNoOld"
    );

    const grandTotals = {};

    grandTotals.taxInvAmt = selectedData.reduce((total, row) => {
      const taxInvAmt = row.taxInvAmt || 0;
      return total + (typeof taxInvAmt === 'number' ? taxInvAmt : 0);
    }, 0);

    const copAmountColumn = visibleColumns.find(col => col.field === "copDetails.amount");
    if (copAmountColumn) {
      grandTotals["copDetails.amount"] = selectedData.reduce((total, row) => {
        const copAmount = row.copDetails?.amount || 0;
        return total + (typeof copAmount === 'number' ? copAmount : 0);
      }, 0);
    }

    const paymentAmtColumn = visibleColumns.find(col => col.field === "accountsDept.paymentAmt");
    if (paymentAmtColumn) {
      grandTotals["accountsDept.paymentAmt"] = selectedData.reduce((total, row) => {
        const paymentAmt = row.accountsDept?.paymentAmt || 0;
        return total + (typeof paymentAmt === 'number' ? paymentAmt : 0);
      }, 0);
    }

    const poAmtColumn = visibleColumns.find(col => col.field === "poAmt");
    if (poAmtColumn) {
      grandTotals["poAmt"] = selectedData.reduce((total, row) => {
        const valuePoAmt = row.poAmt || 0;
        return total + (typeof valuePoAmt === 'number' ? valuePoAmt : 0);
      }, 0);
    }

    console.log(grandTotals);

    const printWindow = window.open("", "_blank");

    const tableHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bills Report</title>
        <style>
          @page {
            size: landscape;
            margin: 1cm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            font-size: 11px;
          }
          td {
            font-size: 10px;
          }
          .amount {
            text-align: right;
          }
          .status-approved {
            color: #15803d;
            font-weight: bold;
          }
          .status-rejected {
            color: #b91c1c;
            font-weight: bold;
          }
          .status-pending {
            color: #ca8a04;
            font-weight: bold;
          }
          .print-info {
            margin-bottom: 10px;
            font-size: 10px;
            color: #666;
          }
          .grand-total-row {
            background-color: #f8f9fa;
            font-weight: bold;
            border-top: 2px solid #333;
          }
          .grand-total-row td {
            font-size: 11px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">Bills Report</div>
        <div class="print-info">
          <strong>Print Date:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Total Records:</strong> ${selectedData.length}<br>
          <strong>User Role:</strong> ${currentUserRole}
        </div>
        <table>
          <thead>
            <tr>
              ${visibleColumns.map(col => `<th>${col.headerName}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${selectedData.map(row => `
              <tr>
                ${visibleColumns.map(col => {
      const value = getNestedValue(row, col.field);
      let displayValue = value || '-';

      if (col.field.includes('amount') || col.field.includes('Amt')) {
        if (value && !isNaN(value)) {
          displayValue = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
          }).format(value);
        }
      }

      if (value && typeof value === 'string' && value.includes('T')) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            displayValue = date.toLocaleDateString('en-GB');
          }
        } catch (e) {
          console.log(e);
        }
      }

      let cellClass = '';
      if (col.field.includes('status') && value) {
        const statusLower = value.toLowerCase();
        if (statusLower.includes('approve') || statusLower === 'paid' || statusLower === 'active') {
          cellClass = 'status-approved';
        } else if (statusLower.includes('reject') || statusLower === 'fail') {
          cellClass = 'status-rejected';
        } else if (statusLower.includes('pend') || statusLower === 'waiting' || statusLower === 'unpaid') {
          cellClass = 'status-pending';
        }
      }

      if (col.field.includes('amount') || col.field.includes('Amt')) {
        cellClass += ' amount';
      }

      return `<td class="${cellClass}">${displayValue}</td>`;
    }).join('')}
              </tr>
            `).join('')}
            
            <!-- Grand Total Row -->
            <tr class="grand-total-row">
              ${visibleColumns.map((col, index) => {
      if (index === 0) {
        return `<td><strong>Grand Total</strong></td>`;
      } else if (grandTotals[col.field]) {
        const total = grandTotals[col.field];
        const formattedTotal = new Intl.NumberFormat('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true
        }).format(total);
        return `<td class="amount"><strong>${formattedTotal}</strong></td>`;
      } else {
        return `<td></td>`;
      }
    }).join('')}
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

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

                {["site_officer", "accounts", "site_pimo"].includes(
                  currentUserRole
                ) && (
                  <button
                    className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={handleChecklist}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Checklist</span>
                  </button>
                )}

                <button
                  className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-white text-sm bg-[#011a99] border border-gray-300 rounded-md hover:bg-blue-800 transition-colors"
                  onClick={() => setOpenUpdateBillModal(true)}
                >
                  <EditIcon className="w-4 h-4 mr-1" />
                  Update Bills
                </button>

                <button
                  className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-white text-sm bg-yellow-600 border border-gray-300 rounded-md hover:bg-yellow-700 transition-colors"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>

                {currentUserRole === "accounts" && (
                  <label className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      style={{ display: "none" }}
                      onChange={handleExcelUpload}
                      disabled={uploading}
                    />
                    <Download className="w-4 h-4" />
                    <span>{uploading ? "Uploading..." : "Upload Excel"}</span>
                  </label>
                )}

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
                          // .filter((col) => col.field !== "srNoOld")
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
                                  // column.field === "srNo" ||
                                  visibleColumnFields.includes(column.field)
                                }
                                onChange={() =>
                                  toggleColumnVisibility(column.field)
                                }
                                // className={`hover:cursor-pointer ${column.field === "srNo" ? "opacity-60" : ""}`}
                                className="hover:cursor-pointer"
                                // disabled={column.field === "srNo"}
                              />
                              <label
                                // className={`hover:cursor-pointer text-sm ${column.field === "srNo" ? "opacity-60" : ""}`}
                                className="hover:cursor-pointer text-sm"
                                htmlFor={`col-${column.field}`}
                              >
                                {column.headerName}
                              </label>
                            </div>
                          ))}
                        {columns.filter((col) =>
                          // col.field !== "srNoOld" &&
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
                {showIncomingBills ? (
                  <div className="flex items-center space-x-2">
                    <button
                      className="inline-flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-[#1a8d1a] text-white rounded-md hover:bg-[#158515] transition-colors"
                      onClick={handleReceiveBills}
                      disabled={selectedRows.length === 0}
                      title={
                        selectedRows.length === 0
                          ? "Select bills to mark as received"
                          : "Mark selected bills as received"
                      }
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Mark as Received</span>
                    </button>
                    <button
                      className="inline-flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      onClick={handleNotReceiveBills}
                      disabled={selectedRows.length === 0}
                      title={
                        selectedRows.length === 0
                          ? "Select bills to mark as not received"
                          : "Mark selected bills as not received"
                      }
                    >
                      <X className="w-4 h-4" />
                      <span>Mark as Not Received</span>
                    </button>
                  </div>
                ) : (
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
                )}
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
                    onPageChange={setCurrentPage}
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
                    currentUserRole={currentUserRole}
                    regionOptions={regionOptions}
                    natureOfWorkOptions={natureOfWorkOptions}
                    currencyOptions={currencyOptions}
                    vendorOptions={vendorOptions}
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
          <SendBoxModal
            closeWindow={() => {
              setIsWindowOpen(false);
              setSelectedRole(null);
            }}
            selectedBills={selectedRows}
            billsData={filteredData.filter((bill) =>
              selectedRows.includes(bill._id)
            )}
            singleRole={selectedRole}
          />
        </div>
      )}

      {openUpdateBillModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center">
          <UpdateBillModal
            setOpenUpdateBillModal={setOpenUpdateBillModal}
            loading={loading}
            setLoading={setLoading}
            fetchAllData={fetchAllData}
            patch={true}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
