import React, { useState, useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { getColumnsForRole } from "../../utils/columnEdit";
import { bills } from "../../apis/bills.api";
import axios from "axios";
import { toast } from "react-toastify";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import AttachmentsModal from "./AttachmentsModal";
import {
  applyFilter,
  formatCellValue,
  getNestedValue,
  getStatusStyle,
  isDateField,
  isNumericField,
} from "../../utils/dataTableUtils";
import { validateVendorNo, validatePoNo } from "../../utils/validationUtils";

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
  regionOptions,
  showActions = true,
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
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [pendingAmountFilters, setPendingAmountFilters] = useState({});
  const [viewAttachments, setViewAttachments] = useState(false);
  const [allAttachments, setAllAttachments] = useState([]);

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
      if (event.key === "Escape" && editingRow) {
        setEditingRow(null);
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[editingRow];
          return newValues;
        });
      }
    };

    window.addEventListener("keydown", handleGlobalEscape);
    return () => window.removeEventListener("keydown", handleGlobalEscape);
  }, [editingRow]);

  const visibleColumns = useMemo(() => {
    return availableColumns.filter((col) =>
      visibleColumnFields.includes(col.field)
    );
  }, [availableColumns, visibleColumnFields]);

  const { filteredData, sortedData, displayData } = useMemo(() => {
    const filtered = data.filter((row) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const isMatchingSearch = visibleColumns.some((column) => {
          const value = getNestedValue(row, column.field);
          return value && value.toString().toLowerCase().includes(searchLower);
        });
        if (!isMatchingSearch) return false;
      }

      return Object.entries(columnFilters).every(([field, filter]) => {
        const value = getNestedValue(row, field);
        if (value === null || value === undefined) return false;
        return applyFilter(value, filter, field, isNumericField, isDateField);
      });
    });

    const sorted = [...filtered].sort((a, b) => {
      if (!sortConfig.key || !sortConfig.direction) return 0;
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const display = sorted.slice(indexOfFirstItem, indexOfLastItem);

    return { filteredData: filtered, sortedData: sorted, displayData: display };
  }, [data, searchQuery, columnFilters, visibleColumns, sortConfig, currentPage, itemsPerPage]);

  useEffect(() => {
    if (onPaginatedDataChange) {
      onPaginatedDataChange(sortedData.length);
    }
  }, [sortedData, onPaginatedDataChange]);

  useEffect(() => {
    setSelectAll(false);
  }, [columnFilters, searchQuery]);

  const handleAttachments = (id) => {
    if (data[id].attachments?.length > 0) {
      setAllAttachments(data[id].attachments);
    }
    setViewAttachments(true);
  };

  const handleEditClick = async (row) => {
    if (editingRow === row._id) {
      const editedFieldsForRow = editedValues[row._id];

      if (editedFieldsForRow.vendorNo && !validateVendorNo(editedFieldsForRow.vendorNo)) {
        toast.error('Vendor Number should be 6 Numbers');
        return;
      }
      if (editedFieldsForRow.poNo && !validatePoNo(editedFieldsForRow.poNo)) {
        toast.error('PO Number should be 10 Digits');
        return;
      }

      const payload = { ...editedFieldsForRow };
      delete payload.billId;
      delete payload._id;
      delete payload.srNo;

      if (Object.keys(payload).length > 0) {
        try {
          setEditSubmitting(true);
          const response = await axios.put(`${bills}/${row._id}`, payload);

          if (response.status === 200) {
            toast.success("Bill updated successfully!");
            onEdit && onEdit();
          } else {
            toast.info("No changes were made to the bill");
          }

          setEditingRow(null);
          setEditedValues((prev) => {
            const newValues = { ...prev };
            delete newValues[row._id];
            return newValues;
          });
        } catch (err) {
          console.error("Edit error:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to update bill";
          toast.error(errorMessage);

          if (err.response?.data?.errors) {
            Object.values(err.response.data.errors).forEach((error) => {
              toast.error(error);
            });
          }
        } finally {
          setEditSubmitting(false);
        }
      } else {
        setEditingRow(null);
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[row._id];
          return newValues;
        });
      }
    } else {
      setEditingRow(row._id);
      setEditedValues((prev) => ({
        ...prev,
        [row._id]: {},
      }));
    }
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

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);

    if (isChecked) {
      const filteredIds = filteredData.map((row) => row._id);
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
    const tableBottom = event.currentTarget
      .closest(".overflow-x-auto")
      .getBoundingClientRect().bottom;
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

  return (
    <div className={`relative w-full flex flex-col border border-gray-200 rounded-lg ${data.length > 8 ? "h-full" : ""}`}>
      <AttachmentsModal 
        isOpen={viewAttachments} 
        onClose={() => setViewAttachments(false)} 
        attachments={allAttachments} 
      />
      
      <div className={`overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full ${data.length < 10 ? "h-fit" : "flex-1"}`}>
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
          <TableHeader 
            visibleColumns={visibleColumns}
            columnFilters={columnFilters}
            sortConfig={sortConfig}
            selectAllState={selectAllState}
            totalSelected={totalSelected}
            totalItems={totalItems}
            onSort={onSort}
            onSelectAll={handleSelectAll}
            onFilterClick={handleFilterClick}
            activeFilter={activeFilter}
            filterRef={filterRef}
            filterPosition={filterPosition}
            filterSearchQuery={filterSearchQuery}
            setFilterSearchQuery={setFilterSearchQuery}
            isNumericField={isNumericField}
            isDateField={isDateField}
            data={data}
            filterType={filterType}
            setFilterType={setFilterType}
            dateRanges={dateRanges}
            setDateRanges={setDateRanges}
            pendingAmountFilters={pendingAmountFilters}
            setPendingAmountFilters={setPendingAmountFilters}
            showActions={showActions}
            handleFilterChange={handleFilterChange}
            handleFilterClear={handleFilterClear}
          />
          
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayData.map((row) => (
              <TableRow
                key={row._id}
                row={row}
                visibleColumns={visibleColumns}
                selectedRows={selectedRows}
                editingRow={editingRow}
                editedValues={editedValues}
                editSubmitting={editSubmitting}
                currentUserRole={currentUserRole}
                regionOptions={regionOptions}
                onRowSelect={handleRowSelect}
                onEditClick={handleEditClick}
                onAttachmentsClick={handleAttachments}
                showActions={showActions}
                getNestedValue={getNestedValue}
                formatCellValue={formatCellValue}
                getStatusStyle={getStatusStyle}
                isDateField={isDateField}
                isNumericField={isNumericField}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;