import React from "react";

const inputClass =
  "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer";

/**
 * Region as a checklist, so several can be picked (29.09, item 14).
 * Nothing ticked means every region. Shared with the reports' popup.
 */
export const RegionChecklist = ({ regions, selected, onChange }) => {
  const toggle = (region) =>
    onChange(
      selected.includes(region)
        ? selected.filter((r) => r !== region)
        : [...selected, region]
    );

  return (
    <div>
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Region:{" "}
          <span className="font-normal text-gray-500">
            {selected.length === 0 ? "All Regions" : `${selected.length} selected`}
          </span>
        </label>
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            className="text-[#011a99] hover:underline hover:cursor-pointer"
            onClick={() => onChange([...regions])}
          >
            Select all
          </button>
          <button
            type="button"
            className="text-[#011a99] hover:underline hover:cursor-pointer"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md shadow-sm px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {regions.length === 0 && (
          <span className="text-sm text-gray-500 col-span-2">No regions</span>
        )}
        {regions.map((region) => (
          <label
            key={region}
            className="flex items-center gap-2 text-sm text-gray-700 hover:cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(region)}
              onChange={() => toggle(region)}
              className="hover:cursor-pointer"
            />
            <span className="truncate" title={region}>
              {region}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

/**
 * Which amount column, and a min/max on it (29.09, item 14).
 * Either bound alone works; both are inclusive. Shared with the reports.
 */
export const AmountRangeFields = ({
  amountFields,
  selectedAmountField,
  setSelectedAmountField,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
}) => (
  <>
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Filter by Amount Field:
      </label>
      <select
        value={selectedAmountField}
        onChange={(e) => setSelectedAmountField(e.target.value)}
        className={inputClass}
      >
        {amountFields.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    <div className="flex space-x-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">
          Min Amount:
        </label>
        <input
          type="number"
          step="any"
          placeholder="No minimum"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">
          Max Amount:
        </label>
        <input
          type="number"
          step="any"
          placeholder="No maximum"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  </>
);

export const FilterModal = ({
  isOpen,
  onClose,
  selectedRegion,
  uniqueRegions,
  setSelectedRegion,
  selectedDateField,
  setSelectedDateField,
  dateFieldOptions,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  amountFieldOptions = [],
  selectedAmountField,
  setSelectedAmountField,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  handleClearFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Filter Options
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer p-1"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          <RegionChecklist
            regions={uniqueRegions}
            selected={selectedRegion}
            onChange={setSelectedRegion}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Filter by Date Field:
            </label>
            <select
              value={selectedDateField}
              onChange={(e) => setSelectedDateField(e.target.value)}
              className={inputClass}
            >
              {dateFieldOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                From Date:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                To Date:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          {amountFieldOptions.length > 0 && (
            <AmountRangeFields
              amountFields={amountFieldOptions}
              selectedAmountField={selectedAmountField}
              setSelectedAmountField={setSelectedAmountField}
              minAmount={minAmount}
              setMinAmount={setMinAmount}
              maxAmount={maxAmount}
              setMaxAmount={setMaxAmount}
            />
          )}
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-[#011a99] text-white rounded-md hover:bg-[#015099] transition-colors hover:cursor-pointer"
              onClick={onClose}
            >
              Apply Filters
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors hover:cursor-pointer"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
