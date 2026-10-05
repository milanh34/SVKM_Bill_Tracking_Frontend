import { useMemo, useRef, useState } from "react";
import {
    getFieldValue,
    inAmountRange,
    inDateRange,
    parseAmount,
    parseDateKey,
    sortedRegions,
} from "../../utils/rangeFilter";

/**
 * The Home tab's global filter, for the reports (29.09, item 12).
 *
 * A client-side layer over the rows a report has already fetched: a search
 * that matches any cell of the row, a region checklist, a from/to range on
 * whichever date column the user picks and a min/max on whichever amount
 * column the user picks. The report's own server-side Filters
 * are untouched and still decide what gets fetched.
 *
 * Total rows are never treated as data. Rows flagged isSubtotal close the
 * group of data rows above them and rows flagged isGrandTotal close the
 * report, as the server builds them. While nothing is filtered the rows come
 * back exactly as received, server totals included; once something is, the
 * subtotals and grand total are worked out again from the rows still showing,
 * so the numbers on screen, in Print and in Download all agree. A subtotal
 * whose rows are all filtered away is dropped.
 *
 * Region is held as a list, and the checks live in one place (`matchesFilters`).
 * Nature of Work is a second checklist, offered only when the report's rows
 * carry one (1.10, item O-19).
 * Item 14 (29.09) adds a region checklist, a min/max on whichever amount
 * column the user picks, and either-bound-alone date ranges.
 */

const NO_ROWS = [];

// Marks a total field that holds the number of rows rather than a sum.
export const COUNT = "__count__";

const isTotalRow = (row) => !!(row && (row.isGrandTotal || row.isSubtotal || row.isSubTotal));

const getField = getFieldValue;

/**
 * A report date as a sortable yyyymmdd number, or null when it is not a date.
 * Most reports send "dd-mm-yyyy" strings, which `new Date()` would misread;
 * a few columns still come through as ISO timestamps.
 */
export const parseReportDate = parseDateKey;

/**
 * Date-field options for the popup, labelled as the report's own columns are.
 * `fields` lists the date columns the report shows, in the order to offer them.
 */
export const pickDateFields = (columns, fields) =>
    fields.map((field) => ({
        value: field,
        label: columns.find((c) => c.field === field)?.headerName || field,
    }));

/**
 * Amount-field options for the popup (29.09, item 14), as pickDateFields.
 * `fields` lists the numeric amount columns the report shows.
 */
export const pickAmountFields = pickDateFields;

