import { getUniqueValues, isDateField, isNumericField } from "./datatableUtils";
import { X } from "lucide-react";

export const renderFilterPopup = (
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
  onPageChange
) => {
  const uniqueValues = getUniqueValues(data, column.field);
  const currentFilter = columnFilters[column.field] || {
    operator: "multiSelect",
    value: [],
  };
  const maxHeight = filterRef.current?.maxHeight || 400;
  const isDate = isDateField(column.field);
  const isAmount = isNumericField(column.field);
  const currentFilterType = filterType[column.field] || "individual";
  const currentDateRange = dateRanges[column.field] || { from: "", to: "" };
  const currentAmountRange = columnFilters[column.field]?.range || {
    min: "",
    max: "",
  };

  const compareValuesAsc = (a, b) => {
    if (a === b) return 0;

    if (a === "") return -1;
    if (b === "") return 1;

    if (isDate) {
      const parseDMY = (v) => {
        if (typeof v !== "string") return null;
        const m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (m) {
          const d = parseInt(m[1], 10);
          const mon = parseInt(m[2], 10) - 1;
          const y = parseInt(m[3], 10);
          return new Date(y, mon, d);
        }
        const dObj = new Date(v);
        return isNaN(dObj.getTime()) ? null : dObj;
      };
      const da = parseDMY(a);
      const db = parseDMY(b);
      if (da && db) return da - db;
      if (da && !db) return -1;
      if (!da && db) return 1;
      return String(a).localeCompare(String(b));
    }

    if (isAmount) {
      const toNum = (v) => {
        if (v === null || v === undefined) return NaN;
        const s = String(v).replace(/[^0-9.-]+/g, "");
        return parseFloat(s);
      };
      const na = toNum(a);
      const nb = toNum(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      if (!isNaN(na) && isNaN(nb)) return -1;
      if (isNaN(na) && !isNaN(nb)) return 1;
      return String(a).localeCompare(String(b));
    }

    return String(a).localeCompare(String(b));
  };

  const getDisplayedValues = (valuesArray) => {
    return valuesArray
      .filter((value) =>
        String(value).toLowerCase().includes(filterSearchQuery.toLowerCase())
      )
      .slice()
      .sort(compareValuesAsc);
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

  if (isAmount) {
    const pendingFilter = pendingAmountFilters[column.field] || {
      min: "",
      max: "",
    };

    const currentAmountMode = filterType[column.field] || "individual";
    const includeBlank = columnFilters[column.field]?.includeBlank || false;

    return (
      <div
        ref={filterRef}
        className="absolute mt-2.5 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-[250px] flex flex-col"
        style={{ maxHeight: `${Math.min(maxHeight, 400)}px`, minHeight: "250px" }}
        onClick={(e) => e.stopPropagation()}
      >
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

          <div className="mt-2">
            <select
              value={currentAmountMode}
              onChange={(e) =>
                setFilterType((prev) => ({ ...prev, [column.field]: e.target.value }))
              }
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="individual">Select Individual Values</option>
              <option value="range">Select Range</option>
            </select>
          </div>

          {currentAmountMode === "individual" && (
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
        </div>

        {currentAmountMode === "individual" && (
          <div className="flex-1 overflow-y-auto p-2 bg-white" style={{ maxHeight: '200px' }}>
            {uniqueValues
              .filter((value) =>
                value.toLowerCase().includes(filterSearchQuery.toLowerCase())
              )
              .slice()
              .sort(compareValuesAsc)
              .map((value) => (
                <label
                  key={value}
                  className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={currentFilter.value?.includes(value)}
                    onChange={(e) => {
                      let newValues = e.target.checked
                        ? [...(currentFilter.value || []), value]
                        : (currentFilter.value || []).filter((v) => v !== value);
                      if (newValues.length === 0) {
                        handleFilterClear(column.field);
                      } else {
                        handleFilterChange(column.field, "multiSelect", newValues);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{value}</span>
                </label>
              ))}
            {uniqueValues.length === 0 && (
              <div className="text-gray-500 text-sm text-center py-2">No values found</div>
            )}
          </div>
        )}

        {currentAmountMode === "range" && (
          <div className="flex-1 overflow-y-auto p-3 bg-white">
            <div className="mb-3">
              <label className="text-xs text-gray-500">Minimum Amount</label>
              <input
                type="number"
                value={pendingFilter.min}
                onChange={(e) => {
                  const value = e.target.value;
                  setPendingAmountFilters((prev) => ({
                    ...prev,
                    [column.field]: {
                      ...pendingFilter,
                      min: value,
                    },
                  }));
                }}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="Enter minimum amount"
              />
            </div>
            <div className="mb-3">
              <label className="text-xs text-gray-500">Maximum Amount</label>
              <input
                type="number"
                value={pendingFilter.max}
                onChange={(e) => {
                  const value = e.target.value;
                  setPendingAmountFilters((prev) => ({
                    ...prev,
                    [column.field]: {
                      ...pendingFilter,
                      max: value,
                    },
                  }));
                }}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                placeholder="Enter maximum amount"
              />
            </div>
          </div>
        )}

        <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 p-2 flex justify-between gap-2">
          <button
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            onClick={() => {
              handleFilterClear(column.field);
              setPendingAmountFilters((prev) => {
                const newFilters = { ...prev };
                delete newFilters[column.field];
                return newFilters;
              });
              onPageChange(1);
              setActiveFilter(null);
            }}
          >
            Clear
          </button>
          <button
            className="px-2 py-1 text-xs bg-[#011a99] text-white hover:bg-[#015099] rounded"
            onClick={() => {
              const pending = pendingAmountFilters[column.field];

              if (currentAmountMode === "range") {
                if (pending && (pending.min !== "" || pending.max !== "")) {
                  setColumnFilters((prev) => ({
                    ...prev,
                    [column.field]: {
                      operator: "range",
                      range: pending || { min: "", max: "" },
                    },
                  }));
                  onPageChange(1);
                } else {
                  handleFilterClear(column.field);
                  onPageChange(1);
                }
              } else {
                if (currentFilter.value && currentFilter.value.length > 0) {
                  onPageChange(1);
                } else {
                  handleFilterClear(column.field);
                  onPageChange(1);
                }
              }

              setActiveFilter(null);
            }}
          >
            Apply
          </button>
        </div>
      </div>
    );
  }

  const showDateRange =
    isDate &&
    (column.headerName.toLowerCase().includes("dt") ||
      column.headerName.toLowerCase().includes("date") ||
      column.headerName.toLowerCase().includes("recd at site") ||
      column.headerName.toLowerCase().includes("booking"));

  return (
    <div
      ref={filterRef}
      className={`absolute mt-2.5 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-[250px] flex flex-col ${
        filterPosition === "right" ? "left-0" : "right-0"
      }`}
      style={{ maxHeight: `${Math.min(maxHeight, 400)}px` }}
      onClick={(e) => e.stopPropagation()}
    >
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

        {showDateRange && (
          <div className="mt-2">
            <select
              value={currentFilterType}
              onChange={(e) =>
                setFilterType((prev) => ({
                  ...prev,
                  [column.field]: e.target.value,
                }))
              }
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="individual">Select Individual Dates</option>
              <option value="range">Select Date Range</option>
            </select>
          </div>
        )}

        {(!showDateRange || currentFilterType === "individual") && (
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

        {showDateRange && currentFilterType === "range" && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-xs text-gray-500">From</label>
              <input
                type="date"
                value={currentDateRange.from}
                onChange={(e) =>
                  setDateRanges((prev) => ({
                    ...prev,
                    [column.field]: {
                      ...currentDateRange,
                      from: e.target.value,
                    },
                  }))
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">To</label>
              <input
                type="date"
                value={currentDateRange.to}
                onChange={(e) =>
                  setDateRanges((prev) => ({
                    ...prev,
                    [column.field]: {
                      ...currentDateRange,
                      to: e.target.value,
                    },
                  }))
                }
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {(!showDateRange || currentFilterType === "individual") && (
        <div className="flex-1 overflow-y-auto p-2 bg-white">
          {uniqueValues
            .filter((value) =>
              value.toLowerCase().includes(filterSearchQuery.toLowerCase())
            )
            .slice()
            .sort(compareValuesAsc)
            .map((value) => (
              <label
                key={value}
                className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={currentFilter.value?.includes(value)}
                  onChange={(e) => {
                    let newValues = e.target.checked
                      ? [...(currentFilter.value || []), value]
                      : (currentFilter.value || []).filter((v) => v !== value);
                    if (newValues.length === 0) {
                      handleFilterClear(column.field);
                    } else {
                      handleFilterChange(column.field, "multiSelect", newValues);
                    }
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

      <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 p-2 flex justify-between gap-2">
        <button
          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          onClick={() => {
            handleFilterClear(column.field);
            setDateRanges((prev) => ({
              ...prev,
              [column.field]: { from: "", to: "" },
            }));
            onPageChange(1);
            setActiveFilter(null);
          }}
        >
          Clear
        </button>
        <button
          className="px-2 py-1 text-xs bg-[#011a99] text-white hover:bg-[#015099] rounded"
          onClick={() => {
            if (
              currentFilterType === "range" &&
              currentDateRange.from &&
              currentDateRange.to
            ) {
              handleFilterChange(column.field, "dateRange", [
                currentDateRange.from,
                currentDateRange.to,
              ]);
              onPageChange(1);
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
