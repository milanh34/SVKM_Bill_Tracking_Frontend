import React, { useState, useEffect, useMemo, useRef } from "react";
import { EditIcon, SortAscIcon, SortDescIcon, Filter } from "./Icons";
import { X } from "lucide-react";

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
}) => {
  const [columnFilters, setColumnFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("right"); // Add this state
  const filterRef = useRef(null);
  const [selectAllState, setSelectAll] = useState(false);

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
      'date', 'Date', 'Dt', '_dt',
      'Recd', 'Given', 'Dispatch',
      'Created', 'Received', 'Payment',
      'advance', 'Advance', 'Returned',
      'Booking', 'Check', 'Inv',
      'Invoice', 'invReturnedToSite',
      'invBookingChecking',
      'dateGiven', 'dateReceived',
      'returnedToPimo', 'receivedBack'
    ];
    
    // Check for date-related patterns in nested fields
    if (field.includes('.')) {
      const parts = field.split('.');
      for (const part of parts) {
        if (dateIndicators.some(indicator => 
          part.toLowerCase().includes(indicator.toLowerCase())
        )) {
          return true;
        }
      }
    }
    
    // Check for direct matches
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

  const applyFilter = (value, filterValue, operator) => {
    if (!value) return false;
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
        return applyFilter(value, filter.value, filter.operator);
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
    // Update filtered data count whenever filters change
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

    // Handle numeric fields first
    if (isNumericField(field)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return formatCurrency(numValue);
      }
    }

    // Handle date fields
    if (isDateField(field)) {
      // Check for Unix timestamp (milliseconds since epoch)
      if (typeof value === 'number') {
        const date = new Date(value);
        if (date.getFullYear() > 1971) { // Valid date check
          return formatDate(date);
        }
      }
      // Check if it's already a date string
      if (typeof value === 'string' && value.includes('T')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return formatDate(date);
        }
      }
      // If we can't parse it as a valid date, return the original value
      return value.toString();
    }

    // Handle status fields with special styling
    if (field.includes('status')) {
      return value.toString();
    }

    // Default handling for other fields
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
      
      // Update selectAll state based on if all filtered items are selected
      setSelectAll(newSelection.length === filteredData.length);
    }
  };

  useEffect(() => {
    // Reset selectAll when filters change
    setSelectAll(false);
  }, [columnFilters, searchQuery]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    
    if (isChecked) {
      // Only select IDs from the filtered data
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
    
    // Calculate if the popup should open to the left or right
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const popupWidth = 250; // Approximate width of the popup
    
    // If the button is in the left third of the screen, open to the right
    setFilterPosition(buttonRect.left < screenWidth / 3 ? "right" : "left");
    
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
    const currentFilter =
      columnFilters[column.field] || { operator: "multiSelect", value: [] };

    const filteredValues = uniqueValues.filter((value) =>
      value.toLowerCase().includes(filterSearchQuery.toLowerCase())
    );

    return (
      <div
        ref={filterRef}
        className={`absolute mt-2.5 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-3 min-w-[250px] ${
          filterPosition === "right" ? "left-0" : "right-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{column.headerName}</span>
            <button
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={() => setActiveFilter(null)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative">
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

          <div className="max-h-60 overflow-y-auto space-y-1 border rounded-md p-1">
            {filteredValues.map((value) => (
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
          </div>

          <div className="flex justify-between gap-2 pt-2 border-t">
            <button
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors duration-150"
              onClick={() => handleFilterClear(column.field)}
            >
              Clear filters
            </button>
            <button
              className="px-2 py-1 text-xs bg-[#011a99] text-white hover:bg-[#015099] rounded cursor-pointer transition-colors duration-150"
              onClick={() => {
                setActiveFilter(null);
                setFilterSearchQuery("");
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
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
                    const formattedValue = formatCellValue(value, column.field);
                    const cellStyle = column.field.includes("status")
                      ? getStatusStyle(value)
                      : {};

                    return (
                      <td
                        key={column.field}
                        className={`whitespace-nowrap px-1.5 py-2.5 text-sm ${
                          column.field.includes("amount") ||
                          column.field.includes("Amount")
                            ? "text-right"
                            : "text-gray-900"
                        }`}
                        style={cellStyle}
                        data-field={column.field}
                      >
                        {formattedValue}
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
                        onClick={() => onEdit && onEdit(row)}
                      >
                        <EditIcon className="w-5 h-5" />
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
