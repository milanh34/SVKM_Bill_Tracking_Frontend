import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";
import { bills } from "../apis/bills.api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import DataTable from "../components_tailwind/dashboard/DataTable";
import { Funnel, Grid3x3, Download } from "lucide-react";
import search from "../assets/search.svg";
import { getColumnsForRole } from "../utils/columnView";
import { FilterModal } from "../components_tailwind/dashboard/FilterModal";
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
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [pagesToShow, setPagesToShow] = useState(5);
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

  // Rest of the utility functions and handlers
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ... Add more handler functions similar to Dashboard

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
                {/* ... Add your buttons here ... */}
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
