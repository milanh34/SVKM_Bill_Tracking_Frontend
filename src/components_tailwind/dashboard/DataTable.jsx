import React, { useState, useEffect, useMemo } from "react";
import { EditIcon, SortAscIcon, SortDescIcon, Filter } from "./Icons";

const FILTER_OPERATORS = [
  { value: "contains", label: "Contains" },
  { value: "notContains", label: "Not contains" },
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

  const applyFilter = (value, filterValue, operator) => {
    if (!value) return false;
    const stringValue = value.toString().toLowerCase();
    const filterString = filterValue.toLowerCase();
    switch (operator) {
      case "contains":
        return stringValue.includes(filterString);
      case "notContains":
        return !stringValue.includes(filterString);
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
        if (!filter?.value) return true;
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
    if (onPaginatedDataChange) {
      onPaginatedDataChange(sortedData.length);
    }
    return sortedData.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedData, currentPage, itemsPerPage, onPaginatedDataChange]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatCellValue = (value, field) => {
    if (value === undefined || value === null) return "-";
    if (
      field.includes("date") ||
      field.includes("Date") ||
      field.endsWith("Dt") ||
      field.endsWith("_dt")
    ) {
      return formatDate(value);
    }
    if (
      field.includes("amount") ||
      field.includes("Amount") ||
      field.includes("Amt") ||
      field.includes("amt")
    ) {
      if (typeof value === "number") {
        return formatCurrency(value);
      }
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
    } else if (statusLower.includes("pend") || statusLower === "waiting") {
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
    }
  };

  const handleFilterClick = (field, event) => {
    event.stopPropagation();
    setActiveFilter(activeFilter === field ? null : field);
  };

  const handleFilterChange = (field, operator, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [field]: { operator, value },
    }));
  };

  const handleFilterClear = (field) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col border border-gray-200 rounded-lg">
      <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
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
          <thead className="sticky top-0 z-30 bg-gray-50">
            <tr className="divide-x divide-gray-200">
              <th className="sticky left-0 z-40 w-12 bg-blue-50 px-1.5 py-2.5 border-b border-gray-200">
                <div className="absolute inset-0 bg-blue-50 border-r border-blue-200"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={onSelectAll}
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
                      {columnFilters[column.field] && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-1">
                          Filtered
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
                        className="p-1 hover:bg-gray-200 rounded-md"
                      >
                        <Filter
                          className={`w-4 h-4 ${
                            columnFilters[column.field]
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  {activeFilter === column.field && (
                    <div
                      className="absolute mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3 min-w-[250px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-3">
                        <select
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          value={
                            columnFilters[column.field]?.operator || "contains"
                          }
                          onChange={(e) =>
                            handleFilterChange(
                              column.field,
                              e.target.value,
                              columnFilters[column.field]?.value || ""
                            )
                          }
                        >
                          {FILTER_OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="Filter value..."
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          value={columnFilters[column.field]?.value || ""}
                          onChange={(e) =>
                            handleFilterChange(
                              column.field,
                              columnFilters[column.field]?.operator ||
                                "contains",
                              e.target.value
                            )
                          }
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            className="px-2 py-1 text-xs bg-[#011a99] text-white hover:bg-[#015099] rounded"
                            onClick={() => setActiveFilter(null)}
                          >
                            Apply
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                            onClick={() => {
                              handleFilterClear(column.field);
                              setActiveFilter(null);
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </th>
              ))}
              <th className="sticky right-0 z-40 w-16 bg-blue-50 px-1.5 py-2.5 border-b border-gray-200">
                <div className="absolute inset-0 bg-blue-50 border-l border-blue-200"></div>
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
                      className={`absolute inset-0 ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      } border-r border-blue-200`}
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
                      className={`absolute inset-0 ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      } border-l border-blue-200`}
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
