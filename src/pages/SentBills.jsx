import React, { useState, useRef, useEffect, useMemo } from "react";
import Header from "../components/Header";
import axios from "axios";
import { sentBills, rejectPayment } from "../apis/bills.api";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import DataTable from "../components/DataTable";
import { Funnel, Grid3x3, Download, X } from "lucide-react";
import search from "../assets/search.svg";
import { getColumnsForRole } from "../utils/columnView";
import { FilterModal } from "../components/dashboard/FilterModal";
import Loader from "../components/Loader";
import Cookies from "js-cookie";

const SentBills = () => {
  const currentUserRole = Cookies.get("userRole");
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [visibleColumnFields, setVisibleColumnFields] = useState([]);
  const columnSelectorRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const rowsPerPageOptions = [10, 20, 30, 50, 100];
  const [columnSearchQuery, setColumnSearchQuery] = useState("");

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
  }, [searchQuery, selectedRegion, fromDate, toDate, itemsPerPage]);

  // Columns
  const columns = useMemo(() => {
    let roleForColumns =
      currentUserRole === "site_officer"
        ? "SITE_OFFICER"
        : currentUserRole === "accounts"
        ? "ACCOUNTS_TEAM"
        : "PIMO_MUMBAI_MIGO_SES";
    return getColumnsForRole(roleForColumns);
  }, [currentUserRole]);

  useEffect(() => {
    if (columns.length > 0) {
      setVisibleColumnFields(columns.slice(0, 12).map((col) => col.field));
    }
  }, [columns]);

  // Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filtering
  const getFilteredData = () => {
    // Custom logic, matches original
    return billsData.filter((bill) => {
      // Search
      const searchFields = ["billNo", "customerName", "referenceNo", "region"];
      const matchesSearch =
        searchQuery === "" ||
        searchFields.some((field) =>
          bill[field]
            ?.toString()
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      // Region
      const matchesRegion =
        selectedRegion.length === 0 || selectedRegion.includes(bill.region);
      // Date
      let matchesDateRange = true;
      if (fromDate || toDate) {
        const path = selectedDateField.split(".");
        let dateValue = bill;
        for (const key of path) dateValue = dateValue?.[key];
        if (dateValue) {
          const date = new Date(dateValue);
          if (fromDate && new Date(fromDate) > date) matchesDateRange = false;
          if (toDate && new Date(toDate) < date) matchesDateRange = false;
        } else {
          matchesDateRange = false;
        }
      }
      return matchesSearch && matchesRegion && matchesDateRange;
    });
  };

  // Pagination
  const filteredData = useMemo(() => {
    let data = getFilteredData();
    // Sorting
    if (sortConfig.key) {
      data = [...data].sort((a, b) => {
        const getValue = (obj, path) =>
          path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
        const aValue = getValue(a, sortConfig.key);
        const bValue = getValue(b, sortConfig.key);
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
        if (
          aValue &&
          bValue &&
          !isNaN(Date.parse(aValue)) &&
          !isNaN(Date.parse(bValue))
        ) {
          return sortConfig.direction === "asc"
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        }
        return (
          String(aValue ?? "").localeCompare(String(bValue ?? ""), undefined, {
            numeric: true,
          }) * (sortConfig.direction === "asc" ? 1 : -1)
        );
      });
    }
    setTotalFilteredItems(data.length);
    // Paginate
    return data.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [
    billsData,
    searchQuery,
    selectedRegion,
    fromDate,
    toDate,
    selectedDateField,
    sortConfig,
    itemsPerPage,
    currentPage,
  ]);

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
    setSelectedRows(e.target.checked ? filteredData.map((row) => row._id) : []);
  };

  // Export Excel
  const handleExportExcel = () => {
    const exportData = getFilteredData();
    const worksheet = XLSX.utils.json_to_sheet(
      exportData.map((item) => {
        const row = {};
        visibleColumnFields.forEach((field) => {
          const column = columns.find((col) => col.field === field);
          if (column) {
            const path = field.split(".");
            let value = item;
            for (const key of path) value = value?.[key];
            row[column.headerName] = value !== undefined ? value : "";
          }
        });
        return row;
      })
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paid Bills");
    XLSX.writeFile(workbook, "Paid_Bills_Export.xlsx");
    toast.success("Export successful!");
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
    data: filteredData,
    searchQuery: searchQuery,
    availableColumns: columns,
    visibleColumnFields: visibleColumnFields,
    selectedRows: selectedRows,
    onRowSelect: setSelectedRows,
    totalSelected: selectedRows.length,
    totalItems: filteredData.length,
    selectAll: selectAll,
    onSelectAll: handleSelectAll,
    sortConfig: sortConfig,
    onSort: handleSort,
    currentPage: currentPage,
    itemsPerPage: itemsPerPage,
    onPaginatedDataChange: setTotalFilteredItems,
    onEdit: undefined,
    showActions: currentUserRole === "accounts",
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
              className={`px-2.5 py-1.5 text-sm hover:cursor-pointer border rounded-md transition-colors ${
                currentPage === page
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
          {filteredData.length ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
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
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-400"
                  title="Filter Options"
                >
                  <Funnel className="w-4 h-4" />
                </button>
              </div>
              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
                {currentUserRole === "accounts" && (
                  <button
                    className="flex items-center hover:cursor-pointer space-x-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    onClick={() => {
                      if (selectedRows.length === 0) {
                        toast.error("Please select bills to reject payment");
                        return;
                      }
                      handlePaymentReject();
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
                <div className="relative" ref={columnSelectorRef}>
                  <button
                    onClick={() =>
                      setIsColumnDropdownOpen(!isColumnDropdownOpen)
                    }
                    className="flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Grid3x3 className="w-4 h-4 mr-1" />
                    Column List
                  </button>
                  {columnSelectorDropdown}
                </div>
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
        uniqueRegions={[...new Set(billsData.map((bill) => bill.region))]}
        handleRegionChange={(e) => setSelectedRegion([e.target.value])}
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
        handleClearFilters={() => {
          setSearchQuery("");
          setSelectedRegion([]);
          setFromDate("");
          setToDate("");
          setIsFilterPopupOpen(false);
        }}
      />
    </div>
  );
};

export default SentBills;
