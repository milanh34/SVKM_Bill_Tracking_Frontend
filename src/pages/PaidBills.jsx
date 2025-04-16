import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { bills } from "../apis/bills.api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import DataTable from "../components/dashboard/DataTable";
import { Funnel, Grid3x3, Download, ChevronLeft, ChevronRight } from "lucide-react";
import search from "../assets/search.svg";
import { getColumnsForRole } from "../utils/columnView";
import { FilterModal } from "../components/dashboard/FilterModal";
import Loader from "../components/Loader";
import Cookies from "js-cookie";

const PaidBills = () => {
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
  const [selectedDateField, setSelectedDateField] = useState("accountsDept.paymentDate");
  const [visibleColumnFields, setVisibleColumnFields] = useState([]);
  const columnSelectorRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [totalFilteredItems, setTotalFilteredItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 rows per page
  const rowsPerPageOptions = [10, 20, 30, 50, 100]; // Options for rows per page
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = Cookies.get("userRole");
    const token = Cookies.get("token");
    const allowedRoles = ["admin", "accounts", "director"];

    if (!token) {
      navigate("/login");
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }
  }, [navigate]);

  const fetchBills = async () => {
    try {
      const response = await axios.get(bills, {headers: { Authorization: `Bearer ${Cookies.get('token')}` }});
      const paidBills = response.data.filter(bill => 
        bill.accountsDept?.status?.toLowerCase() === "paid"
      );
      setBillsData(paidBills);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch paid bills");
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
    let roleForColumns = userRole === "admin" ? "ADMIN" :
                        userRole === "accounts" ? "ACCOUNTS_TEAM" :
                        "DIRECTOR_TRUSTEE_ADVISOR";
    return getColumnsForRole(roleForColumns);
  }, []);

  useEffect(() => {
    if (columns.length > 0) {
      setVisibleColumnFields(columns.slice(0, 12).map(col => col.field));
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
      filteredData.map(item => {
        const row = {};
        visibleColumnFields.forEach(field => {
          const column = columns.find(col => col.field === field);
          if (column) {
            // Get the display value for the cell
            const path = field.split('.');
            let value = item;
            for (const key of path) {
              value = value?.[key];
              if (value === undefined) break;
            }
            row[column.headerName] = value !== undefined ? value : '';
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
    return billsData.filter(bill => {
      // Filter by search query
      const searchFields = ['billNo', 'customerName', 'referenceNo', 'region'];
      const matchesSearch = searchQuery === '' || searchFields.some(field => {
        return bill[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });
      
      // Filter by region
      const matchesRegion = selectedRegion.length === 0 || selectedRegion.includes(bill.region);
      
      // Filter by date range
      let matchesDateRange = true;
      if (fromDate || toDate) {
        const path = selectedDateField.split('.');
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
      range.push('...');
    }
    
    // Add pages in range
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      range.push('...');
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  };

  const toggleColumnVisibility = (field) => {
    setVisibleColumnFields(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  // Close column dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target)) {
        setIsColumnDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [columnSelectorRef]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex-1 p-3 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              {/* Search and filters section */}
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

              {/* Export and Column List buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                    className="flex items-center px-3 py-1.5 bg-gray-100 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    ref={columnSelectorRef}
                  >
                    <Grid3x3 className="w-4 h-4 mr-1" />
                    Columns
                  </button>
                  {isColumnDropdownOpen && (
                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-56 max-h-80 overflow-y-auto">
                      <div className="p-2 border-b border-gray-200">
                        <p className="text-sm font-medium">Toggle Columns</p>
                      </div>
                      <div className="p-2">
                        {columns.map((column) => (
                          <div key={column.field} className="flex items-center py-1">
                            <input
                              type="checkbox"
                              id={column.field}
                              checked={visibleColumnFields.includes(column.field)}
                              onChange={() => toggleColumnVisibility(column.field)}
                              className="mr-2"
                            />
                            <label htmlFor={column.field} className="text-sm">
                              {column.headerName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <Loader text="Loading paid bills..." />
            ) : error ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg font-semibold text-red-600">{error}</p>
              </div>
            ) : (
              <DataTable
                data={billsData}
                searchQuery={searchQuery}
                availableColumns={columns}
                visibleColumnFields={visibleColumnFields}
                selectedRows={selectedRows}
                onRowSelect={setSelectedRows}
                totalSelected={selectedRows.length}
                totalItems={billsData.length}
                selectAll={selectAll}
                onSelectAll={(e) => setSelectAll(e.target.checked)}
                sortConfig={sortConfig}
                onSort={handleSort}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPaginatedDataChange={setTotalFilteredItems}
              />
            )}
          </div>

          {/* Pagination Section */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0">
              <div className="flex items-center mr-4">
                <span className="mr-2">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {rowsPerPageOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="ml-2">per page</span>
              </div>
              
              <span>
                Showing {totalFilteredItems === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredItems)} to {Math.min(currentPage * itemsPerPage, totalFilteredItems)} of {totalFilteredItems} entries
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center justify-center w-8 h-8 rounded ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } border border-gray-300`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {getPaginationRange().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={page === '...'}
                  className={`flex items-center justify-center w-8 h-8 rounded ${
                    page === currentPage
                      ? 'bg-blue-600 text-white' 
                      : page === '...' 
                        ? 'bg-gray-100 text-gray-700 cursor-default'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                  } border border-gray-300`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={`flex items-center justify-center w-8 h-8 rounded ${
                  currentPage >= totalPages 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } border border-gray-300`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FilterModal
        isOpen={isFilterPopupOpen}
        onClose={() => setIsFilterPopupOpen(false)}
        selectedRegion={selectedRegion}
        uniqueRegions={[...new Set(billsData.map(bill => bill.region))]}
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

export default PaidBills;