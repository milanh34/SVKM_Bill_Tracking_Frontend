import React from "react";
import { getEditableFields } from "../../utils/dataTableUtils";

const CellRenderer = ({
  row,
  column,
  value,
  editingRow,
  editedValues,
  currentUserRole,
  regionOptions,
  isDateField,
  isNumericField,
  onAttachmentsClick,
  formatCellValue,
}) => {
  const isEditing = editingRow === row._id;
  const isEditable = getEditableFields(currentUserRole).includes(column.field);
  const editedValue = editedValues[row._id]?.[column.field];

  if (column.field === "attachments") {
    return (
      <div className="flex justify-center items-center">
        <svg
          style={{ cursor: 'pointer' }}
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          onClick={() => onAttachmentsClick(row._id)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.485 8.485l6.586-6.586"
          />
        </svg>
      </div>
    );
  }

  if (column.field === "accountsDept.hardCopy") {
    if (isEditing) {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || "No"}
          onChange={(e) =>
            handleCellEdit(column.field, e.target.value, row._id)
          }
          className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      );
    } else {
      const displayValue = value || "No";
      return (
        <div className="px-2 py-1">
          {displayValue}
        </div>
      );
    }
  }

  if (isEditing && isEditable) {
    if (column.field === "region") {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || ""}
          onChange={(e) =>
            handleCellEdit(column.field, e.target.value, row._id)
          }
          className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none"
        >
          <option value="" disabled>Select Region</option>
          {regionOptions.map((option) => (
            <option key={option._id} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      );
    }

    if (isDateField(column.field)) {
      const dateValue = editedValue !== undefined ? editedValue : value;
      let formattedDate = dateValue;

      if (dateValue) {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
        }
      }

      return (
        <div className="relative w-full">
          <input
            type="date"
            value={formattedDate || ""}
            onChange={(e) =>
              handleCellEdit(column.field, e.target.value, row._id)
            }
            className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      );
    }

    const inputType = isNumericField(column.field) ? "number" : "text";
    return (
      <div className="relative w-full">
        <input
          type={inputType}
          value={editedValue !== undefined ? editedValue : value || ""}
          onChange={(e) =>
            handleCellEdit(column.field, e.target.value, row._id)
          }
          className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    );
  }

  const formattedValue = formatCellValue(value, column.field);
  return (
    <div
      className={`${isEditing && isEditable
        ? "bg-blue-50 px-2 py-1 rounded border border-blue-200"
        : ""
        }`}
    >
      {formattedValue}
    </div>
  );
};

export default CellRenderer;