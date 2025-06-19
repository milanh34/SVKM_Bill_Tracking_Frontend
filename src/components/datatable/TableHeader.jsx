import React from "react";
import { SortAscIcon, SortDescIcon, Filter } from "../dashboard/Icons";
import FilterPopup from "./FilterPopup";

const TableHeader = ({
  visibleColumns,
  columnFilters,
  sortConfig,
  selectAllState,
  totalSelected,
  totalItems,
  onSort,
  onSelectAll,
  onFilterClick,
  activeFilter,
  filterRef,
  filterPosition,
  filterSearchQuery,
  setFilterSearchQuery,
  isNumericField,
  isDateField,
  data,
  filterType,
  setFilterType,
  dateRanges,
  setDateRanges,
  pendingAmountFilters,
  setPendingAmountFilters,
  showActions,
  handleFilterChange,
  handleFilterClear,
}) => {
  const requestSort = (key) => {
    onSort(key);
  };

  return (
    <thead className="sticky top-0 z-40 bg-gray-50">
      <tr className="divide-x divide-gray-200">
        <th className="sticky left-0 top-0 z-50 w-12 bg-blue-50 px-1.5 py-2.5 border-b border-gray-200">
          <div className="absolute inset-0 bg-blue-50 border-r border-blue-200" style={{ bottom: "-1px", zIndex: -1 }}></div>
          <div className="relative z-10 flex flex-col items-center">
            <input
              type="checkbox"
              checked={selectAllState}
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
            className={`sticky top-0 px-1.5 py-2.5 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 bg-gray-50 ${sortConfig.key === column.field ? "bg-gray-100" : ""}`}
            data-field={column.field}
          >
            <div className="flex items-center justify-between group">
              <span className="truncate max-w-[200px]" title={column.headerName}>
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
                  onClick={(e) => onFilterClick(column.field, e)}
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
            <FilterPopup
              column={column}
              activeFilter={activeFilter}
              filterRef={filterRef}
              filterPosition={filterPosition}
              filterSearchQuery={filterSearchQuery}
              setFilterSearchQuery={setFilterSearchQuery}
              isDateField={isDateField}
              isNumericField={isNumericField}
              data={data}
              columnFilters={columnFilters}
              filterType={filterType}
              setFilterType={setFilterType}
              dateRanges={dateRanges}
              setDateRanges={setDateRanges}
              pendingAmountFilters={pendingAmountFilters}
              setPendingAmountFilters={setPendingAmountFilters}
              onFilterChange={handleFilterChange}
              onFilterClear={handleFilterClear}
            />
          </th>
        ))}
        {showActions && (
          <th className="sticky right-0 top-0 z-50 w-16 bg-blue-50 px-1.5 py-2.5 border-b border-gray-200">
            <div className="absolute inset-0 bg-blue-50 border-l border-blue-200" style={{ bottom: "-1px", zIndex: -1 }}></div>
            <div className="relative z-10 text-center">Actions</div>
          </th>
        )}
      </tr>
    </thead>
  );
};

export default TableHeader;