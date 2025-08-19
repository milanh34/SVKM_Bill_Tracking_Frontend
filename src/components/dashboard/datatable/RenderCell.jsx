import React, { useState, useEffect } from "react";
import {
  handleCellEdit,
  getEditableFields,
  formatCellValue,
} from "./datatableUtils";

const neverEditableFields = [
  "gstNumber",
  "compliance206AB",
  "panStatus",
  "srNo",
];

export function RenderCell({
  row,
  column,
  value,
  editingRow,
  currentUserRole,
  getColumnsForRole,
  editedValues,
  setEditedValues,
  isDateField,
  isNumericField,
  handleAttachments,
  regionOptions = [],
  natureOfWorkOptions = [],
  currencyOptions = [],
  vendorOptions = []
}) {
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorNoSearch, setVendorNoSearch] = useState("");
  const [vendorNoTouched, setVendorNoTouched] = useState(false);
  const isEditing = editingRow === row._id;
  const isEditable = getEditableFields(
    currentUserRole,
    getColumnsForRole
  ).includes(column.field);
  const isForceDisabled = neverEditableFields.includes(column.field);
  const editedValue = editedValues[row._id]?.[column.field];

  const prevEditingRef = React.useRef(false);
  const [initialVendorValue, setInitialVendorValue] = useState("");
  useEffect(() => {
    if (
      column.field === "vendorName" &&
      isEditing &&
      isEditable &&
      !prevEditingRef.current
    ) {
      const initVal = editedValue || value || "";
      setVendorSearch(initVal);
      setInitialVendorValue(initVal);
      prevEditingRef.current = true;
    }
    if (
      column.field === "vendorNo" &&
      isEditing &&
      isEditable &&
      !prevEditingRef.current
    ) {
      setVendorNoSearch(editedValue !== undefined ? editedValue : value || "");
      prevEditingRef.current = true;
    }
    if (!isEditing) {
      prevEditingRef.current = false;
    }
  }, [isEditing, column.field, isEditable]);

  useEffect(() => {
    if (
      column.field === "poNo" &&
      isEditing &&
      isEditable &&
      editedValues[row._id]
    ) {
      let poNo = editedValues[row._id].poNo || "";
      if (poNo.length > 10) {
        poNo = poNo.slice(0, 10);
        setEditedValues((prev) => ({
          ...prev,
          [row._id]: {
            ...prev[row._id],
            poNo,
          },
        }));
      }
      if (poNo.length === 10 && editedValues[row._id].poCreated !== "Yes") {
        setEditedValues((prev) => ({
          ...prev,
          [row._id]: {
            ...prev[row._id],
            poCreated: "Yes",
          },
        }));
      } else if (
        poNo.length !== 10 &&
        editedValues[row._id].poCreated !== "No"
      ) {
        setEditedValues((prev) => ({
          ...prev,
          [row._id]: {
            ...prev[row._id],
            poCreated: "No",
          },
        }));
      }
    }
  }, [editedValues[row._id]?.poNo, isEditing, isEditable]);

  if (column.field === "attachments") {
    if (isEditing && isEditable) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Add your attachment handling logic here
              console.log("Add attachment clicked for row:", row._id);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1 rounded transition-colors"
            title="Add attachment"
          >
            +
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center items-center">
          <svg
            style={{ cursor: "pointer" }}
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            onClick={() => handleAttachments(row._id)}
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
  }

  if (column.field === "accountsDept.hardCopy") {
    if (isEditing) {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || "No"}
          onChange={(e) =>
            handleCellEdit(
              column.field,
              e.target.value,
              row._id,
              setEditedValues
            )
          }
          className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      );
    } else {
      const displayValue = value || "No";
      return <div className="px-2 py-1">{displayValue}</div>;
    }
  }

  if (isEditing && isEditable) {
    if (column.field === "natureOfWork") {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || ""}
          onChange={(e) =>
            handleCellEdit(column.field, e.target.value, row._id, setEditedValues)
          }
          className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none${
            isForceDisabled ? " cursor-not-allowed" : ""
          }`}
          disabled={isForceDisabled}
        >
          <option value="" disabled>
            Select Nature of Work
          </option>
          {natureOfWorkOptions.map((option) => (
            <option key={option._id} value={option.natureOfWork}>
              {option.natureOfWork}
            </option>
          ))}
        </select>
      );
    }

    if (column.field === "currency") {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || ""}
          onChange={(e) =>
            handleCellEdit(column.field, e.target.value, row._id, setEditedValues)
          }
          className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none${
            isForceDisabled ? " cursor-not-allowed" : ""
          }`}
          disabled={isForceDisabled}
        >
          <option value="" disabled>
            Select Currency
          </option>
          {currencyOptions.map((option) => (
            <option
              key={option._id}
              value={option.code || option.currency || option.name}
            >
              {option.code || option.currency || option.name}
            </option>
          ))}
        </select>
      );
    }

    if (column.field === "vendorName") {
      const filteredVendors = vendorOptions.filter((v) =>
        v.vendorName.toLowerCase().includes((vendorSearch || "").toLowerCase())
      );
      const showSuggestions = vendorSearch && vendorSearch !== initialVendorValue;
      return (
        <div className="relative w-full">
          <input
            type="text"
            value={
              editedValues[row._id]?.vendorName !== undefined
                ? editedValues[row._id]?.vendorName
                : vendorSearch
            }
            onChange={(e) => {
              setVendorSearch(e.target.value);
              handleCellEdit("vendorName", e.target.value, row._id, setEditedValues);
            }}
            placeholder="Search Vendor..."
            className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none${
              isForceDisabled ? " cursor-not-allowed" : ""
            }`}
            disabled={isForceDisabled}
            autoComplete="off"
            onBlur={() => setTimeout(() => setVendorSearch(initialVendorValue), 200)}
          />
          {showSuggestions && (
            <div className="absolute z-50 bg-white border border-gray-200 rounded shadow max-h-40 overflow-y-auto w-full">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <div
                    key={vendor._id}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => {
                      setEditedValues((prev) => ({
                        ...prev,
                        [row._id]: {
                          ...prev[row._id],
                          vendorName: vendor.vendorName,
                          vendorNo: vendor.vendorNo?.toString() || "",
                          gstNumber: vendor.GSTNumber || "",
                          compliance206AB: vendor.complianceStatus || "",
                          panStatus: vendor.PANStatus || "",
                        },
                      }));
                      setVendorSearch(vendor.vendorName);
                      setInitialVendorValue(vendor.vendorName);
                      setVendorNoSearch(vendor.vendorNo?.toString() || "");
                    }}
                  >
                    {vendor.vendorName} - {vendor.vendorNo}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-400">No vendors found</div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (column.field === "vendorNo") {
      const filteredVendors = vendorOptions.filter((v) =>
        v.vendorNo.toString().startsWith(vendorNoSearch)
      );
      const showSuggestions = vendorNoTouched && vendorNoSearch.length > 3 && filteredVendors.length > 0;
      const handleVendorNoChange = (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 6) val = val.slice(0, 6);
        setVendorNoSearch(val);
        setVendorNoTouched(true);
        handleCellEdit("vendorNo", val, row._id, setEditedValues);
      };
      return (
        <div className="relative w-full">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{6}"
            value={
              editedValues[row._id]?.vendorNo !== undefined
                ? editedValues[row._id]?.vendorNo
                : vendorNoSearch
            }
            onChange={handleVendorNoChange}
            onFocus={() => setVendorNoTouched(true)}
            placeholder="Enter Vendor No..."
            className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none${isForceDisabled ? " cursor-not-allowed" : ""}`}
            disabled={isForceDisabled}
            autoComplete="off"
            maxLength={6}
          />
          {showSuggestions && (
            <div className="absolute z-50 bg-white border border-gray-200 rounded shadow max-h-40 overflow-y-auto w-full">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <div
                    key={vendor.vendorNo}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => {
                      setEditedValues((prev) => ({
                        ...prev,
                        [row._id]: {
                          ...prev[row._id],
                          vendorNo: vendor.vendorNo?.toString() || "",
                          vendorName: vendor.vendorName,
                          gstNumber: vendor.GSTNumber || "",
                          compliance206AB: vendor.complianceStatus || "",
                          panStatus: vendor.PANStatus || "",
                        },
                      }));
                      setVendorNoSearch(vendor.vendorNo?.toString() || "");
                      setVendorNoTouched(false);
                      setVendorSearch(vendor.vendorName);
                      setInitialVendorValue(vendor.vendorName);
                    }}
                  >
                    {vendor.vendorNo} - {vendor.vendorName}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-400">No vendors found</div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (column.field === "region") {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || ""}
          onChange={(e) =>
            handleCellEdit(column.field, e.target.value, row._id, setEditedValues)
          }
          className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none${
            isForceDisabled ? " cursor-not-allowed" : ""
          }`}
          disabled={isForceDisabled}
        >
          <option value="" disabled>
            Select Region
          </option>
          {regionOptions
            .filter((option) => !!option && option.trim() !== "")
            .map((region, idx) => (
              <option key={region + idx} value={region}>
                {region}
              </option>
            ))}
        </select>
      );
    }

    if (column.field === "siteStatus") {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || ""}
          onChange={e =>
            handleCellEdit(column.field, e.target.value, row._id, setEditedValues)
          }
          className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none${
            isForceDisabled ? " cursor-not-allowed" : ""
          }`}
          disabled={isForceDisabled}
        >
          <option value="" disabled>
            Select Site Status
          </option>
          <option value="accept">accept</option>
          <option value="reject">reject invoice</option>
          <option value="proforma">proforma invoice</option>
          <option value="hold">hold</option>
        </select>
      );
    }

    if (column.field === "poCreated") {
      return (
        <select
          value={editedValue !== undefined ? editedValue : value || ""}
          onChange={e =>
            handleCellEdit(column.field, e.target.value, row._id, setEditedValues)
          }
          className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none${
            isForceDisabled ? " cursor-not-allowed" : ""
          }`}
          disabled={isForceDisabled}
        >
          <option value="" disabled>
            Select Yes/No
          </option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
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
              handleCellEdit(
                column.field,
                e.target.value,
                row._id,
                setEditedValues
              )
            }
            className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400${
              isForceDisabled ? " cursor-not-allowed" : ""
            }`}
            disabled={isForceDisabled}
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
            handleCellEdit(
              column.field,
              e.target.value,
              row._id,
              setEditedValues
            )
          }
          className={`w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400${
            isForceDisabled ? " cursor-not-allowed" : ""
          }`}
          disabled={isForceDisabled}
        />
      </div>
    );
  }

  const formattedValue = formatCellValue(value, column.field);
  return (
    <div
      className={
        isEditing && isEditable
          ? "bg-blue-50 px-2 py-1 rounded border border-blue-200"
          : ""
      }
    >
      {formattedValue}
    </div>
  );
}
