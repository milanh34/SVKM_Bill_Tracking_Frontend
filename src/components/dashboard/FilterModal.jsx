import React from "react";

export const FilterModal = ({
  isOpen,
  onClose,
  selectedRegion,
  uniqueRegions,
  handleRegionChange,
  selectedDateField,
  setSelectedDateField,
  dateFieldOptions,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  handleClearFilters,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/25 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Region:
            </label>
            <select
              value={selectedRegion[0] || ""}
              onChange={handleRegionChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer"
            >
              <option value="">All Regions</option>
              {uniqueRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Filter by Date Field:
            </label>
            <select
              value={selectedDateField}
              onChange={(e) => setSelectedDateField(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer"
              />
            </div>
          </div>
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