const cellText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") {
        // Match both the raw number and the way the table formats it.
        return `${value} ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (typeof value === "object") return "";
    return String(value);
};

const rowSearchText = (row, searchFields) => {
    const fields = searchFields && searchFields.length
        ? searchFields
        : Object.keys(row).filter((key) => !key.startsWith("_"));
    return fields.map((field) => cellText(getField(row, field))).join(" \u0001 ").toLowerCase();
};

const matchesFilters = (row, filters, { searchFields, regionField, natureField }) => {
    const { search, regions, natures, dateField, fromDate, toDate, amountField, minAmount, maxAmount } = filters;

    if (search) {
        if (!rowSearchText(row, searchFields).includes(search)) return false;
    }

    if (regions.length > 0) {
        const region = String(getField(row, regionField) ?? "").toLowerCase();
        if (!regions.some((r) => String(r).toLowerCase() === region)) return false;
    }

    // Several natures of work at once, as region (1.10, item O-19).
    if (natures.length > 0) {
        const nature = String(getField(row, natureField) ?? "").toLowerCase();
        if (!natures.some((n) => String(n).toLowerCase() === nature)) return false;
    }

    if (dateField && (fromDate || toDate)) {
        if (!inDateRange(getField(row, dateField), fromDate, toDate)) return false;
    }

    // Blank amounts drop out once a bound is set (29.09, item 14).
    if (amountField && (minAmount !== "" || maxAmount !== "")) {
        if (!inAmountRange(getField(row, amountField), minAmount, maxAmount)) return false;
    }

    return true;
};

// Fills a total row's fields from the data rows it now covers.
const recomputeTotal = (totalRow, dataRows, spec) => {
    if (!spec) return totalRow;
    const next = { ...totalRow };
    Object.entries(spec).forEach(([key, source]) => {
        if (source === COUNT) {
            next[key] = dataRows.length;
        } else if (typeof source === "function") {
            next[key] = source(dataRows);
        } else {
            const sum = dataRows.reduce((acc, row) => acc + (parseAmount(getField(row, source)) || 0), 0);
            next[key] = Number(sum.toFixed(2));
        }
    });
    return next;
};

/**
 * @param rows     the report's rows as fetched, total rows included
 * @param options
 *   dateFields    [{ value, label }] date columns to offer (see pickDateFields)
 *   amountFields  [{ value, label }] amount columns to offer (see pickAmountFields)
 *   searchFields  fields the search looks at; defaults to every field of the row
 *   regionField   defaults to "region"
 *   natureField   defaults to "natureOfWork"; the checklist shows only when
 *                 some row carries a value (1.10, item O-19)
 *   totals        { grandTotalKey: sourceField | COUNT | fn(dataRows) }
 *   subtotals     the same, for rows flagged isSubtotal
 *   extraFilter   a further check on data rows the page already applies on
 *                 the client (the Outstanding reports' region), so totals
 *                 follow it too
 *   extraFilterActive  whether that check is narrowing anything
 *   extraFilterKey     changes when that check does (e.g. the region chosen)
 */
export const useReportGlobalFilter = (rows, options = {}) => {
    const {
        dateFields = [],
        amountFields = [],
        searchFields,
        regionField = "region",
        natureField = "natureOfWork",
        totals,
        subtotals,
        extraFilter,
        extraFilterActive = false,
        extraFilterKey = "",
    } = options;

    // Pages build these inline; the memo below keys on their content instead
    // of their identity so it does not rerun on every render.
    const latest = useRef({});
    latest.current = { searchFields, totals, subtotals, extraFilter };
    const optionsKey = JSON.stringify([searchFields || null, regionField, natureField, totals || null, subtotals || null]);

    const defaultDateField = dateFields[0]?.value || "";
    const defaultAmountField = amountFields[0]?.value || "";

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedNatures, setSelectedNatures] = useState([]);
    const [selectedDateField, setSelectedDateField] = useState(defaultDateField);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedAmountField, setSelectedAmountField] = useState(defaultAmountField);
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const safeRows = Array.isArray(rows) ? rows : NO_ROWS;

    // Regions offered are the ones present in the report's data rows.
    const regionOptions = useMemo(
        () => sortedRegions(safeRows.filter((row) => !isTotalRow(row)), regionField),
        [safeRows, regionField]
    );

    // Natures of work offered are the ones present in the data rows; none, no checklist.
    const natureOptions = useMemo(
        () => sortedRegions(safeRows.filter((row) => !isTotalRow(row)), natureField),
        [safeRows, natureField]
    );

    const search = searchQuery.trim().toLowerCase();
    const dateActive = !!selectedDateField && (!!fromDate || !!toDate);
    const amountActive = !!selectedAmountField && (minAmount !== "" || maxAmount !== "");
    // Green funnel, as on Home (29.09, items 13 and 14): region, dates or amounts set.
    const filterActive = selectedRegions.length > 0 || selectedNatures.length > 0 || dateActive || amountActive;
    const isActive = filterActive || !!search;

    // Changes whenever what is shown changes, so pages can clear selections.
    const filterKey = JSON.stringify([
        search, selectedRegions, selectedNatures, dateActive ? selectedDateField : "", fromDate, toDate,
        amountActive ? selectedAmountField : "", minAmount, maxAmount,
    ]);

    const filteredRows = useMemo(() => {
        if (!isActive && !extraFilterActive) return safeRows;
        const { searchFields, totals, subtotals, extraFilter } = latest.current;

        const filters = {
            search,
            regions: selectedRegions,
            natures: selectedNatures,
            dateField: selectedDateField,
            fromDate,
            toDate,
            amountField: selectedAmountField,
            minAmount,
            maxAmount,
        };
        const keep = (row) =>
            (!extraFilterActive || !extraFilter || extraFilter(row)) &&
            matchesFilters(row, filters, { searchFields, regionField, natureField });

        const result = [];
        const allKept = [];
        let groupKept = [];

        safeRows.forEach((row) => {
            if (row && (row.isSubtotal || row.isSubTotal)) {
                if (groupKept.length > 0) {
                    result.push(recomputeTotal(row, groupKept, subtotals));
                }
                groupKept = [];
            } else if (row && row.isGrandTotal) {
                result.push(recomputeTotal(row, allKept, totals));
            } else if (row && keep(row)) {
                result.push(row);
                groupKept.push(row);
                allKept.push(row);
            }
        });

        return result;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [safeRows, isActive, extraFilterActive, extraFilterKey, search, selectedRegions, selectedNatures, selectedDateField, fromDate, toDate, selectedAmountField, minAmount, maxAmount, regionField, natureField, optionsKey]);

    const dataRows = useMemo(() => filteredRows.filter((row) => !isTotalRow(row)), [filteredRows]);
    const grandTotalRow = useMemo(() => filteredRows.find((row) => row && row.isGrandTotal) || null, [filteredRows]);

    const clearFilters = () => {
        setSelectedRegions([]);
        setSelectedNatures([]);
        setSelectedDateField(defaultDateField);
        setFromDate("");
        setToDate("");
        setSelectedAmountField(defaultAmountField);
        setMinAmount("");
        setMaxAmount("");
    };

    const reset = () => {
        setSearchQuery("");
        clearFilters();
        setIsFilterOpen(false);
    };

    return {
        filteredRows,
        dataRows,
        grandTotalRow,
        isActive,
        filterActive,
        filterKey,
        reset,
        // Everything <ReportGlobalFilter> needs.
        props: {
            searchQuery,
            setSearchQuery,
            isFilterOpen,
            setIsFilterOpen,
            filterActive,
            regionOptions,
            selectedRegions,
            setSelectedRegions,
            natureOptions,
            selectedNatures,
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
            clearFilters: () => {
                clearFilters();
                setIsFilterOpen(false);
            },
            reset,
            shownCount: dataRows.length,
            totalCount: safeRows.filter((row) => !isTotalRow(row)).length,
            isActive,
        },
    };
};

export default useReportGlobalFilter;
