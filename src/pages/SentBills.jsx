import React, { useState, useRef, useEffect, useMemo } from "react";
import Header from "../components/Header";
import axios from "axios";
import { sentBills, rejectPayment } from "../apis/bills.api";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import DataTable from "../components/DataTable";
// import DataTable from "../components/dashboard/DataTable";
import { Funnel, Grid3x3, Download, X, AlertTriangle, ArrowLeftFromLine, ArrowRightFromLine, RotateCcw, Printer } from "lucide-react";
import { printBills } from "../utils/printBills";
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
import { handleExportReport } from "../utils/exportExcelDashboard";
import Loader from "../components/Loader";
import Cookies from "js-cookie";

const SentBills = () => {
  const currentUserRole = Cookies.get("userRole");
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridResetKey, setGridResetKey] = useState(0);
  const [columnFiltersActive, setColumnFiltersActive] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedRegion, setSelectedRegion] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [selectedDateField, setSelectedDateField] = useState(
    "accountsDept.paymentDate"
  );
  // Amount column and min/max for the global filter (29.09, item 14).
  const [selectedAmountField, setSelectedAmountField] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [visibleColumnFields, setVisibleColumnFields] = useState([]);
  const columnSelectorRef = useRef(null);
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const rowsPerPageOptions = [10, 20, 30, 50, 100];
  const [columnSearchQuery, setColumnSearchQuery] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Fetch
  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${sentBills}/${currentUserRole}`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      setBillsData(response.data?.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch sent bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegion, fromDate, toDate, minAmount, maxAmount, itemsPerPage]);

  // Columns
  const columns = useMemo(() => {
    let roleForColumns;
    switch (currentUserRole) {
      case "site_officer":
        roleForColumns = "SITE_OFFICER";
        break;
      case "accounts":
        roleForColumns = "ACCOUNTS_TEAM";
        break;
      case "director":
        roleForColumns = "DIRECTOR_TRUSTEE_ADVISOR";
        break;
      // QS had no case here, so it fell through to the PIMO list and the
      // forwarded tab showed 98 columns against a 45-column requirement.
      // (observations, Teamwise QS-1)
      case "qs_site":
        roleForColumns = "QS_TEAM";
        break;
      case "site_pimo":
      case "pimo_mumbai":
      default:
        roleForColumns = "PIMO_MUMBAI_MIGO_SES";
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

  useEffect(() => {
    if (columns.length > 0) {
      setVisibleColumnFields(columns.slice(0, 12).map((col) => col.field));
    }
  }, [columns]);

  // Filtering
  //
  // The free-text search deliberately does NOT happen here. DataTable
  // applies it too, over the value as it is DISPLAYED, and running both
  // meant a term had to satisfy two different rules at once: typing a date
  // the way the grid prints it ("12-07-2026") passed the grid's filter and
  // failed this one, and typing it the way it is stored did the reverse.
  // Either way the tab came back empty, which is what "column search not
  // working on Forwarded" was (observations, Sorting R10).
  const getFilteredData = () => {
    return billsData.filter((bill) => {
      const matchesRegion =
        selectedRegion.length === 0 || selectedRegion.includes(bill.region);

      // Whole days, either bound alone; the old check compared the "to"
      // date at midnight, which dropped bills paid later that day
      // (29.09, item 14).
      const matchesDateRange = inDateRange(
        getFieldValue(bill, selectedDateField),
        fromDate,
        toDate
      );

      const matchesAmountRange =
        !amountActive ||
        inAmountRange(getFieldValue(bill, activeAmountField), minAmount, maxAmount);

      return matchesRegion && matchesDateRange && matchesAmountRange;
    });
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

  // Pagination
  const filteredUnpaginatedData = useMemo(() => {
    let data = getFilteredData();
    return data;
  }, [
    billsData,
    selectedRegion,
    fromDate,
    toDate,
    selectedDateField,
    amountActive,
    activeAmountField,
    minAmount,
    maxAmount,
    // sortConfig, // removed since backend handles it
  ]);

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return filteredUnpaginatedData.slice(startIdx, endIdx);
  }, [filteredUnpaginatedData, currentPage, itemsPerPage]);

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery, selectedRegion, fromDate, toDate, itemsPerPage, sortConfig, selectedDateField]);

  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  // Pagination range (dots, 1 ... n ...)
  const getPaginationRange = () => {
    const delta = 2;
    let range = [];
    range.push(1);
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);
    if (start > 2) range.push("...");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  // Column Visibility
  const toggleColumnVisibility = (field) => {
    setVisibleColumnFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };
  const toggleAllColumns = () => {
    if (visibleColumnFields.length === columns.length) {
      setVisibleColumnFields([]);
    } else {
      setVisibleColumnFields(columns.map((col) => col.field));
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

  // Select
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    // The grid, not this page, holds the column filters, so select-all
    // follows the whole filtered set rather than this page's own slice.
    setSelectedRows(
      e.target.checked ? filteredUnpaginatedData.map((row) => row._id) : []
    );
  };

  // Export Excel
  // const handleExportExcel = () => {
  //   const exportData = getFilteredData();
  //   const worksheet = XLSX.utils.json_to_sheet(
  //     exportData.map((item) => {
  //       const row = {};
  //       visibleColumnFields.forEach((field) => {
  //         const column = columns.find((col) => col.field === field);
  //         if (column) {
  //           const path = field.split(".");
  //           let value = item;
  //           for (const key of path) value = value?.[key];
  //           row[column.headerName] = value !== undefined ? value : "";
  //         }
  //       });
  //       return row;
  //     })
  //   );
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Paid Bills");
  //   XLSX.writeFile(workbook, "Paid_Bills_Export.xlsx");
  //   toast.success("Export successful!");
  // };

  const handleDownloadReport = async () => {
    if (!selectedRows || selectedRows.length === 0) {
      toast.warning(
        <div className="send-toast">
          <span>Please select at least one row to download</span>
        </div>
      );
      return;
    }
    try {
      const result = await handleExportReport(
        selectedRows,
        filteredUnpaginatedData,
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
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  const handlePrint = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to print");
      return;
    }
    printBills({
      selectedData: filteredUnpaginatedData.filter((row) => selectedRows.includes(row._id)),
      visibleColumns: columns.filter(
        (col) => visibleColumnFields.includes(col.field) && col.field !== "srNoOld"
      ),
      role: currentUserRole,
      title: "Forwarded Bills",
    });
  };

  // Same rules as the Home tab (29.09, items 13 and 21).
  const filtersActive =
    selectedRegion.length > 0 ||
    !!fromDate ||
    !!toDate ||
    amountActive ||
    columnFiltersActive;

  const handleResetView = () => {
    setSortConfig({ key: null, direction: null });
    setSearchQuery("");
    setSelectedRegion([]);
    setFromDate("");
    setToDate("");
    setSelectedDateField("accountsDept.paymentDate");
    setSelectedAmountField("");
    setMinAmount("");
    setMaxAmount("");
    setGridResetKey((k) => k + 1);
  };

  // Reject
  const handlePaymentReject = async () => {
    try {
      const token = Cookies.get("token");
      const promises = selectedRows.map((billId) =>
        axios.post(
          rejectPayment,
          { billId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      await Promise.all(promises);
      toast.success("Payment rejected for selected bills");
      await fetchBills();
      setSelectedRows([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject payment");
    }
  };

  // DataTable Props
  const dataTableProps = {
    // data: filteredData,
    // data: paginatedData,
    // searchQuery: searchQuery,
    // availableColumns: columns,
    // visibleColumnFields: visibleColumnFields,
    // selectedRows: selectedRows,
    // onRowSelect: setSelectedRows,
    // totalSelected: selectedRows.length,
    // totalItems: paginatedData.length,
    data: filteredUnpaginatedData, // pass full filtered set so column filters work across all data
    searchQuery: searchQuery,
    resetKey: gridResetKey,
    onColumnFiltersActiveChange: setColumnFiltersActive,
    availableColumns: columns,
    visibleColumnFields: visibleColumnFields,
    selectedRows: selectedRows,
    onRowSelect: setSelectedRows,
    totalSelected: selectedRows.length,
    totalItems: totalFilteredItems,
    selectAll: selectAll,
    onSelectAll: handleSelectAll,
    sortConfig: sortConfig,
    setSortConfig: setSortConfig,
    onSort: () => {},
    currentPage: currentPage,
    onPageChange: setCurrentPage,
    itemsPerPage: itemsPerPage,
    // The grid applies the column filters, so it is the only thing that
    // knows how many rows survived. Without this the footer kept offering
    // pages that no longer existed and the grid went blank on them.
    onPaginatedDataChange: setTotalFilteredItems,
    currentUserRole: currentUserRole,
    activeTab: "forwarded",
    onEdit: undefined,
    showActions: false,
  };

  // Pagination section
  const paginationSection = (
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center space-x-2">
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-2 py-1.5 text-sm hover:cursor-pointer outline-none border border-gray-300 rounded-md"
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} per page
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-1">
        <button
          className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
        <button
          className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        {getPaginationRange().map((page, idx) =>
          typeof page === "number" ? (
            <button
              key={page}
              className={`px-2.5 py-1.5 text-sm hover:cursor-pointer border rounded-md transition-colors ${currentPage === page
                  ? "bg-[#011a99] text-white"
                  : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ) : (
            <span key={page + idx} className="px-2.5 text-gray-500">
              {page}
            </span>
          )
        )}
        <button
          className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button
          className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </button>
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <div>
          Showing{" "}
          {totalFilteredItems ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, totalFilteredItems)} entries
          <span className="ml-2">
            <span className="text-gray-400">|</span>
            <span className="ml-2">
              Total: <span className="font-medium">{billsData.length}</span>
            </span>
            {totalFilteredItems !== billsData.length && (
              <>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-blue-600">
                  Filtered:{" "}
                  <span className="font-medium">{totalFilteredItems}</span>
                </span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );

  // Column selector dropdown
  const columnSelectorDropdown = isColumnDropdownOpen && (
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
            checked={visibleColumnFields.length === columns.length}
            readOnly
            className="cursor-pointer"
          />
          <span className="text-sm">Select All</span>
        </div>
      </div>
      <div className="overflow-y-auto p-2 space-y-2">
        {columns
          .filter((col) =>
            col.headerName
              .toLowerCase()
              .includes(columnSearchQuery.toLowerCase())
          )
          .map((column) => (
            <div key={column.field} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`col-${column.field}`}
                checked={visibleColumnFields.includes(column.field)}
                onChange={() => toggleColumnVisibility(column.field)}
                className="cursor-pointer"
              />
              <label
                htmlFor={`col-${column.field}`}
                className="text-sm cursor-pointer"
              >
                {column.headerName}
              </label>
            </div>
          ))}
      </div>
    </div>
  );

  console.log(searchQuery);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow flex flex-col">
          {/* Controls */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              {/* Search + Filter */}
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <div className="flex-1 flex border border-gray-300 rounded-md text-sm">
                  <img src={search} alt="search" className="ml-1.5" />
                  <input
                    type="text"
                    placeholder="Search paid bills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1.5 outline-none text-sm w-full"
                  />
                </div>
                <button
                  onClick={() => setIsFilterPopupOpen(true)}
                  className={`p-1.5 rounded-md transition-colors border hover:cursor-pointer ${filtersActive
                    ? "text-white bg-green-600 border-green-700 hover:bg-green-700"
                    : "text-gray-600 border-gray-400 hover:bg-gray-100"
                    }`}
                  title={filtersActive ? "Filter Options (a filter is applied)" : "Filter Options"}
                >
                  <Funnel className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-400 hover:cursor-pointer flex items-center justify-center"
                  onClick={handleResetView}
                  title="Reset sorting, search and filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              {/* Actions */}
              <div className="flex items-center space-x-3">
                {/* Her order (29.09, item 5): Print, Download, Column list,
                    then Reject Payment for Accounts only. */}
                <button
                  onClick={handlePrint}
                  className="flex items-center px-3 py-1.5 text-white text-sm bg-yellow-600 border border-gray-300 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
                <div className="relative" ref={columnSelectorRef}>
                  <button
                    onClick={() =>
                      setIsColumnDropdownOpen(!isColumnDropdownOpen)
                    }
                    className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Grid3x3 className="w-4 h-4 mr-1 text-[#F48D02]" />
                    Column List
                  </button>
                  {columnSelectorDropdown}
                </div>
                {currentUserRole === "accounts" && (
                  <button
                    className="flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    onClick={() => {
                      if (selectedRows.length === 0) {
                        toast.error("Please select bills to reject payment");
                        return;
                      }
                      setIsRejectModalOpen(true);
                    }}
                    title={
                      selectedRows.length === 0
                        ? "Select bills to reject payment"
                        : "Reject payment for selected bills"
                    }
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Payment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* DataTable */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <Loader text="Loading paid bills..." />
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg font-semibold text-red-600">{error}</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <DataTable {...dataTableProps} />
              </div>
            )}
            <div className="border-t border-gray-200 bg-white px-4 py-2">
              {paginationSection}
            </div>
          </div>
        </div>
      </div>
      <FilterModal
        isOpen={isFilterPopupOpen}
        onClose={() => setIsFilterPopupOpen(false)}
        selectedRegion={selectedRegion}
        // A checklist now (29.09, item 14); nothing ticked means all regions.
        uniqueRegions={sortedRegions(billsData)}
        setSelectedRegion={setSelectedRegion}
        selectedDateField={selectedDateField}
        setSelectedDateField={setSelectedDateField}
        dateFieldOptions={[
          { value: "accountsDept.paymentDate", label: "Payment Date" },
          { value: "taxInvDate", label: "Tax Invoice Date" },
        ]}
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
        handleClearFilters={() => {
          setSearchQuery("");
          setSelectedRegion([]);
          setFromDate("");
          setToDate("");
          setSelectedDateField("accountsDept.paymentDate");
          setSelectedAmountField("");
          setMinAmount("");
          setMaxAmount("");
          setIsFilterPopupOpen(false);
        }}
      />

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex items-start space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mt-1">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Reject Payment</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to reject payment for the selected <span className="font-semibold">{selectedRows.length}</span> bill(s)? <br/> This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none transition-colors"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none transition-colors"
                onClick={() => {
                  handlePaymentReject();
                  setIsRejectModalOpen(false);
                }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentBills;
