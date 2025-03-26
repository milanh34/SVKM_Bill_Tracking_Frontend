import React, { useState, useRef, useEffect, useMemo } from "react";
import Header from "../components/Header";
// import Filters from "../components/Filters2";
import axios from "axios";
import { bills, report } from "../apis/bills.api";
import SendBox from "../components/Sendbox";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

// Import DataTable component and utility functions
import DataTable from "../components/dashboard/DataTable3_old";
import { Funnel, Grid3x3, Download, Send, AlertTriangle } from "lucide-react";

// Add this function before the Reports component
const getColumnsForRole = (role) => {
  const allColumns = [
    // Basic columns
    { field: "srNo", headerName: "Sr No" },
    { field: "srNoOld", headerName: "Sr No Old" },
    { field: "typeOfInv", headerName: "Type of Inv" },
    { field: "region", headerName: "Region" },
    { field: "projectDescription", headerName: "Project Description" },
    { field: "vendorNo", headerName: "Vendor No" },
    { field: "vendorName", headerName: "Vendor Name" },
    { field: "gstNumber", headerName: "GST Number" },
    { field: "compliance206AB", headerName: "206AB Compliance" },
    { field: "panStatus", headerName: "PAN Status" },
    { field: "poCreated", headerName: "If PO Created?" },
    { field: "poNo", headerName: "PO No" },
    { field: "poDate", headerName: "PO Dt" },
    { field: "poAmt", headerName: "PO Amt" },

    // Proforma Invoice details
    { field: "proformaInvNo", headerName: "Proforma Inv No" },
    { field: "proformaInvDate", headerName: "Proforma Inv Dt" },
    { field: "proformaInvAmt", headerName: "Proforma Inv Amt" },
    { field: "proformaInvRecdAtSite", headerName: "Proforma Inv Recd at Site" },
    { field: "proformaInvRecdBy", headerName: "Proforma Inv Recd By" },

    // Tax Invoice details
    { field: "taxInvNo", headerName: "Tax Inv No" },
    { field: "taxInvDate", headerName: "Tax Inv Dt" },
    { field: "currency", headerName: "Currency" },
    { field: "taxInvAmt", headerName: "Tax Inv Amt" },
    { field: "taxInvRecdAtSite", headerName: "Tax Inv Recd at Site" },
    { field: "taxInvRecdBy", headerName: "Tax Inv Recd By" },

    // Department and remarks
    { field: "department", headerName: "Department" },
    { field: "remarksBySiteTeam", headerName: "Remarks by Site Team" },

    // Advance details
    { field: "advanceDate", headerName: "Advance Dt" },
    { field: "advanceAmt", headerName: "Advance Amt" },
    { field: "advancePercentage", headerName: "Advance Percentage" },
    { field: "advRequestEnteredBy", headerName: "Adv Request Entered By" },

    // Quality Engineer details
    {
      field: "qualityEngineer.dateGiven",
      headerName: "Dt Given to Quality Engineer",
    },
    { field: "qualityEngineer.name", headerName: "Name of Quality Engineer" },

    // COP details
    { field: "copDetails.date", headerName: "COP Dt" },
    { field: "copDetails.amount", headerName: "COP Amt" },

    // MIGO details
    { field: "migoDetails.dateGiven", headerName: "Dt Given for MIGO" },
    { field: "migoDetails.no", headerName: "MIGO No" },
    { field: "migoDetails.date", headerName: "MIGO Dt" },
    { field: "migoDetails.amount", headerName: "MIGO Amt" },
    { field: "migoDetails.doneBy", headerName: "MIGO Done By" },

    // Site Engineer details
    {
      field: "siteEngineer.dateGiven",
      headerName: "Dt Given to Site Engineer",
    },
    { field: "siteEngineer.name", headerName: "Name of Site Engineer" },

    // Architect details
    { field: "architect.dateGiven", headerName: "Dt Given to Architect" },
    { field: "architect.name", headerName: "Name of Architect" },

    // Site Incharge details
    { field: "siteIncharge.dateGiven", headerName: "Dt Given-Site Incharge" },
    { field: "siteIncharge.name", headerName: "Name-Site Incharge" },

    // PIMO Mumbai details
    { field: "pimoMumbai.dateGiven", headerName: "Dt Given to PIMO Mumbai" },
    { field: "pimoMumbai.dateReceived", headerName: "Dt Recd at PIMO Mumbai" },
    { field: "pimoMumbai.receivedBy", headerName: "Name Recd by PIMO Mumbai" },

    // QS Mumbai details
    { field: "qsMumbai.dateGiven", headerName: "Dt Given to QS Mumbai" },
    { field: "qsMumbai.name", headerName: "Name of QS Mumbai" },

    // Accounts Department details
    { field: "accountsDept.dateGiven", headerName: "Dt Given to Accts Dept" },
    { field: "accountsDept.givenBy", headerName: "Name-Given by PIMO Office" },
    { field: "accountsDept.dateReceived", headerName: "Dt Recd in Accts Dept" },
    { field: "accountsDept.receivedBy", headerName: "Name Recd by Accts Dept" },
    {
      field: "accountsDept.returnedToPimo",
      headerName: "Dt Returned Back to PIMO",
    },

    // Additional fields
    { field: "remarks", headerName: "Remarks" },
    { field: "workflowState.currentState", headerName: "Status" },
  ];

  // Define role-specific column fields based on roles.md
  const roleSpecificFields = {
    SITE_OFFICER: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "ifPOCreated",
      "poNo",
      "poDt",
      "poAmt",
      "proformaInvNo",
      "proformaInvDt",
      "proformaInvAmt",
      "proformaInvRecdAtSite",
      "proformaInvRecdBy",
      "taxInvNo",
      "taxInvDt",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "department",
      "remarksBySiteTeam",
      "attachment",
      "dtGivenToQualityEngineer",
      "nameOfQualityEngineer",
      "dtGivenToQSForInspection",
      "nameOfQS",
      "checkedByQSWithDtOfMeasurement",
      "givenToVendorQueryFinalInv",
      "nameOfQS2",
      "dtGivenToQSForCOP",
      "nameQS",
      "copDt",
      "copAmt",
      "remarksByQSTeam",
      "dtGivenForMIGO",
      "migoNo",
      "migoDt",
      "migoAmt",
      "migoDoneBy",
      "dtInvReturnedToSiteOffice",
      "dtGivenToSiteEngineer",
      "nameOfSiteEngineer",
      "dtGivenToArchitect",
      "nameOfArchitect",
      "dtGivenSiteIncharge",
      "nameSiteIncharge",
      "remarks",
      "dtGivenToSiteOfficeForDispatch",
      "nameSiteOffice",
      "status",
      "dtGivenToPIMOMumbai",
      "dtRecdAtPIMOMumbai",
      "nameRecdByPIMOMumbai",
      "dtGivenToQSMumbai",
      "nameOfQSMumbai",
      "dtGivenToPIMOMumbai2",
      "namePIMO",
    ],

    QS_TEAM: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "ifPOCreated",
      "poNo",
      "poDt",
      "poAmt",
      "proformaInvNo",
      "proformaInvDt",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDt",
      "currency",
      "taxInvAmt",
      "remarksBySiteTeam",
      "dtGivenToQSForInspection",
      "nameOfQS",
      "checkedByQSWithDtOfMeasurement",
      "givenToVendorQueryFinalInv",
      "nameOfQS2",
      "dtGivenToQSForCOP",
      "nameQS",
      "copDt",
      "copAmt",
      "remarksByQSTeam",
      "remarks",
      "status",
      "dtGivenToPIMOMumbai",
      "namePIMO",
    ],

    PIMO_MUMBAI_MIGO_SES: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "ifPOCreated",
      "poNo",
      "poDt",
      "poAmt",
      "proformaInvNo",
      "proformaInvDt",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDt",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "remarksBySiteTeam",
      "dtGivenToQSForInspection",
      "checkedByQSWithDtOfMeasurement",
      "copDt",
      "copAmt",
      "remarksByQSTeam",
      "dtGivenForMIGO",
      "migoNo",
      "migoDt",
      "migoAmt",
      "migoDoneBy",
      "dtGivenToSiteOfficeForDispatch",
      "nameSiteOffice",
      "status",
      "dtGivenToPIMOMumbai",
      "dtRecdAtPIMOMumbai",
      "nameRecdByPIMOMumbai",
      "dtGivenToQSMumbai",
      "nameOfQSMumbai",
      "dtGivenToPIMOMumbai2",
      "dtGivenToITDept",
      "dtGivenToPIMOMumbai3",
      "nameGivenToPIMO",
      "sesNo",
      "sesAmt",
      "sesDt",
      "dtRecdFromITDeptt",
      "dtRecdFromPIMO",
      "dtRecdBackInPIMOAfterApproval",
      "remarksPIMOMumbai",
      "dtGivenToAcctsDept",
      "nameGivenByPIMOOffice",
    ],

    PIMO_MUMBAI_ADVANCE_FI: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "ifPOCreated",
      "poNo",
      "poDt",
      "poAmt",
      "proformaInvNo",
      "proformaInvDt",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDt",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "remarksBySiteTeam",
      "advanceDt",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "dtGivenToQualityEngineer",
      "nameOfQualityEngineer",
      "dtGivenToQSForInspection",
      "nameOfQS",
      "checkedByQSWithDtOfMeasurement",
      "givenToVendorQueryFinalInv",
      "nameOfQS2",
      "dtGivenToQSForCOP",
      "nameQS",
      "copDt",
      "copAmt",
      "dtGivenForMIGO",
      "migoNo",
      "migoDt",
      "migoAmt",
      "migoDoneBy",
      "dtInvReturnedToSiteOffice",
      "dtGivenToSiteEngineer",
      "nameOfSiteEngineer",
      "dtGivenToArchitect",
      "nameOfArchitect",
      "dtGivenSiteIncharge",
      "nameSiteIncharge",
      "remarks",
      "dtGivenToSiteOfficeForDispatch",
      "nameSiteOffice",
      "status",
      "dtGivenToPIMOMumbai",
      "dtRecdAtPIMOMumbai",
      "nameRecdByPIMOMumbai",
      "dtGivenToQSMumbai",
      "nameOfQSMumbai",
      "dtGivenToPIMOMumbai2",
      "dtGivenToITDept",
      "dtGivenToPIMOMumbai3",
      "nameGivenToPIMO",
      "sesNo",
      "sesAmt",
      "sesDt",
      "dtRecdFromITDeptt",
      "dtRecdFromPIMO",
      "dtRecdBackInPIMOAfterApproval",
      "remarksPIMOMumbai",
      "dtGivenToAcctsDept",
      "nameGivenByPIMOOffice",
      "dtRecdInAcctsDept",
      "dtReturnedBackToPIMO",
      "dtRecdBackInAcctsDept",
      "remarksForPayInstructions",
      "f110Identification",
      "dtOfPayment",
      "acctsIdentification",
      "paymentAmt",
      "paymentStatus",
    ],

    ACCOUNTS_TEAM: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "taxInvNo",
      "taxInvDt",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "department",
      "remarksBySiteTeam",
      "advanceDt",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "copAmt",
      "migoNo",
      "migoDt",
      "migoAmt",
      "migoDoneBy",
      "status",
      "dtGivenToPIMOMumbai",
      "dtRecdAtPIMOMumbai",
      "nameRecdByPIMOMumbai",
      "dtGivenToQSMumbai",
      "nameOfQSMumbai",
      "dtGivenToPIMOMumbai2",
      "sesNo",
      "sesAmt",
      "sesDt",
      "remarksPIMOMumbai",
      "dtGivenToAcctsDept",
      "nameGivenByPIMOOffice",
      "dtRecdInAcctsDept",
      "dtReturnedBackToPIMO",
      "dtRecdBackInAcctsDept",
      "paymentInstructions",
      "remarksForPayInstructions",
      "f110Identification",
      "dtOfPayment",
      "acctsIdentification",
      "paymentAmt",
      "remarksAcctsDept",
      "paymentStatus",
    ],

    DIRECTOR_TRUSTEE_ADVISOR: [
      "srNo",
      "srNoOld",
      "typeOfInv",
      "region",
      "projectDescription",
      "vendorNo",
      "vendorName",
      "gstNumber",
      "compliance206AB",
      "panStatus",
      "ifPOCreated",
      "poNo",
      "poDt",
      "poAmt",
      "proformaInvNo",
      "proformaInvDt",
      "proformaInvAmt",
      "taxInvNo",
      "taxInvDt",
      "currency",
      "taxInvAmt",
      "taxInvRecdAtSite",
      "taxInvRecdBy",
      "department",
      "remarksBySiteTeam",
      "advanceDt",
      "advanceAmt",
      "advancePercentage",
      "advRequestEnteredBy",
      "dtGivenToQualityEngineer",
      "nameOfQualityEngineer",
      "dtGivenToQSForInspection",
      "nameOfQS",
      "checkedByQSWithDtOfMeasurement",
      "nameOfQS2",
      "nameQS",
      "copAmt",
      "remarksByQSTeam",
      "migoNo",
      "migoDt",
      "migoAmt",
      "migoDoneBy",
      "dtGivenToSiteEngineer",
      "nameOfSiteEngineer",
      "dtGivenToArchitect",
      "nameOfArchitect",
      "dtGivenSiteIncharge",
      "nameSiteIncharge",
      "remarks",
      "dtGivenToSiteOfficeForDispatch",
      "nameSiteOffice",
      "status",
      "dtGivenToPIMOMumbai",
      "dtRecdAtPIMOMumbai",
      "nameRecdByPIMOMumbai",
      "dtGivenToQSMumbai",
      "nameOfQSMumbai",
      "dtGivenToPIMOMumbai2",
      "dtGivenToDirectorAdvisorTrusteeForApproval",
      "sesNo",
      "sesAmt",
      "sesDt",
      "remarksPIMOMumbai",
      "dtGivenToAcctsDept",
      "nameGivenByPIMOOffice",
      "paymentInstructions",
      "remarksForPayInstructions",
      "f110Identification",
      "dtOfPayment",
      "acctsIdentification",
      "paymentAmt",
      "remarksAcctsDept",
      "paymentStatus",
    ],

    ADMIN: allColumns.map((col) => col.field), // Admin sees all columns
  };

  // Look up field names in allColumns based on roleSpecificFields
  if (roleSpecificFields[role]) {
    return allColumns.filter((column) =>
      roleSpecificFields[role].includes(column.field)
    );
  }

  // Default to first 10 columns if role not found
  return allColumns.slice(0, 10);
};

