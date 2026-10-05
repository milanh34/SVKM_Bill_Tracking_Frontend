import React from "react";
import { Funnel, RotateCcw } from "lucide-react";
import search from "../../assets/search.svg";
import { RegionChecklist, AmountRangeFields } from "../dashboard/FilterModal";

/**
 * Nature of Work, ticked several at once like region (1.10, item O-19).
 * Built here rather than reusing RegionChecklist, whose label says "Region".
 */
const NatureChecklist = ({ options, selected, onChange }) => {
    const toggle = (value) =>
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

    return (
        <div>
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                    Nature of Work:{" "}
                    <span className="font-normal text-gray-500">
                        {selected.length === 0 ? "All" : `${selected.length} selected`}
                    </span>
                </label>
                <div className="flex gap-3 text-xs">
                    <button
                        type="button"
                        className="text-[#011a99] hover:underline hover:cursor-pointer"
                        onClick={() => onChange([...options])}
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
                {options.map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm text-gray-700 hover:cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selected.includes(value)}
                            onChange={() => toggle(value)}
                            className="hover:cursor-pointer"
                        />
                        <span className="truncate" title={value}>{value}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

/**
 * Search box, Funnel and Reset for a report, as on the Home tab
 * (29.09, item 12). Driven by useReportGlobalFilter: spread its `props` here.
 * The Funnel turns green while a filter is applied (29.09, item 13).
 */
const ReportFilterModal = ({
    onClose,
    regionOptions,
    selectedRegions,
    setSelectedRegions,
    natureOptions = [],
    selectedNatures = [],
    setSelectedNatures,
    dateFields,
    selectedDateField,
    setSelectedDateField,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    amountFields,
    selectedAmountField,
    setSelectedAmountField,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    clearFilters,
}) => (
    <div className="fixed inset-0 bg-gray-500/25 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Filter Options</h2>
                <button
                    className="text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer p-1"
                    onClick={onClose}
                >
                    ×
                </button>
            </div>
            <div className="space-y-4">
                {/* Several regions at once (29.09, item 14). */}
                {regionOptions.length > 0 && (
                    <RegionChecklist
                        regions={regionOptions}
                        selected={selectedRegions}
                        onChange={setSelectedRegions}
                    />
                )}
                {/* Only on reports whose rows carry a nature of work (1.10, item O-19). */}
                {natureOptions.length > 0 && (
                    <NatureChecklist
                        options={natureOptions}
                        selected={selectedNatures}
                        onChange={setSelectedNatures}
                    />
                )}
                {dateFields.length > 0 && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Filter by Date Field:</label>
                            <select
                                value={selectedDateField}
                                onChange={(e) => setSelectedDateField(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer"
                            >
                                {dateFields.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">From Date:</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">To Date:</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:cursor-pointer"
                                />
                            </div>
                        </div>
                    </>
                )}
                {amountFields.length > 0 && (
                    <AmountRangeFields
                        amountFields={amountFields}
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
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const ReportGlobalFilter = ({
    searchQuery,
    setSearchQuery,
    isFilterOpen,
    setIsFilterOpen,
    filterActive,
    reset,
    shownCount,
    totalCount,
    isActive,
    ...modalProps
}) => (
    <div className="flex items-center gap-2 mb-[1.5vh] max-w-xl">
        <div className="flex-1 flex border border-gray-300 rounded-md text-sm bg-white">
            <img src={search} alt="search" className="ml-1.5" />
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 outline-none text-sm w-full"
            />
        </div>
        {/* A report with no regions, dates or amounts (Vendor Details) has only the search. */}
        {(modalProps.dateFields.length > 0 ||
            modalProps.regionOptions.length > 0 ||
            (modalProps.natureOptions || []).length > 0 ||
            modalProps.amountFields.length > 0) && (
            <button
                className={`p-1.5 rounded-md transition-colors border hover:cursor-pointer ${filterActive
                    ? "text-white bg-green-600 border-green-700 hover:bg-green-700"
                    : "text-gray-600 border-gray-400 hover:bg-gray-100"
                    }`}
                onClick={() => setIsFilterOpen(true)}
                title={filterActive ? "Filter Options (a filter is applied)" : "Filter Options"}
            >
                <Funnel className="w-4 h-4" />
            </button>
        )}
        <button
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors border border-gray-400 hover:cursor-pointer"
            onClick={reset}
            title="Reset search and filters"
        >
            <RotateCcw className="w-4 h-4" />
        </button>
        {isActive && (
            <span className="text-sm text-gray-600 whitespace-nowrap">
                Showing {shownCount.toLocaleString("en-IN")} of {totalCount.toLocaleString("en-IN")}
            </span>
        )}
        {isFilterOpen && (
            <ReportFilterModal onClose={() => setIsFilterOpen(false)} {...modalProps} />
        )}
    </div>
);

export default ReportGlobalFilter;
