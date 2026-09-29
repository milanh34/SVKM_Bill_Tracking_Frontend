import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { getFilteredBills, bills, receiveBills, notReceivedPimo, notReceivedAccounts } from "../apis/bills.api";
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
  X,
  Trash2,
  RotateCcw
} from "lucide-react";
import search from "../assets/search.svg";
import { getColumnsForRole } from "../utils/columnView";
import { FilterModal } from "../components/dashboard/FilterModal";
import {
  BILL_AMOUNT_FIELDS,
  getFieldValue,
  inAmountRange,
  inDateRange,
  pickFieldOptions,
  sortedRegions,
} from "../utils/rangeFilter";
import { SendToModal } from "../components/dashboard/SendToModal";
import { UpdateBillModal } from "../components/UpdateBillModal";
import { SendBoxModal } from "../components/dashboard/SendBoxModal";
import Loader from "../components/Loader";
import Cookies from "js-cookie";
import { handleExportReport } from "../utils/exportExcelDashboard";
import { printBills } from "../utils/printBills";
import { RemoveDateModal } from "../components/dashboard/RemoveDateModal";

/** Teams that have an Incoming tab. Mirrors ROLES_WITH_INCOMING on the server. */
const ROLES_WITH_INCOMING = ["site_pimo", "pimo_mumbai", "accounts"];

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
  const [gridResetKey, setGridResetKey] = useState(0);
  const [columnFiltersActive, setColumnFiltersActive] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState("taxInvDate");
  // Amount column and min/max for the global filter (29.09, item 14).
  const [selectedAmountField, setSelectedAmountField] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [visibleColumnFields, setVisibleColumnFields] = useState([]);
  const columnSelectorRef = useRef(null);
  const [isSendBoxOpen, setIsSendBoxOpen] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isRemoveDateOpen, setIsRemoveDateOpen] = useState(false);
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
  const [countOfSelectedBills, setCountOfSelectedBills] = useState(0);

  const navigate = useNavigate();

  const handleChecklist = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select bills to proceed");
      return;
    }

    const selectedBills = billsData.filter((bill) => selectedRows.includes(bill._id));

    const getRoute = (bill) => {
      if (bill.natureOfWork === "Direct FI Entry") return "/checklist-directFI2";
      if (bill.natureOfWork === "Advance/LC/BG") return "/checklist-advance2";
      if (currentUserRole === "site_officer" || currentUserRole === "site_pimo") return "/checklist-bill-journey";
      if (currentUserRole === "accounts") return "/checklist-account2";
      return null;
    };

    const routesSet = new Set(selectedBills.map(getRoute));

    if (routesSet.has(null)) {
      toast.error("You don't have access to checklists for some of the selected bills.");
      return;
    }

    if (routesSet.size > 1) {
      toast.error("Selected bills belong to different checklist types. Please select bills of the same checklist type.");
      return;
    }

    const targetRoute = Array.from(routesSet)[0];

    navigate(targetRoute, {
      state: {
        selectedRows,
        bills: selectedBills,
      },
    });
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
      { value: "site_dispatch_team", label: "Site Trustee/LPC" }, // 29.09 item 17 - label only
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
    accounts: [{ value: "booking_checking", label: "Booking & Checking" }],
  };

  /**
   * Which Send-to options a QS user may pick, for one bill.
   *
   * Replaces a single test on column 64 (29.09, item 20):
   *
   *   col 35 filled, col 38 blank, Status Hold    -> Ret to Site Team aft measure
   *   col 40 filled, col 44A blank, Status Hold   -> Ret to Site Team aft COP
   *   col 64 filled, col 66 blank, Status Accept  -> Ret to PIMO Team aft COP
   *
   * The old rule offered both Site returns whenever column 64 was blank, even
   * for a bill that had never been to QS for measurement.
   */
  const qsOptionsFor = (bill) => {
    const allowed = [];
    const hold = bill?.siteStatus === "hold";
    const accepted = bill?.siteStatus === "accept";

    if (hold && bill?.qsInspection?.dateGiven && !bill?.vendorFinalInv?.dateGiven) {
      allowed.push("measure"); // 35 filled, 38 blank
    }
    if (hold && bill?.qsCOP?.dateGiven && !bill?.copDetails?.dateReturned) {
      allowed.push("site_cop"); // 40 filled, 44A blank
    }
    if (accepted && bill?.qsMumbai?.dateGiven && !bill?.pimoMumbai?.dateReturnedFromQs) {
      allowed.push("pimo_cop"); // 64 filled, 66 blank
    }
    return allowed;
  };

  /** The options common to every selected bill. */
  const qsOptionsForSelection = (selectedBills) => {
    if (selectedBills.length === 0) return [];
    return selectedBills
      .map(qsOptionsFor)
      .reduce((shared, next) => shared.filter((v) => next.includes(v)));
  };

  const handleSendTo = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select bills to proceed");
      return;
    }

    let availableRoles = [...roleWorkflow[currentUserRole] || []];

    if (currentUserRole === "qs_site") {
      const selectedBills = billsData.filter(bill => selectedRows.includes(bill._id));

      setCountOfSelectedBills(selectedBills.length);

      const shared = qsOptionsForSelection(selectedBills);
      if (shared.length === 0) {
        toast.error(
          "These bills are not at the same stage, so there is no send that applies to all of them. Select bills at one stage."
        );
        return;
      }

      availableRoles = availableRoles.filter(role => shared.includes(role.value));
    }

    if (!availableRoles || availableRoles.length === 0) {
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
      const promises = selectedRows.map(async (billId) =>
        await axios.post(
          receiveBills,
          { billId, role: currentUserRole },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      const response = await Promise.all(promises);
      toast.success("Bills marked as received successfully");

      let allBills = [];

      for (let i = 0; i < response.length; i++) {
        allBills.push(response[i].data.bill)
      }

      console.log("THESE ARE ALL BILLS: ", allBills);

      // Account dept: open checklist when bill marked as recieved
      if (currentUserRole === 'accounts' && showIncomingBills) {
        const selectedBills = billsData.filter((bill) => selectedRows?.includes(bill._id));

        // Advance and Direct FI entries have their own checklists, so they are
        // not part of the Accounts checklist. Previously a single such bill
        // anywhere in the selection suppressed the checklist for ALL of them -
        // "when we accept bills along with Advances and Direct FI entry,
        // checklist not opened for printing" (observations, C-05).
        // Now they are set aside and the checklist opens for the rest.
        const NO_ACCOUNTS_CHECKLIST = ["Advance/LC/BG", "Direct FI Entry"];
        const forChecklist = selectedBills.filter(
          (bill) => !NO_ACCOUNTS_CHECKLIST.includes(bill.natureOfWork)
        );

        if (forChecklist.length > 0) {
          navigate("/checklist-account2", {
            state: {
              selectedRows: forChecklist.map((bill) => bill._id),
              bills: forChecklist,
            },
          });
          return;
        }
      }

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
    // return bills.filter((bill) => {
    //   const currentCount = bill?.currentCount || 0;

    //   switch (userRole) {
    //     case "site_officer":
    //       return currentCount === 1;

    //     case "site_pimo":
    //       return currentCount === 3;

    //     // case "pimo_mumbai":
    //     //   return currentCount === 3;

    //     case "qs_site":
    //       return currentCount === 2;

    //     case "director":
    //       return currentCount === 4;

    //     case "accounts":
    //       return currentCount === 5 && bill.accountsDept.paymentDate === null;

    //     case "admin":
    //       return true;

    //     default:
    //       return false;
    //   }
    // });
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
        axios.get(getFilteredBills, {
          headers,
          params: { role: currentUserRole }  // Change from query string to params
        }),
        axios.get(natureOfWorks, { headers }),
        axios.get(currencies, { headers }),
        axios.get(vendors, { headers }),
        axios.get(user, { headers }),
      ]);

      // const filteredBills = filterBillsByRole(billsResponse.data, currentUserRole);
      // const sortedData = sortBillsByRole(filteredBills, currentUserRole);
      const sortedNatureOfWork = natureOfWorksRes.data.sort((a, b) => {
        return String(a.natureOfWork).localeCompare(String(b.natureOfWork), undefined, { sensitivity: 'base' });
      })

      const sortedRegions = userRes.data?.data?.region.sort((a, b) => {
        return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
      })

      setBillsData(billsResponse.data);
      setRegionOptions(sortedRegions || []);
      setNatureOfWorkOptions(sortedNatureOfWork || []);
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

  // Amount columns the role's grid has, for the global filter (29.09, item 14).
  const amountFieldOptions = useMemo(
    () => pickFieldOptions(columns, BILL_AMOUNT_FIELDS),
    [columns]
  );
  const activeAmountField = selectedAmountField || amountFieldOptions[0]?.value || "";
  const amountActive = !!activeAmountField && (minAmount !== "" || maxAmount !== "");

  // Sorted, blanks dropped, for the region checklist (29.09, item 14).
  const uniqueRegions = useMemo(() => sortedRegions(billsData), [billsData]);

  const dateFieldOptions = [
    { value: "taxInvDate", label: "Tax Invoice Date" },
    { value: "poDate", label: "PO Date" },
    { value: "proformaInvDate", label: "Proforma Invoice Date" },
    { value: "copDetails.date", label: "COP Date" },
    { value: "advanceDate", label: "Advance Date" },
    { value: "migoDetails.date", label: "MIGO Date" },
    { value: "accountsDept.paymentDate", label: "Payment Date" },
  ];

  // Either bound alone works and both cover the whole day; a bill with no
  // date in the chosen column drops out once a bound is set (29.09, item 14).
  const isWithinDateRange = (row) =>
    inDateRange(getFieldValue(row, selectedDateField), fromDate, toDate);

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


  /**
   * Split the response into Home and Incoming.
   *
   * The server answers /bill/get-filtered-bills with Home UNION Incoming so
   * the two tabs can be switched without a round trip. The split has to use
   * the same test the server does (utils/tab-predicates.js), or a bill lands
   * on both tabs or neither:
   *
   *   PIMO      Incoming = col 61 filled AND col 62 blank
   *   Accounts  Incoming = col 80 filled AND col 82 blank
   *
   * The old test for PIMO Home was
   *   (markReceived === true && dateReceived) || siteStatus === "accept"
   * which put every accepted bill on Home even while it was still sitting on
   * Incoming, and dropped a received bill whose markReceived flag was never
   * written - which is every bill created at PIMO, where col 62 is stamped
   * at creation (observations G-07).
   */
  const isIncomingFor = (bill, role) => {
    if (role === "site_pimo" || role === "pimo_mumbai") {
      return Boolean(bill.pimoMumbai?.dateGiven) && !bill.pimoMumbai?.dateReceived;
    }
    if (role === "accounts") {
      return Boolean(bill.accountsDept?.dateGiven) && !bill.accountsDept?.dateReceived;
    }
    return false;
  };

  const filteredData = useMemo(() => {
    let result = billsData;

    if (ROLES_WITH_INCOMING.includes(currentUserRole)) {
      result = result.filter((bill) =>
        showIncomingBills
          ? isIncomingFor(bill, currentUserRole)
          : !isIncomingFor(bill, currentUserRole)
      );
    }

    if (selectedRegion.length > 0) {
      result = result.filter((row) => selectedRegion.includes(row.region));
    }
    result = result.filter(isWithinDateRange);
    if (amountActive) {
      result = result.filter((row) =>
        inAmountRange(getFieldValue(row, activeAmountField), minAmount, maxAmount)
      );
    }

    // Ordering is DataTable's job: it applies the tab's default sort column
    // (col 61 for PIMO Incoming, col 80 for Accounts Incoming) with Sr no as
    // the tiebreaker, and the user's own column sort on top. Sorting here as
    // well mutated billsData in place, because `result` is still the same
    // array whenever no filter has narrowed it.

    return result;
  }, [
    billsData,
    selectedRegion,
    isWithinDateRange,
    amountActive,
    activeAmountField,
    minAmount,
    maxAmount,
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

  // Any filter on - the global one or a column's - turns the icon green
  // (29.09, item 13), so a filtered screen cannot pass for the whole list.
  const filtersActive =
    selectedRegion.length > 0 ||
    !!fromDate ||
    !!toDate ||
    amountActive ||
    columnFiltersActive;

  // Reset puts the screen back as it opens: sort, search, global filter and
  // column filters all cleared (29.09, item 21).
  const handleResetView = () => {
    setSortConfig({ key: null, direction: null });
    setSearchQuery("");
    setSelectedRegion([]);
    setFromDate("");
    setToDate("");
    setSelectedDateField("taxInvDate");
    setSelectedAmountField("");
    setMinAmount("");
    setMaxAmount("");
    setGridResetKey((k) => k + 1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRegion([]);
    setSortBy("");
    setFromDate("");
    setToDate("");
    setSelectedDateField("taxInvDate");
    setSelectedAmountField("");
    setMinAmount("");
    setMaxAmount("");
    setIsFilterPopupOpen(false);
  };

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

  const showIncomingBillsButton = ["accounts", "site_pimo",].includes(
    currentUserRole
  );
  const isTrusteeAdvisorDirectorLogin = ["director", "trustee", "advisor"].includes(currentUserRole);

  const handlePrint = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to print");
      return;
    }

    const selectedData = filteredData.filter(row => selectedRows.includes(row._id));

    const visibleColumns = columns.filter(col =>
      visibleColumnFields.includes(col.field) && col.field !== "srNoOld"
    );

    printBills({ selectedData, visibleColumns, role: currentUserRole });
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
                  className={`p-1.5 rounded-md transition-colors border hover:cursor-pointer ${filtersActive
                    ? "text-white bg-green-600 border-green-700 hover:bg-green-700"
                    : "text-gray-600 border-gray-400 hover:bg-gray-100"
                    }`}
                  onClick={() => setIsFilterPopupOpen(true)}
                  title={filtersActive ? "Filter Options (a filter is applied)" : "Filter Options"}
                >
                  <Funnel className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-400 hover:cursor-pointer"
                  onClick={handleResetView}
                  title="Reset sorting, search and filters"
                >
                  <RotateCcw className="w-4 h-4" />
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
                ) &&
                  !showIncomingBills && (
                    <button
                      className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={handleChecklist}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Checklist</span>
                    </button>
                  )}

                {!showIncomingBills && currentUserRole !== "director" && (
                  <button
                    className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-white text-sm bg-[#011a99] border border-gray-300 rounded-md hover:bg-blue-800 transition-colors"
                    onClick={() => setOpenUpdateBillModal(true)}
                  >
                    <EditIcon className="w-4 h-4 mr-1" />
                    Mass Update
                  </button>
                )}

                {/* The Trustee gets Print too (29.09, item 4). */}
                {!showIncomingBills && (
                  <button
                    className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-white text-sm bg-yellow-600 border border-gray-300 rounded-md hover:bg-yellow-700 transition-colors"
                    onClick={handlePrint}
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                )}

                {/* {currentUserRole === "accounts" && (
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
                )} */}

                <div className="relative" ref={columnSelectorRef}>
                  <button
                    className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setIsColumnDropdownOpen(!isColumnDropdownOpen)
                    }
                  >
                    {/* Yellow, at her request (29.09, item 6). */}
                    <Grid3x3 className="w-4 h-4 text-[#F48D02]" />
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

                {!showIncomingBills && (
                  <button
                    className={`inline-flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${showDownloadValidation
                      ? "animate-shake border-2 border-red-500"
                      : ""
                      }`}
                    onClick={handleDownloadReport}
                    title={
                      selectedRows.length === 0
                        ? "Select rows to export"
                        : "Export Excel Report"
                    }
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}

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
                  <>
                    {/* The Trustee gets Unsend, clearing column 78 (29.09, item 11). */}
                    {!showIncomingBills && (
                      <button
                        className="flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        onClick={() => {
                          if (selectedRows.length === 0) {
                            toast.error("Please select bills to proceed");
                            return;
                          }

                          if (currentUserRole === "qs_site") {
                            // Unsend offers whatever Send offered, so the two
                            // cannot disagree about what stage a bill is at.
                            const selectedBills = billsData.filter(bill => selectedRows.includes(bill._id));
                            const shared = qsOptionsForSelection(selectedBills);

                            if (shared.length === 0) {
                              toast.error(
                                "These bills are not at the same stage, so there is nothing common to unsend."
                              );
                              return;
                            }
                          }

                          setIsRemoveDateOpen(true);
                        }}
                        title="Unsend"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Unsend</span>
                      </button>
                    )}
                    <button
                      className={`flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors ${selectedRole
                        ? "relative after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-green-500 after:rounded-full"
                        : ""
                        }`}
                      onClick={handleSendTo}
                      title="Send / Unreceive"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send/Unreceive</span>
                    </button>
                  </>
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
                    resetKey={gridResetKey}
                    onColumnFiltersActiveChange={setColumnFiltersActive}
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
                    setSortConfig={setSortConfig}
                    onSort={handleSort}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onPaginatedDataChange={setTotalFilteredItems}
                    currentUserRole={currentUserRole}
                    activeTab={showIncomingBills ? "incoming" : "home"}
                    regionOptions={regionOptions}
                    natureOfWorkOptions={natureOfWorkOptions}
                    currencyOptions={currencyOptions}
                    vendorOptions={vendorOptions}
                    showActions={!showIncomingBills}
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
                          className={`px-2.5 py-1.5 text-sm hover:cursor-pointer border rounded-md transition-colors ${currentPage === pageNumber
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
        setSelectedRegion={setSelectedRegion}
        selectedDateField={selectedDateField}
        setSelectedDateField={setSelectedDateField}
        dateFieldOptions={dateFieldOptions}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        amountFieldOptions={amountFieldOptions}
        selectedAmountField={activeAmountField}
        setSelectedAmountField={setSelectedAmountField}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        maxAmount={maxAmount}
        setMaxAmount={setMaxAmount}
        handleClearFilters={handleClearFilters}
      />

      <SendToModal
        isOpen={isSendBoxOpen}
        onClose={() => setIsSendBoxOpen(false)}
        availableRoles={currentUserRole === "qs_site"
          ? roleWorkflow[currentUserRole].filter(role => {
            const selectedBills = billsData.filter(bill => selectedRows.includes(bill._id));
            const qsMumbaiDateFilled = selectedBills.some(bill => bill.qsMumbai?.dateGiven);
            return qsMumbaiDateFilled
              ? role.value === "pimo_cop"
              : ["measure", "site_cop"].includes(role.value);
          })
          : roleWorkflow[currentUserRole] || []
        }
        handleSendToRole={handleSendToRole}
        role={currentUserRole}
        handleNotReceiveBills={handleNotReceiveBills}
        countOfSelectedBills={selectedRows.length}
      />

      <RemoveDateModal
        isOpen={isRemoveDateOpen}
        onClose={() => setIsRemoveDateOpen(false)}
        availableRoles={currentUserRole === "qs_site"
          ? roleWorkflow[currentUserRole].filter(role => {
            const selectedBills = billsData.filter(bill => selectedRows.includes(bill._id));
            const qsMumbaiDateFilled = selectedBills.some(bill => bill.qsMumbai?.dateGiven);
            return qsMumbaiDateFilled
              ? role.value === "pimo_cop"
              : ["measure", "site_cop"].includes(role.value);
          })
          : roleWorkflow[currentUserRole] || []
        }
        role={currentUserRole}
        selectedRows={selectedRows}
        billsData={billsData}
        fetchAllData={fetchAllData}
      />

      {isWindowOpen && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-[1000]">
          <SendBoxModal
            closeWindow={() => {
              setIsWindowOpen(false);
              setSelectedRole(null);
              setSelectedRows([]);
              setSelectAll(false);
            }}
            selectedBills={selectedRows}
            billsData={filteredData.filter((bill) =>
              selectedRows.includes(bill._id)
            )}
            singleRole={selectedRole}
            fetchAllData={fetchAllData}
            availableRoles={currentUserRole === "qs_site"
              ? roleWorkflow[currentUserRole].filter(role => {
                const selectedBills = billsData.filter(bill => selectedRows.includes(bill._id));
                const qsMumbaiDateFilled = selectedBills.some(bill => bill.qsMumbai?.dateGiven);
                return qsMumbaiDateFilled
                  ? role.value === "pimo_cop"
                  : ["measure", "site_cop"].includes(role.value);
              })
              : roleWorkflow[currentUserRole] || []
            }
            countOfSelectedBills={countOfSelectedBills}
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
