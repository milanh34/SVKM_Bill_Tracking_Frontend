import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  EditIcon,
  SortAscIcon,
  SortDescIcon,
  Filter,
  CheckIcon,
} from "./Icons";
import { getColumnsForRole } from "../../utils/columnEdit";
import { bills, deleteAttachments } from "../../apis/bills.api";
import axios from "axios";
import { toast } from "react-toastify";
import {
  getNestedValue,
  isDateField,
  isNumericField,
  applyFilter,
  requestSort,
  getStatusStyle,
  formatCellValue,
} from "./datatable/datatableUtils";
import { renderFilterPopup } from "./datatable/FilterPopup";
import { RenderCell } from "./datatable/RenderCell";
import { FileImage, FileText, File, FileVideo, FileAudio, Plus, Trash2 } from "lucide-react";

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
  onPageChange,
  itemsPerPage,
  onPaginatedDataChange,
  searchQuery,
  currentUserRole,
  regionOptions,
  natureOfWorkOptions,
  currencyOptions,
  vendorOptions,
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
  const [uploadModal, setUploadModal] = useState({ open: false, rowId: null });
  const [uploadFiles, setUploadFiles] = useState([]);
  const [viewAttachments, setViewAttachments] = useState(false);
  const [allAttachments, setAllAttachments] = useState([
    "https://demolink1.com",
    "https://demolink2.com",
    "https://demolink3.com",
  ]);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    show: false,
    fileKey: null,
    billId: null,
    fileName: null
  });

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

  // ** DO NOT DELETE THIS CODE BLOCK **
  // const filteredData = useMemo(() => {
  //   return data.filter((row) => {
  //     if (searchQuery) {
  //       const searchLower = searchQuery.toLowerCase();
  //       const isMatchingSearch = visibleColumns.some((column) => {
  //         const value = getNestedValue(row, column.field);
  //         return value && value.toString().toLowerCase().includes(searchLower);
  //       });
  //       if (!isMatchingSearch) return false;
  //     }

  //     return Object.entries(columnFilters).every(([field, filter]) => {
  //       const value = getNestedValue(row, field);
  //       if (value === null || value === undefined) return false;

  //       if (isNumericField(field)) {
  //         const numValue = parseFloat(value);
  //         if (isNaN(numValue)) return false;

  //         if (filter?.range) {
  //           const min =
  //             filter.range.min !== ""
  //               ? parseFloat(filter.range.min)
  //               : -Infinity;
  //           const max =
  //             filter.range.max !== "" ? parseFloat(filter.range.max) : Infinity;
  //           return numValue >= min && numValue <= max;
  //         }
  //         return true;
  //       }

  //       if (
  //         !filter?.value ||
  //         (Array.isArray(filter.value) && filter.value.length === 0)
  //       ) {
  //         return true;
  //       }

  //       return applyFilter(
  //         value,
  //         filter.value,
  //         filter.operator,
  //         field,
  //         filterType,
  //         columnFilters,
  //         dateRanges
  //       );
  //     });
  //   });
  // }, [data, searchQuery, columnFilters, visibleColumns]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const passesColumnFilters = Object.entries(columnFilters).every(([field, filter]) => {
        const value = getNestedValue(row, field);
        return applyFilter(value, filter.value, filter.operator, field, filterType, columnFilters, dateRanges);
      });

      const passesSearch = !searchQuery || visibleColumns.some(column => {
        const value = getNestedValue(row, column.field);
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      });

      return passesColumnFilters && passesSearch;
    });
  }, [data, columnFilters, searchQuery, visibleColumns, filterType, dateRanges]);

  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(totalPages);
    }
  }, [filteredData, currentPage, itemsPerPage, onPageChange]);

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

  const handleAttachments = (value) => {
    if (Array.isArray(value) && value.length > 0) {
      const files = value
        .map(obj =>
          obj && typeof obj === "object" && obj.fileUrl
            ? { url: obj.fileUrl, name: obj.fileName || "" }
            : null
        )
        .filter(obj => obj && typeof obj.url === "string" && obj.url.length > 0);
        console.log(files);
      setAllAttachments(files);
    } else {
      setAllAttachments([]);
    }
    setViewAttachments(true);
  };

  const handleFileInputChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setUploadFiles((prev) => {
      const existingNames = new Set(prev.map(f => f.name));
      return [...prev, ...newFiles.filter(f => !existingNames.has(f.name))];
    });
  };

  const handleRemoveUploadFile = (idx) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateVendorNo = (x) => /^[0-9]{6}$/.test(x);
  const validatePoNo = (x) => /^[0-9]{10}$/.test(x);
  const validateTaxInvNo = (x) => /^[a-zA-Z0-9]{0,16}$/.test(x);

  const handleEditClick = async (row) => {
    if (editingRow === row._id) {
      const editedFieldsForRow = editedValues[row._id];

      if (
        editedFieldsForRow.vendorNo && !validateVendorNo(editedFieldsForRow.vendorNo)
      ) {
        toast.error("Vendor No should be 6 digits");
        return;
      }
      if (editedFieldsForRow.poNo && !validatePoNo(editedFieldsForRow.poNo)) {
        toast.error("PO Number should be 10 Digits");
        return;
      }
      if (editedFieldsForRow.taxInvNo && !validateTaxInvNo(editedFieldsForRow.taxInvNo)) {
        toast.error("Tax Invoice Number can be max 16 characters");
        return;
      }

      let response;
      if (uploadFiles.length > 0) {
        const formData = new FormData();
        Object.entries(editedFieldsForRow).forEach(([key, value]) => {
          formData.append(key, value);
        });
        uploadFiles.forEach((file) => formData.append("files", file));
        try {
          setEditSubmitting(true);
          response = await axios.patch(`${bills}/${row._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (err) {
          toast.error(
            err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to upload attachments"
          );
          setEditSubmitting(false);
          return;
        }
      } else {
        const payload = { ...editedFieldsForRow };
        delete payload.billId;
        delete payload._id;
        delete payload.srNo;

        if (Object.keys(payload).length > 0) {
          try {
            setEditSubmitting(true);
            response = await axios.patch(`${bills}/${row._id}`, payload);
          } catch (err) {
            console.error("Edit error:", err);
            const errorMessage =
              err.response?.data?.error ||
              err.response?.data?.message ||
              "Failed to update bill";
            toast.error(errorMessage);

            if (err.response?.data?.errors) {
              Object.values(err.response.data.errors).forEach((error) => {
                toast.error(error);
              });
            }
            setEditSubmitting(false);
            return;
          }
        }
      }

      if (response && (response.status === 200 || response.data?.success)) {
        toast.success("Bill updated successfully!");
        onEdit && onEdit();
      } else if (response && response.status !== 200) {
        toast.info("No changes were made to the bill");
      }

      setEditingRow(null);
      setEditedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[row._id];
        return newValues;
      });
      setUploadFiles([]);
      setEditSubmitting(false);
    } else {
      setEditingRow(row._id);
      setEditedValues((prev) => ({
        ...prev,
        [row._id]: {},
      }));
    }
  };

  const handleDeleteClick = (fileKey, billId, fileName) => {
    setDeleteConfirmModal({
      show: true,
      fileKey,
      billId,
      fileName
    });
  };

  const handleDeleteConfirm = async () => {
    const { fileKey, billId } = deleteConfirmModal;
    
    console.log('Deleting attachment with:', { fileKey, billId }); // Debug log
    
    try {
      const response = await axios.post(deleteAttachments, {
        billId,
        fileKey
      });

      if (response.data?.success) {
        toast.success("Attachment deleted successfully");

        const updatedAttachments = allAttachments.filter(file => file.url?.split(".com/")[1] !== fileKey);
        setAllAttachments(updatedAttachments);
        
        const rowIndex = data.findIndex(row => row._id === billId);
        if (rowIndex !== -1) {
          onEdit && onEdit();
        }

        if (updatedAttachments.length === 0) {
          setViewAttachments(false);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete attachment");
    } finally {
      setDeleteConfirmModal({ show: false, fileKey: null, billId: null, fileName: null });
    }
  };

  const grandTotals = useMemo(() => {
    const sum = (field) =>
      filteredData.reduce((acc, row) => {
        const val = getNestedValue(row, field);
        const num = parseFloat(val);
        return !isNaN(num) ? acc + num : acc;
      }, 0);
    return {
      taxInvAmt: sum("taxInvAmt"),
      copDetailsAmount: sum("copDetails.amount"),
      accountsDeptPaymentAmt: sum("accountsDept.paymentAmt"),
      poAmt: sum("poAmt"),
    };
  }, [filteredData]);

  const getFileTypeIcon = (url) => {
    if (!url) return <File className="w-8 h-8 text-gray-400" />;
    const ext = url.split('.').pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    }
    if (["pdf"].includes(ext)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (["doc", "docx", "odt", "rtf"].includes(ext)) {
      return <FileText className="w-8 h-8 text-blue-700" />;
    }
    if (["xls", "xlsx", "csv"].includes(ext)) {
      return <FileText className="w-8 h-8 text-green-600" />;
    }
    if (["mp4", "avi", "mov", "wmv", "webm", "mkv"].includes(ext)) {
      return <FileVideo className="w-8 h-8 text-purple-500" />;
    }
    if (["mp3", "wav", "ogg", "aac"].includes(ext)) {
      return <FileAudio className="w-8 h-8 text-orange-500" />;
    }
    return <File className="w-8 h-8 text-gray-400" />;
  };

  const getDisplayFileName = (name, url) => {
    let fileName = name;
    if (!fileName && url) {
      try {
        fileName = decodeURIComponent(url.split("/").pop().split("?")[0]);
      } catch {
        fileName = url;
      }
    }
    if (!fileName) return "";
    return fileName.length > 30 ? fileName.slice(0, 27) + "..." : fileName;
  };

  return (
    <div
      className={`relative w-full flex flex-col border border-gray-200 rounded-lg ${data.length > 8 ? "h-full" : ""
        }`}
    >
      {uploadModal.open && (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative border border-blue-200">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold cursor-pointer"
              onClick={() => {
                setUploadModal({ open: false, rowId: null });
                setUploadFiles([]);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-600" />
              Upload Attachments
            </h2>
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center px-4 py-2 bg-blue-50 border border-blue-400 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Add Files</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2 text-center">
                You can add multiple files (max 15). Only new files will be added.
              </p>
            </div>
            <div className="mb-4">
              {uploadFiles.length === 0 ? (
                <div className="text-gray-400 text-center py-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  No files selected.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-gray-50 max-h-40 overflow-y-auto">
                  {uploadFiles.map((file, idx) => (
                    <li
                      key={file.name + idx}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <span className="truncate text-gray-800 text-sm">{file.name}</span>
                      <button
                        className="ml-2 text-red-500 hover:bg-red-100 rounded-full p-1 transition cursor-pointer"
                        title="Remove"
                        onClick={() => handleRemoveUploadFile(idx)}
                        aria-label="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                onClick={() => setUploadModal({ open: false, rowId: null })}
                disabled={uploadFiles.length === 0}
              >
                Done
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                onClick={() => {
                  setUploadModal({ open: false, rowId: null });
                  setUploadFiles([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {viewAttachments && (
        <div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl font-bold cursor-pointer"
              onClick={() => setViewAttachments(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <File className="w-6 h-6 text-blue-600" />
              Attachments
            </h2>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {allAttachments.length === 0 && (
                  <div className="col-span-full text-gray-500 text-center py-4">
                    No attachments found.
                  </div>
                )}
                {allAttachments.map((file, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition relative group"
                  >
                    {editingRow && (
                      <button
                        onClick={() => handleDeleteClick(file.url?.split(".com/")[1], editingRow, file.name || getDisplayFileName(file.name, file.url))}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-lg bg-white shadow-sm border border-gray-200 hover:cursor-pointer"
                        title="Delete attachment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center group space-y-2"
                      title={getDisplayFileName(file.name, file.url)}
                    >
                      {getFileTypeIcon(file.url)}
                      <span className="text-sm text-gray-700 text-center break-words w-full group-hover:underline">
                        {getDisplayFileName(file.name, file.url)}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirmModal.fileName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ show: false, fileKey: null, billId: null, fileName: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full ${data.length < 10 ? "h-fit" : "flex-1"
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
                <div
                  className="absolute inset-0 bg-blue-50 border-r border-blue-200"
                  style={{ bottom: "-1px", zIndex: -1 }}
                ></div>
                <div className="relative z-10 flex flex-col items-center">
                  <input
                    type="checkbox"
                    checked={selectAllState}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                  onClick={() => requestSort(column.field, onSort)}
                  className={`
                    ${column.field === "srNo" ? "sticky left-10 z-100" : ""}
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
                        (columnFilters[column.field].value?.length > 0 ||
                          (isNumericField(column.field) &&
                            columnFilters[column.field].range)) && (
                          <div className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded ml-1">
                            {isNumericField(column.field) &&
                              columnFilters[column.field].range
                              ? `${Object.values(
                                columnFilters[column.field].range
                              ).filter((val) => val !== "").length
                              } selected`
                              : `${columnFilters[column.field].value.length
                              } selected`}
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
                          className={`w-4 h-4 ${columnFilters[column.field]?.value?.length > 0
                              ? "text-blue-500"
                              : "text-gray-400 hover:text-gray-600"
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                  {activeFilter === column.field &&
                    renderFilterPopup(
                      column,
                      data,
                      columnFilters,
                      filterRef,
                      filterType,
                      setFilterType,
                      dateRanges,
                      setDateRanges,
                      pendingAmountFilters,
                      setPendingAmountFilters,
                      setActiveFilter,
                      setColumnFilters,
                      filterSearchQuery,
                      setFilterSearchQuery,
                      filterPosition,
                      onPageChange,
                    )}
                </th>
              ))}
              {showActions && (
                <th className="sticky right-0 top-0 z-50 w-16 bg-blue-50 px-1.5 py-2.5 border-b border-gray-200">
                  <div
                    className="absolute inset-0 bg-blue-50 border-l border-blue-200"
                    style={{ bottom: "-1px", zIndex: -1 }}
                  ></div>
                  <div className="relative z-10 text-center">Actions</div>
                </th>
              )}
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
                      className={`absolute inset-0 ${isSelected ? "bg-blue-50" : "bg-white"
                        } border-r border-blue-200`}
                      style={{ bottom: "-1px", top: "-1px" }}
                    ></div>
                    <div className="relative z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelect(row._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </td>

                  {visibleColumns.map((column, key) => {
                    const value = getNestedValue(row, column.field);
                    return (
                      <td
                        key={column.field}
                        className={`${column.field === "srNo" ? "sticky left-10 bg-[#fff]" : ""} whitespace-nowrap px-1.5 py-2.5 text-sm ${column.field.includes("amount") ||
                            column.field.includes("Amount")
                            ? "text-right"
                            : "text-gray-900"
                          }`}
                        style={
                          column.field.includes("status")
                            ? getStatusStyle(value)
                            : {}
                        }
                        data-field={column.field}
                      >
                        {column.field === "attachments" ? (
                          editingRow === row._id ? (
                            <div className="flex justify-center items-center gap-2">
                              {Array.isArray(value) && value.length > 0 ? (
                                <svg
                                  style={{ cursor: "pointer" }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  onClick={() => handleAttachments(value)}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.485 8.485l6.586-6.586"
                                  />
                                </svg>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                              <button
                                type="button"
                                className="ml-1 p-1 border border-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 cursor-pointer"
                                title="Add attachments"
                                onClick={() =>
                                  setUploadModal({ open: true, rowId: row._id })
                                }
                              >
                                <Plus className="w-5 h-5 text-blue-600" />
                              </button>
                            </div>
                          ) : (
                            (!Array.isArray(value) || value.length === 0) ? (
                              <span className="text-gray-400 flex justify-center items-center">-</span>
                            ) : (
                              <div className="flex justify-center items-center">
                                <svg
                                  style={{ cursor: "pointer" }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-blue-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  onClick={() => handleAttachments(value)}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.485 8.485l6.586-6.586"
                                  />
                                </svg>
                              </div>
                            )
                          )
                        ) : (
                          <RenderCell
                            row={row}
                            column={column}
                            value={value}
                            editingRow={editingRow}
                            currentUserRole={currentUserRole}
                            getColumnsForRole={getColumnsForRole}
                            editedValues={editedValues}
                            setEditedValues={setEditedValues}
                            regionOptions={regionOptions}
                            isDateField={isDateField}
                            isNumericField={isNumericField}
                            handleAttachments={handleAttachments}
                            natureOfWorkOptions={natureOfWorkOptions}
                            currencyOptions={currencyOptions}
                            vendorOptions={vendorOptions}
                          />
                        )}
                      </td>
                    );
                  })}
                  {showActions && (
                    <td className="sticky right-0 z-20 whitespace-nowrap px-1.5 py-2.5 text-center">
                      <div
                        className={`absolute inset-0 ${isSelected ? "bg-blue-50" : "bg-white"
                          } border-l border-blue-200`}
                        style={{ bottom: "-1px", top: "-1px" }}
                      ></div>
                      <div className="relative z-10">
                        <button
                          className="rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          onClick={() => handleEditClick(row)}
                          disabled={editSubmitting && editingRow === row._id}
                        >
                          {editingRow === row._id ? (
                            editSubmitting ? (
                              <span className="inline-block animate-spin">
                                <svg
                                  className="w-5 h-5 text-green-500"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              </span>
                            ) : (
                              <CheckIcon className="w-5 h-5 text-green-500" />
                            )
                          ) : (
                            <EditIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            <tr className="bg-blue-100/75 font-bold">
              <td className="sticky left-0 z-20 whitespace-nowrap px-3 py-3 text-center"></td>
              {visibleColumns.map((column) => {
                if (column.field === "taxInvAmt") {
                  return (
                    <td
                      key={column.field}
                      className="whitespace-nowrap px-1.5 py-2.5 text-sm border-l border-r border-gray-300"
                    >
                      {formatCellValue(grandTotals.taxInvAmt, "taxInvAmt")}
                    </td>
                  );
                }
                if (column.field === "copDetails.amount") {
                  return (
                    <td
                      key={column.field}
                      className="whitespace-nowrap px-1.5 py-2.5 text-sm border-l border-r border-gray-300"
                    >
                      {formatCellValue(grandTotals.copDetailsAmount, "copDetails.amount")}
                    </td>
                  );
                }
                if (column.field === "accountsDept.paymentAmt") {
                  return (
                    <td
                      key={column.field}
                      className="whitespace-nowrap px-1.5 py-2.5 text-sm border-l border-r border-gray-300"
                    >
                      {formatCellValue(grandTotals.accountsDeptPaymentAmt, "accountsDept.paymentAmt")}
                    </td>
                  );
                }
                if (column.field === "poAmt") {
                  return (
                    <td
                      key={column.field}
                      className="whitespace-nowrap px-1.5 py-2.5 text-sm border-l border-r border-gray-300"
                    >
                      {formatCellValue(grandTotals.poAmt, "poAmt")}
                    </td>
                  );
                }
                if (
                  visibleColumns.findIndex((col) => col.field === column.field) === 0
                ) {
                  return (
                    <td
                      key={column.field}
                      className="whitespace-nowrap px-1.5 py-2.5 text-sm text-left border-r border-gray-300"
                    >
                      Grand Total
                    </td>
                  );
                }
                return (
                  <td
                    key={column.field}
                    className="whitespace-nowrap px-1.5 py-2.5 text-sm"
                  ></td>
                );
              })}
              {showActions && (
                <td className="sticky right-0 z-20 whitespace-nowrap px-1.5 py-2.5 text-center"></td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