const Reports = () => {
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState("taxInvDate"); // Default date field
  const [visibleColumnFields, setVisibleColumnFields] = useState([]); // Store visible column fields
  const dropdownRef = useRef(null);
  const columnSelectorRef = useRef(null);
  const [isSendBoxOpen, setIsSendBoxOpen] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Add pagination state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [pagesToShow, setPagesToShow] = useState(5);

  // Add validation state for download
  const [showDownloadValidation, setShowDownloadValidation] = useState(false);

  const roles = [
    { value: "Site_Officer", label: "Site Officer" },
    { value: "QS_Team", label: "QS Team" },
    {
      value: "PIMO_Mumbai_&_MIGO/SES_Team",
      label: "PIMO Mumbai & MIGO/SES Team",
    },
    {
      value: "PIMO_Mumbai_for_Advance_&_FI_Entry",
      label: "PIMO Mumbai for Advance & FI Entry",
    },
    { value: "Accounts_Team", label: "Accounts Team" },
    {
      value: "Trustee,_Advisor_&_Director",
      label: "Trustee, Advisor & Director",
    },
  ];

  const currentUserRole = localStorage.getItem("userRole");
  const availableRoles = roles.filter((role) => role.value !== currentUserRole);

  const handleSendTo = () => {
    setIsSendBoxOpen(true);
  };

  const handleSendToRole = (role) => {
    // If no rows selected, use all filtered data
    const billsToSend =
      selectedRows.length === 0
        ? filteredData.map((row) => row._id)
        : selectedRows;

    setSelectedRole(role);
    setSelectedRows(billsToSend);
    setIsWindowOpen(true);
    setIsSendBoxOpen(false);

    // Show toast notification with airplane animation
    toast.success(
      <div className="send-toast">
        <span className="send-toast-icon">
          <i className="fas fa-paper-plane"></i>
        </span>
        <span>Sending bills to {role.label}...</span>
      </div>,
      { autoClose: 2000 }
    );
  };

  useEffect(() => {
    if (localStorage.getItem("userRole") === null) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get(bills);
        const filteredData = response.data.filter((bill) => bill.copDetails);
        setBillsData(filteredData);
        console.log(response.data);
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
    fetchBills();
  }, []);

  // Prepare filter logic for the DataTable
  const uniqueRegions = [...new Set(billsData.map((bill) => bill.region))];

  // Date field options for filtering
  const dateFieldOptions = [
    { value: "taxInvDate", label: "Tax Invoice Date" },
    { value: "poDate", label: "PO Date" },
    { value: "proformaInvDate", label: "Proforma Invoice Date" },
    { value: "copDetails.copDate", label: "COP Date" },
    { value: "migoDate", label: "MIGO Date" },
    { value: "sesDate", label: "SES Date" },
    { value: "paymentDate", label: "Payment Date" },
  ];

  const isWithinDateRange = (row) => {
    if (!fromDate && !toDate) return true;

    let dateString;

    // Get the date based on selectedDateField
    if (selectedDateField.includes(".")) {
      // Handle nested fields
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

    // Set time to 00:00:00 to compare dates only
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

  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // Add this state

  // Update filteredData to include sorting
  const filteredData = useMemo(() => {
    let filtered = billsData
      .filter((row) =>
        Object.values(row).some(
          (value) =>
            value &&
            value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      .filter((row) =>
        selectedRegion.length === 0 ? true : selectedRegion.includes(row.region)
      )
      .filter(isWithinDateRange);

    // Apply sorting if sort config exists
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        // Get nested values if needed
        let aValue = sortConfig.key.includes(".")
          ? sortConfig.key.split(".").reduce((obj, key) => obj?.[key], a)
          : a[sortConfig.key];
        let bValue = sortConfig.key.includes(".")
          ? sortConfig.key.split(".").reduce((obj, key) => obj?.[key], b)
          : b[sortConfig.key];

        // Handle date sorting
        if (
          sortConfig.key.toLowerCase().includes("date") ||
          sortConfig.key.toLowerCase().includes("dt")
        ) {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        // Handle numeric sorting
        else if (typeof aValue === "number" && typeof bValue === "number") {
          // Keep as is, will be compared numerically
        }
        // Handle string sorting
        else {
          aValue = String(aValue || "").toLowerCase();
          bValue = String(bValue || "").toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply additional sorting from dropdown if needed
    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "amount") {
          return (
            parseFloat(a.copDetails?.copAmount || a.copDetails?.amount || "0") -
            parseFloat(b.copDetails?.copAmount || b.copDetails?.amount || "0")
          );
        } else if (sortBy === "status") {
          return (a.accountsDept?.status || "").localeCompare(
            b.accountsDept?.status || ""
          );
        } else if (sortBy === "date") {
          return new Date(a.taxInvDate || 0) - new Date(b.taxInvDate || 0);
        }
        return 0;
      });
    }

    return filtered;
  }, [billsData, searchQuery, selectedRegion, sortConfig, sortBy]);

  useEffect(() => {
    if (selectAll) {
      setSelectedRows(filteredData.map((row) => row._id));
    }
  }, [filteredData, selectAll]);

  // Handlers for the DataTable component
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedRows(selectAll ? [] : filteredData.map((row) => row._id));
  };

  const handleSelectRow = (selectedIds) => {
    setSelectedRows(selectedIds);
  };

  const handleDownloadReport = async () => {
    try {
      // Determine which data to export
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

      // Essential columns to always include in correct order
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

      // Get essential columns first in the specified order
      const essentialColumns = essentialFields
        .map((field) => columns.find((col) => col.field === field))
        .filter((col) => col !== undefined);

      // Get additional visible columns (excluding those already in essential columns)
      const additionalColumns = columns.filter(
        (col) =>
          visibleColumnFields.includes(col.field) &&
          col.field !== "srNoOld" &&
          !essentialFields.includes(col.field)
      );

      // Combine essential columns with additional columns
      const allColumnsToExport = [...essentialColumns, ...additionalColumns];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();

      // Format data for Excel
      const excelData = dataToExport.map((row) => {
        const formattedRow = {};

        allColumnsToExport.forEach((column) => {
          // Get the value based on the field name
          let value;
          if (column.field.includes(".")) {
            const [parentField, childField] = column.field.split(".");
            value = row[parentField] ? row[parentField][childField] : "";
          } else {
            value = row[column.field];
          }

          // Format date values
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

          // Use header name from column definition as the key
          formattedRow[column.headerName] =
            value !== undefined && value !== null ? value : "";
        });

        return formattedRow;
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Get column range for styling
      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      // Set column widths based on content
      const colWidths = {};
      Object.keys(excelData[0] || {}).forEach((key, index) => {
        // Set minimum width of 15 characters, but expand based on header length
        colWidths[index] = Math.max(key.length * 1.5, 15);
      });

      // Apply column widths
      worksheet["!cols"] = Object.keys(colWidths).map((col) => ({
        wch: colWidths[col],
      }));

      // Style headers with bold text, background color, and borders
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;

        // Create style for header
        worksheet[cellAddress].s = {
          font: {
            bold: true,
            color: { rgb: "FFFFFF" },
            sz: 12,
          },
          fill: {
            fgColor: { rgb: "0172C2" }, // Blue color matching app theme
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

      // Increase row height for header
      worksheet["!rows"] = [{ hpt: 30 }]; // Set header row height to 30 points

      // Add light borders to all cells
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

          // Special formatting for numeric fields like amounts
          if (col >= 0 && typeof worksheet[cellAddress].v === "number") {
            worksheet[cellAddress].s.alignment = { horizontal: "right" };
            worksheet[cellAddress].s.numFmt = "#,##0.00"; // Add thousand separators and 2 decimal places
          }
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bills Report");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "BillsReport.xlsx");
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
    // Implement edit functionality if needed
    console.log("Edit row:", row);
    // You can redirect to edit page or open modal
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRegion("");
    setSortBy("");
    setFromDate("");
    setToDate("");
    setSelectedDateField("taxInvDate");
    setIsFilterPopupOpen(false);
  };

  // Get the column definitions based on user role
  const columns = useMemo(() => {
    // Convert role from format in localStorage to format expected by getColumnsForRole
    let roleForColumns = currentUserRole;

    if (currentUserRole === "Site_Officer") {
      roleForColumns = "SITE_OFFICER";
    } else if (currentUserRole === "QS_Team") {
      roleForColumns = "QS_TEAM";
    } else if (currentUserRole === "PIMO_Mumbai_&_MIGO/SES_Team") {
      roleForColumns = "PIMO_MUMBAI_MIGO_SES";
    } else if (currentUserRole === "PIMO_Mumbai_for_Advance_&_FI_Entry") {
      roleForColumns = "PIMO_MUMBAI_ADVANCE_FI";
    } else if (currentUserRole === "Accounts_Team") {
      roleForColumns = "ACCOUNTS_TEAM";
    } else if (currentUserRole === "Trustee,_Advisor_&_Director") {
      roleForColumns = "DIRECTOR_TRUSTEE_ADVISOR";
    } else {
      roleForColumns = "ADMIN"; // Default to admin if role is unknown
    }

    return getColumnsForRole(roleForColumns);
  }, [currentUserRole]);

  // Set initial visible columns when columns are loaded
  useEffect(() => {
    if (columns.length > 0) {
      // Exclude 'srNoOld' from initial visible columns
      const initialColumns = columns
        .filter((col) => col.field !== "srNoOld")
        .slice(0, 10)
        .map((col) => col.field);
      setVisibleColumnFields(initialColumns);
    }
  }, [columns]);

  // Toggle column visibility
  const toggleColumnVisibility = (field) => {
    setVisibleColumnFields((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  // Toggle all columns
  const toggleAllColumns = () => {
    const filteredColumns = columns.filter((col) => col.field !== "srNoOld");
    if (visibleColumnFields.length === filteredColumns.length) {
      // If all columns are visible, hide all except the first column
      setVisibleColumnFields([filteredColumns[0].field]);
    } else {
      // Otherwise, show all columns
      setVisibleColumnFields(filteredColumns.map((col) => col.field));
    }
  };

  // Handle click outside column dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the dropdown AND the trigger button
      if (
        columnSelectorRef.current &&
        !columnSelectorRef.current.contains(event.target) &&
        !event.target.closest(".column-list-trigger")
      ) {
        // Add a class to your trigger button
        setIsColumnDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  // Generate array of page numbers to display
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

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Add proper filter popup content
  const FilterPopup = () => (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsFilterPopupOpen(false);
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Filter Options
          </h2>
          <button
            onClick={() => setIsFilterPopupOpen(false)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Date Field Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Date Field
            </label>
            <select
              value={selectedDateField}
              onChange={(e) => setSelectedDateField(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {dateFieldOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Regions</option>
              {uniqueRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">None</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Clear Filters
          </button>
          <button
            onClick={() => setIsFilterPopupOpen(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  // Add Column List Dropdown content
  const ColumnListDropdown = () => (
    <div
      className="fixed mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-[200]"
      style={{
        top: columnSelectorRef.current?.getBoundingClientRect().bottom + 5,
        left: columnSelectorRef.current?.getBoundingClientRect().left,
      }}
      onClick={(e) => e.stopPropagation()} // Add this to prevent click propagation
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={
              visibleColumnFields.length ===
              columns.filter((col) => col.field !== "srNoOld").length
            }
            onChange={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              toggleAllColumns();
            }}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium">Toggle All Columns</span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-2">
        {columns
          .filter((col) => col.field !== "srNoOld")
          .map((column) => (
            <div key={column.field} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={visibleColumnFields.includes(column.field)}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  toggleColumnVisibility(column.field);
                }}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">{column.headerName}</span>
            </div>
          ))}
      </div>
    </div>
  );

  const handleSort = (field) => {
    setSortConfig((current) => {
      if (current.key === field) {
        if (current.direction === "asc")
          return { key: field, direction: "desc" };
        if (current.direction === "desc") return { key: null, direction: null };
      }
      return { key: field, direction: "asc" };
    });
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-hidden relative">
        {" "}
        {/* Added relative positioning */}
        <div className="h-full bg-white rounded-lg shadow-sm p-5 flex flex-col">
          {/* Search and Controls - Fixed Height */}
          <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-4 pb-4">
            <div className="flex-1 max-w-md relative z-30">
              {" "}
              {/* Increased z-index */}
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsFilterPopupOpen(true)}
                title="Filter Options"
              >
                <Funnel size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 z-30">
              {" "}
              {/* Increased z-index */}
              <div className="relative" ref={columnSelectorRef}>
                <button
                  className="column-list-trigger px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-50"
                  onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                >
                  <Grid3x3 size={16} />
                  <span>Column List</span>
                </button>

                {/* Render Column List Dropdown */}
                {isColumnDropdownOpen && <ColumnListDropdown />}
              </div>
              <button
                className={`px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-green-700 ${
                  showDownloadValidation ? "animate-shake border-red-400" : ""
                }`}
                onClick={handleDownloadReport}
              >
                <Download size={16} />
                <span>Export</span>
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
                onClick={handleSendTo}
              >
                <Send size={16} />
                <span>Send To</span>
              </button>
            </div>
          </div>

          {/* Table Container - Fills Remaining Space */}
          <div className="flex-1 min-h-0 border border-gray-200 rounded-md flex flex-col relative z-20">
            {" "}
            {/* Added relative and z-index */}
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg text-gray-600 font-semibold">
                  Loading data...
                </p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg text-red-600 font-semibold">{error}</p>
              </div>
            ) : (
              <>
                {/* Scrollable Table Area */}
                <div className="flex-1 min-h-0 overflow-auto">
                  <DataTable
                    data={paginatedData}
                    allData={filteredData} // Add this prop
                    defaultColumns={columns.slice(0, 10)}
                    availableColumns={columns.filter(
                      (col) => col.field !== "srNoOld"
                    )}
                    visibleColumnFields={visibleColumnFields}
                    onEdit={handleEditRow}
                    onRowSelect={handleSelectRow}
                    onSort={handleSort} // Add this prop
                    sortConfig={sortConfig} // Add this prop
                  />
                </div>

                {/* Pagination - Fixed Height */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={30}>30 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </button>
                    <button
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        className={`px-3 py-2 border rounded-md text-sm ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                    <button
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
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
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                    of {filteredData.length} entries
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter Popup - Higher z-index */}
      {isFilterPopupOpen && <FilterPopup />}

      {/* Column Dropdown - Higher z-index */}
      {isColumnDropdownOpen && (
        <div
          ref={columnSelectorRef}
          className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          style={{
            top: columnSelectorRef.current?.getBoundingClientRect().bottom,
            right: "20px",
          }}
        >
          {/* ...existing column dropdown content... */}
        </div>
      )}

      {/* ...existing modals and popups... */}
    </div>
  );
};

export default Reports;
