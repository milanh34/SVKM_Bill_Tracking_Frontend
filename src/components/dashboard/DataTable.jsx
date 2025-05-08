import React, { useState, useEffect, useMemo, useRef } from "react";
import { EditIcon, SortAscIcon, SortDescIcon, Filter, CheckIcon } from "./Icons";
import { X } from "lucide-react";
import { getColumnsForRole } from "../../utils/columnEdit";
import { bills } from "../../apis/bills.api";
import axios from "axios";
import { toast } from "react-toastify";

const FILTER_OPERATORS = [
  { value: "multiSelect", label: "Select Values" },
];

const DataTable = ({
  data,
  availableColumns,
  visibleColumnFields,
  onEdit,
  onRowSelect,
  totalSelected,
  totalItems,
  selectAll,
  onSelectAll,
  sortConfig,
  onSort,
  selectedRows,
  currentPage,
  itemsPerPage,
  onPaginatedDataChange,
  searchQuery,
  currentUserRole,
}) => {
  const [columnFilters, setColumnFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("right");
  const filterRef = useRef(null);
  const [selectAllState, setSelectAll] = useState(false);
  const [filterType, setFilterType] = useState({}); 
  const [dateRanges, setDateRanges] = useState({}); 
  const [editingRow, setEditingRow] = useState(null);
  const [editedValues, setEditedValues] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setActiveFilter(null);
        setFilterSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleGlobalEscape = (event) => {
      if (event.key === 'Escape' && editingRow) {
        setEditingRow(null);
        setEditedValues(prev => {
          const newValues = { ...prev };
          delete newValues[editingRow];
          return newValues;
        });
      }
    };

    window.addEventListener('keydown', handleGlobalEscape);
    return () => window.removeEventListener('keydown', handleGlobalEscape);
  }, [editingRow]);

  const visibleColumns = useMemo(() => {
    return availableColumns.filter((col) =>
      visibleColumnFields.includes(col.field)
    );
  }, [availableColumns, visibleColumnFields]);

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

  const requestSort = (key) => {
    onSort(key);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      if (date.getFullYear() <= 1971) return "-";
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (e) {
      return "-";
    }
  };

  const isDateField = (field) => {
    const dateIndicators = [
      'taxInvDate', 'poDate', 'proformaInvDate', 'taxInvRecdAtSite', 'advanceDate', 'Date', 'invReturnedToSite', 'dateReceived'
    ];
    
    if (field.includes('.')) {
      const parts = field.split('.');
      return parts.some(part => 
        dateIndicators.some(indicator => 
          part.toLowerCase().includes(indicator.toLowerCase())
        )
      );
    }
    
    return dateIndicators.some(indicator => 
      field.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  const isNumericField = (field) => {
    const numericIndicators = [
      'amount', 'Amount', 'Amt', 'amt',
      'percentage', 'Percentage',
      'poAmt', 'taxInvAmt', 'proformaInvAmt',
      'advanceAmt', 'paymentAmt', 'migoDetails.amount',
      'copDetails.amount'
    ];
    
    return numericIndicators.some(indicator => 
      field.toLowerCase().includes(indicator.toLowerCase())
    );
  };

  const getUniqueValues = (data, field) => {
    const values = new Set();
    data.forEach((row) => {
      const value = getNestedValue(row, field);
      if (value !== undefined && value !== null) {
        if (isDateField(field)) {
          const formattedDate = formatDate(value);
          if (formattedDate !== "-") {
            values.add(formattedDate);
          }
        } else {
          values.add(value.toString());
        }
      }
    });
    return Array.from(values).sort((a, b) => {
      if (a.includes('-') && b.includes('-')) {
        const [dayA, monthA, yearA] = a.split('-').map(Number);
        const [dayB, monthB, yearB] = b.split('-').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA - dateB;
      }
      return a.localeCompare(b);
    });
  };

  const applyFilter = (value, filterValue, operator, field) => {
    if (!value) return false;
    
    if (isDateField(field)) {
      const currentFilterType = filterType[field] || 'individual';
      const dateValue = new Date(value);
      
      if (currentFilterType === 'range') {
        const { from, to } = dateRanges[field] || {};
        if (from && to) {
          const fromDate = new Date(from);
          const toDate = new Date(to);
          return dateValue >= fromDate && dateValue <= toDate;
        }
        return true;
      } else {
        const formattedDate = formatDate(value);
        return filterValue.some(val => formattedDate === val);
      }
    }

    const stringValue = value.toString().toLowerCase();
    
    if (value instanceof Date || !isNaN(new Date(value))) {
      const formattedDate = formatDate(value);
      return filterValue.some(val => formattedDate === val);
    }

    switch (operator) {
      case "multiSelect":
        return filterValue.some((val) => stringValue === val.toLowerCase());
      default:
        return true;
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const isMatchingSearch = visibleColumns.some((column) => {
          const value = getNestedValue(row, column.field);
          return value && value.toString().toLowerCase().includes(searchLower);
        });
        if (!isMatchingSearch) return false;
      }

      return Object.entries(columnFilters).every(([field, filter]) => {
        if (
          !filter?.value ||
          (Array.isArray(filter.value) && filter.value.length === 0)
        ) {
          return true;
        }
        const value = getNestedValue(row, field);
        if (value === null || value === undefined) return false;
        return applyFilter(value, filter.value, filter.operator, field);
      });
    });
  }, [data, searchQuery, columnFilters, visibleColumns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
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
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortConfig.direction === "asc"
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }
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
  }, [filteredData, sortConfig]);

  const displayData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedData.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedData, currentPage, itemsPerPage]);

  useEffect(() => {
    if (onPaginatedDataChange) {
      onPaginatedDataChange(sortedData.length);
    }
  }, [sortedData, onPaginatedDataChange]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "-";
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } catch (e) {
      return value.toString();
    }
  };

  const formatCellValue = (value, field) => {
    if (value === undefined || value === null || value === '') return "-";

    if (isNumericField(field)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return formatCurrency(numValue);
      }
    }

    if (isDateField(field)) {
      if (typeof value === 'number') {
        const date = new Date(value);
        if (date.getFullYear() > 1971) {
          return formatDate(date);
        }
      }
      if (typeof value === 'string' && value.includes('T')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return formatDate(date);
        }
      }
      return value.toString();
    }

    if (field.includes('status')) {
      return value.toString();
    }

    return value.toString();
  };

  const getStatusStyle = (status) => {
    if (!status) return {};
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("approve") ||
      statusLower === "paid" ||
      statusLower === "active"
    ) {
      return { color: "#15803d", fontWeight: "bold" };
    } else if (statusLower.includes("reject") || statusLower === "fail") {
      return { color: "#b91c1c", fontWeight: "bold" };
    } else if (
      statusLower.includes("pend") ||
      statusLower === "waiting" ||
      statusLower === "unpaid"
    ) {
      return { color: "#ca8a04", fontWeight: "bold" };
    }
    return {};
  };

  const handleRowSelect = (id) => {
    if (onRowSelect) {
      const newSelection = selectedRows.includes(id)
        ? selectedRows.filter((rowId) => rowId !== id)
        : [...selectedRows, id];
      onRowSelect(newSelection);
      
      setSelectAll(newSelection.length === filteredData.length);
    }
  };

  useEffect(() => {
    setSelectAll(false);
  }, [columnFilters, searchQuery]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    
    if (isChecked) {
      const filteredIds = filteredData.map(row => row._id);
      onRowSelect(filteredIds);
    } else {
      onRowSelect([]);
    }
  };

  const handleFilterClick = (field, event) => {
    event.stopPropagation();
    if (activeFilter === field) {
      return;
    }
    
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const popupWidth = 250;
    const tableBottom = event.currentTarget.closest('.overflow-x-auto').getBoundingClientRect().bottom;
    const availableHeight = tableBottom - buttonRect.bottom - 20;
    
    setFilterPosition(buttonRect.left < screenWidth / 3 ? "right" : "left");
    
    filterRef.current = { maxHeight: availableHeight };
    
    setActiveFilter(field);
    setFilterSearchQuery("");
  };

  const handleFilterChange = (field, operator, selectedValues) => {
    setColumnFilters((prev) => ({
      ...prev,
      [field]: { operator, value: selectedValues },
    }));
  };

  const handleFilterClear = (field) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  const renderFilterPopup = (column) => {
    const uniqueValues = getUniqueValues(data, column.field);
    const currentFilter = columnFilters[column.field] || { operator: "multiSelect", value: [] };
    const maxHeight = filterRef.current?.maxHeight || 400;
    const isDate = isDateField(column.field);
    const currentFilterType = filterType[column.field] || 'individual';
    const currentDateRange = dateRanges[column.field] || { from: '', to: '' };

    const showDateRange = isDate && (
      column.headerName.toLowerCase().includes('date') || 
      column.headerName.toLowerCase().includes('at site') ||
      column.headerName.toLowerCase().includes('booking')
    );

    return (
      <div
        ref={filterRef}
        className={`absolute mt-2.5 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-[250px] flex flex-col ${
          filterPosition === "right" ? "left-0" : "right-0"
        }`}
        style={{ maxHeight: `${Math.min(maxHeight, 400)}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{column.headerName}</span>
            <button
              onClick={() => setActiveFilter(null)}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <X size={16} />
            </button>
          </div>

          {/* Update date range selector condition */}
          {showDateRange && (
            <div className="mt-2">
              <select
                value={currentFilterType}
                onChange={(e) => setFilterType(prev => ({
                  ...prev,
                  [column.field]: e.target.value
                }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="individual">Select Individual Dates</option>
                <option value="range">Select Date Range</option>
              </select>
            </div>
          )}

          {(!showDateRange || currentFilterType === 'individual') && (
            <div className="mt-2 relative">
              <input
                type="text"
                placeholder="Search values..."
                value={filterSearchQuery}
                onChange={(e) => setFilterSearchQuery(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm pr-8"
              />
              {filterSearchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Update date range inputs condition */}
          {showDateRange && currentFilterType === 'range' && (
            <div className="mt-2 space-y-2">
              <div>
                <label className="text-xs text-gray-500">From</label>
                <input
                  type="date"
                  value={currentDateRange.from}
                  onChange={(e) => setDateRanges(prev => ({
                    ...prev,
                    [column.field]: { ...currentDateRange, from: e.target.value }
                  }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">To</label>
                <input
                  type="date"
                  value={currentDateRange.to}
                  onChange={(e) => setDateRanges(prev => ({
                    ...prev,
                    [column.field]: { ...currentDateRange, to: e.target.value }
                  }))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {(!showDateRange || currentFilterType === 'individual') && (
          <div className="flex-1 overflow-y-auto p-2 bg-white">
            {uniqueValues.filter((value) =>
              value.toLowerCase().includes(filterSearchQuery.toLowerCase())
            ).map((value) => (
              <label
                key={value}
                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={currentFilter.value?.includes(value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...(currentFilter.value || []), value]
                      : (currentFilter.value || []).filter((v) => v !== value);
                    handleFilterChange(column.field, "multiSelect", newValues);
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
            {uniqueValues.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-2">
                No values found
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 p-2 flex justify-between gap-2">
          <button
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            onClick={() => {
              handleFilterClear(column.field);
              setDateRanges(prev => ({ ...prev, [column.field]: { from: '', to: '' } }));
            }}
          >
            Clear
          </button>
          <button
            className="px-2 py-1 text-xs bg-[#011a99] text-white hover:bg-[#015099] rounded"
            onClick={() => {
              if (currentFilterType === 'range' && currentDateRange.from && currentDateRange.to) {
                handleFilterChange(column.field, 'dateRange', [currentDateRange.from, currentDateRange.to]);
              }
              setActiveFilter(null);
              setFilterSearchQuery("");
            }}
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  const getEditableFields = () => {
    const roleMapping = {
      "site_officer": "SITE_OFFICER",
      "qs_site": "QS_TEAM",
      "site_pimo": "PIMO_MUMBAI_MIGO_SES",
      "pimo_mumbai": "PIMO_MUMBAI_ADVANCE_FI",
      "accounts": "ACCOUNTS_TEAM",
      "director": "DIRECTOR_TRUSTEE_ADVISOR"
    };

    const mappedRole = roleMapping[currentUserRole] || currentUserRole;
    const editableFields = getColumnsForRole(mappedRole).map(col => col.field);
    return editableFields || [];
  };

  const handleCellEdit = (field, value, rowId) => {
    setEditedValues(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value
      }
    }));
  };

  const renderCell = (row, column, value) => {
    const isEditing = editingRow === row._id;
    const isEditable = getEditableFields().includes(column.field);
    const editedValue = editedValues[row._id]?.[column.field];

    if (isEditing && isEditable) {
      const inputType = isDateField(column.field) ? "date" : 
                       isNumericField(column.field) ? "number" : "text";
      return (
        <div className="relative w-full">
          <input
            type={inputType}
            value={editedValue !== undefined ? editedValue : (value || '')}
            onChange={(e) => handleCellEdit(column.field, e.target.value, row._id)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setEditingRow(null);
                setEditedValues(prev => {
                  const newValues = { ...prev };
                  delete newValues[row._id];
                  return newValues;
                });
              }
            }}
            className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      );
    }

    const formattedValue = formatCellValue(value, column.field);
    return (
      <div className={`${isEditing && isEditable ? 'bg-blue-50 px-2 py-1 rounded border border-blue-200' : ''}`}>
        {formattedValue}
      </div>
    );
  };

  const handleEditClick = (row) => {
    if (editingRow === row._id) {
      // When saving (clicking check icon)
      const editedFieldsForRow = editedValues[row._id];
      
      // Remove billId, _id, srNo from the payload
      const payload = { ...editedFieldsForRow };
      delete payload.billId;
      delete payload._id;
      delete payload.srNo;
  
      // Only make the API call if there are changes
      if (Object.keys(payload).length > 0) {
        axios.put(`${bills}/${row._id}`, payload)
          .then((response) => {
            // Get the updated bill from the response
            const updatedBill = response.data.data;
            
            toast.success("Bill updated successfully!");
            
            // Pass the updated bill from the server response to the parent component
            onEdit && onEdit(updatedBill);
            
            // Clear edit state
            setEditingRow(null);
            setEditedValues(prev => {
              const newValues = { ...prev };
              delete newValues[row._id];
              return newValues;
            });
          })
          .catch((error) => {
            toast.error(error.response?.data?.message || "Failed to update bill");
            console.error("Error updating bill:", error);
          });
      } else {
        setEditingRow(null);
        setEditedValues(prev => {
          const newValues = { ...prev };
          delete newValues[row._id];
          return newValues;
        });
      }
    } else {
      // Starting edit mode
      console.log('Starting edit for row:', row.srNo);
      setEditingRow(row._id);
      setEditedValues(prev => ({
        ...prev,
        [row._id]: {}
      }));
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col border border-gray-200 rounded-lg ${
        data.length > 8 ? "h-full" : ""
      }`}
    >
      <div
        className={`overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full ${
          data.length < 10 ? "h-fit" : "flex-1"
        }`}
      >
        <style jsx>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #d1d5db;
            border-radius: 9999px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: #9ca3af;
          }
          .scrollbar-thin::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}</style>
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-40 bg-gray-50">
            <tr className="divide-x divide-gray-200">
              <th className="sticky left-0 top-0 z-50 w-12 bg-blue-50 px-1.5 py-2.5 border-b border-gray-200">
                <div className="absolute inset-0 bg-blue-50 border-r border-blue-200" 
                     style={{ bottom: "-1px", zIndex: -1 }}></div>
                <div className="relative z-10 flex flex-col items-center">
                  <input
                    type="checkbox"
                    checked={selectAllState}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {totalSelected > 0 && (
                    <span className="text-xs text-gray-500 mt-1">
                      {totalSelected}/{totalItems}
                    </span>
                  )}
                </div>
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column.field}
                  onClick={() => requestSort(column.field)}
                  className={`
                    sticky top-0 px-1.5 py-2.5 text-left text-sm font-semibold text-gray-900
                    border-b border-gray-200 bg-gray-50
                    ${sortConfig.key === column.field ? "bg-gray-100" : ""}
                  `}
                  data-field={column.field}
                >
                  <div className="flex items-center justify-between group">
                    <span
                      className="truncate max-w-[200px]"
                      title={column.headerName}
                    >
                      {column.headerName}
                    </span>
                    <div className="flex items-center space-x-1">
                      {columnFilters[column.field] && 
                       columnFilters[column.field].value?.length > 0 && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-1">
                          {`${columnFilters[column.field].value.length} selected`}
                        </div>
                      )}
                      <span className="invisible group-hover:visible ml-1">
                        {sortConfig.key === column.field &&
                        sortConfig.direction ? (
                          sortConfig.direction === "asc" ? (
                            <SortAscIcon />
                          ) : (
                            <SortDescIcon />
                          )
                        ) : (
                          <SortAscIcon className="opacity-50" />
                        )}
                      </span>
                      <button
                        onClick={(e) => handleFilterClick(column.field, e)}
                        className="p-1 hover:bg-gray-200 rounded-md transition-colors duration-150 cursor-pointer focus:outline-none"
                      >
                        <Filter
                          className={`w-4 h-4 ${
                            columnFilters[column.field]?.value?.length > 0
                              ? "text-blue-500"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  {activeFilter === column.field && renderFilterPopup(column)}
                </th>
              ))}
              <th className="sticky right-0 top-0 z-50 w-16 bg-blue-50 px-1.5 py-2.5 border-b border-gray-200">
                <div className="absolute inset-0 bg-blue-50 border-l border-blue-200" 
                     style={{ bottom: "-1px", zIndex: -1 }}></div>
                <div className="relative z-10 text-center">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayData.map((row) => {
              const isSelected = selectedRows.includes(row._id);
              const bgColor = isSelected
                ? "bg-blue-50"
                : "bg-white hover:bg-gray-50";

              return (
                <tr
                  key={row._id}
                  className={`${bgColor} transition duration-150 ease-in-out divide-x divide-gray-200`}
                >
                  <td className="sticky left-0 z-20 whitespace-nowrap px-3 py-3 text-center">
                    <div 
                      className={`absolute inset-0 ${isSelected ? "bg-blue-50" : "bg-white"} border-r border-blue-200`} 
                      style={{ bottom: "-1px", top: "-1px" }}
                    ></div>
                    <div className="relative z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(row._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  {visibleColumns.map((column) => {
                    const value = getNestedValue(row, column.field);
                    return (
                      <td
                        key={column.field}
                        className={`whitespace-nowrap px-1.5 py-2.5 text-sm ${
                          column.field.includes("amount") ||
                          column.field.includes("Amount")
                            ? "text-right"
                            : "text-gray-900"
                        }`}
                        style={column.field.includes("status") ? getStatusStyle(value) : {}}
                        data-field={column.field}
                      >
                        {renderCell(row, column, value)}
                      </td>
                    );
                  })}
                  <td className="sticky right-0 z-20 whitespace-nowrap px-1.5 py-2.5 text-center">
                    <div 
                      className={`absolute inset-0 ${isSelected ? "bg-blue-50" : "bg-white"} border-l border-blue-200`}
                      style={{ bottom: "-1px", top: "-1px" }}
                    ></div>
                    <div className="relative z-10">
                      <button
                        className="rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => handleEditClick(row)}
                      >
                        {editingRow === row._id ? (
                          <CheckIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <EditIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
