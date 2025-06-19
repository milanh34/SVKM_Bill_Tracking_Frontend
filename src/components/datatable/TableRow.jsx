import React from "react";
import { EditIcon, CheckIcon } from "../dashboard/Icons";
import CellRenderer from "./CellRenderer";

const TableRow = ({
  row,
  visibleColumns,
  selectedRows,
  editingRow,
  editedValues,
  editSubmitting,
  currentUserRole,
  regionOptions,
  onRowSelect,
  onEditClick,
  onAttachmentsClick,
  showActions,
  getNestedValue,
  formatCellValue,
  getStatusStyle,
  isDateField,
  isNumericField,
}) => {
  const isSelected = selectedRows.includes(row._id);
  const bgColor = isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50";

  return (
    <tr className={`${bgColor} transition duration-150 ease-in-out divide-x divide-gray-200`}>
      <td className="sticky left-0 z-20 whitespace-nowrap px-3 py-3 text-center">
        <div className={`absolute inset-0 ${isSelected ? "bg-blue-50" : "bg-white"} border-r border-blue-200`} style={{ bottom: "-1px", top: "-1px" }}></div>
        <div className="relative z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onRowSelect(row._id)}
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
              column.field.includes("amount") || column.field.includes("Amount")
                ? "text-right"
                : "text-gray-900"
            }`}
            style={column.field.includes("status") ? getStatusStyle(value) : {}}
            data-field={column.field}
          >
            <CellRenderer
              row={row}
              column={column}
              value={value}
              editingRow={editingRow}
              editedValues={editedValues}
              currentUserRole={currentUserRole}
              regionOptions={regionOptions}
              isDateField={isDateField}
              isNumericField={isNumericField}
              onAttachmentsClick={onAttachmentsClick}
              formatCellValue={formatCellValue}
            />
          </td>
        );
      })}

      {showActions && (
        <td className="sticky right-0 z-20 whitespace-nowrap px-1.5 py-2.5 text-center">
          <div className={`absolute inset-0 ${isSelected ? "bg-blue-50" : "bg-white"} border-l border-blue-200`} style={{ bottom: "-1px", top: "-1px" }}></div>
          <div className="relative z-10">
            <button
              className="rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => onEditClick(row)}
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
};

export default TableRow;