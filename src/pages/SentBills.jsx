import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { sentBills, rejectPayment } from "../apis/bills.api";
import { toast } from 'react-toastify';
import * as XLSX from "xlsx";
import DataTable from "../components/DataTable";
import {
  Funnel,
  Grid3x3,
  Download,
  X,
} from "lucide-react";
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
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 rows per page
  const rowsPerPageOptions = [10, 20, 30, 50, 100]; // Options for rows per page
  const [columnSearchQuery, setColumnSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const fetchBills = async () => {
    try {
      const response = await axios.get(`${sentBills}/${Cookies.get("userRole")}`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      console.log("Received sent bills:", response.data.data);
      setBillsData(response.data?.data);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch sent bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Reset to first page when search query, filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRegion, fromDate, toDate, itemsPerPage]);

  const columns = useMemo(() => {
    const userRole = Cookies.get("userRole");
    let roleForColumns =
      userRole === "admin"
        ? "ADMIN"
        : userRole === "accounts"
        ? "ACCOUNTS_TEAM"
        : "DIRECTOR_TRUSTEE_ADVISOR";
    return getColumnsForRole(roleForColumns);
  }, []);

  useEffect(() => {
    if (columns.length > 0) {
      setVisibleColumnFields(columns.slice(0, 12).map((col) => col.field));
    }
  }, [columns]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleExportExcel = () => {
    // Get the filtered and sorted data from the table
    const filteredData = getFilteredData();

    // Create worksheet from the filtered data
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => {
        const row = {};
        visibleColumnFields.forEach((field) => {
          const column = columns.find((col) => col.field === field);
          if (column) {
            // Get the display value for the cell
            const path = field.split(".");
            let value = item;
            for (const key of path) {
              value = value?.[key];
              if (value === undefined) break;
            }
            row[column.headerName] = value !== undefined ? value : "";
          }
        });
        return row;
      })
    );

    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paid Bills");

    // Generate and download the file
    XLSX.writeFile(workbook, "Paid_Bills_Export.xlsx");

    toast.success("Export successful!");
  };

  const getFilteredData = () => {
    return billsData.filter((bill) => {
      // Filter by search query
      const searchFields = ["billNo", "customerName", "referenceNo", "region"];
      const matchesSearch =
        searchQuery === "" ||
        searchFields.some((field) => {
          return bill[field]
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });

      // Filter by region
      const matchesRegion =
        selectedRegion.length === 0 || selectedRegion.includes(bill.region);

      // Filter by date range
      let matchesDateRange = true;
      if (fromDate || toDate) {
        const path = selectedDateField.split(".");
        let dateValue = bill;
        for (const key of path) {
          dateValue = dateValue?.[key];
          if (dateValue === undefined) break;
        }

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  // Generate array of page numbers to display
  const getPaginationRange = () => {
    const delta = 2; // Number of pages to show before and after current page
    let range = [];

    // Always show first page
    range.push(1);

    // Calculate start and end of range around current page
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (start > 2) {
      range.push("...");
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      range.push("...");
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

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
    if (visibleColumnFields.length === columns.length) {
      setVisibleColumnFields([]);
    } else {
      setVisibleColumnFields(columns.map((col) => col.field));
    }
  };

  // Close column dropdown when clicking outside
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
  }, [columnSelectorRef]);

  const handlePaymentReject = async () => {
    try {
      const token = Cookies.get("token");
      const promises = selectedRows.map((billId) =>
        axios.post(
          rejectPayment,
          { billId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      await Promise.all(promises);
      toast.success("Payment rejected for selected bills");
      await fetchBills();
      setSelectedRows([]);
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject payment"
      );
    }
  };

  const paginationSection = (
    <div className="flex justify-between items-center mt-2">
      <div className="flex items-center space-x-2">
        <select
          value={itemsPerPage}
          onChange={handleRowsPerPageChange}
          className="px-2 py-1.5 text-sm hover:cursor-pointer outline-none border border-gray-300 rounded-mdx"
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
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </button>
        {getPaginationRange().map((page, index) => (
          <button
            key={index}
            onClick={() =>
              typeof page === "number" ? handlePageChange(page) : null
            }
            disabled={page === "..."}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : page === "..."
                ? "bg-gray-100 text-gray-700 cursor-default"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border border-gray-300`}
          >
            {page}
          </button>
        ))}
        <button
          className="px-2.5 py-1.5 text-sm hover:cursor-pointer bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          Last
        </button>
      </div>

      <div className="flex items-center text-sm text-gray-600">
        Showing{" "}
        {totalFilteredItems === 0
          ? 0
          : Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              totalFilteredItems
            )}{" "}
        to {Math.min(currentPage * itemsPerPage, totalFilteredItems)} of{" "}
        {totalFilteredItems} entries
      </div>
    </div>
  );

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
            col.headerName.toLowerCase().includes(columnSearchQuery.toLowerCase())
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

  const dataTableProps = {
    data: billsData,
    searchQuery: searchQuery,
    availableColumns: columns,
    visibleColumnFields: visibleColumnFields,
    selectedRows: selectedRows,
    onRowSelect: setSelectedRows,
    totalSelected: selectedRows.length,
    totalItems: billsData.length,
    selectAll: selectAll,
    onSelectAll: (e) => setSelectAll(e.target.checked),
    sortConfig: sortConfig,
    onSort: handleSort,
    currentPage: currentPage,
    itemsPerPage: itemsPerPage,
    onPaginatedDataChange: setTotalFilteredItems,
    onEdit: undefined,
    showActions: false,
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow flex flex-col">
          {/* Header section */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              {/* Search and filters */}
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
                >
                  <Funnel className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons */}
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

                {/* Column selector dropdown */}
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

          {/* Table section with proper overflow handling */}
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

            {/* Pagination section */}
            <div className="border-t border-gray-200 bg-white px-4 py-2">
              {paginationSection}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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
