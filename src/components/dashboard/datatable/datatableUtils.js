const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    if (date.getFullYear() <= 1971) return "-";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (e) {
    return "-";
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  try {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(value);
  } catch (e) {
    return value.toString();
  }
};

export const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === "object") {
      value = value[key];
    } else {
      value = undefined;
      break;
    }
  }
  return value;
};

export const isDateField = (field) => {
  const dateIndicators = ["date", "dt", "recdatsite", "booking", "receivedback"];

  if (field.includes(".")) {
    const parts = field.split(".");
    return parts.some((part) =>
      dateIndicators.some((indicator) =>
        part.toLowerCase().includes(indicator.toLowerCase())
      )
    );
  }

  return dateIndicators.some((indicator) =>
    field.toLowerCase().includes(indicator.toLowerCase())
  );
};

export const isNumericField = (field) => {
  const numericIndicators = ["amount", "amt", "percentage"];

  return numericIndicators.some((indicator) =>
    field.toLowerCase().includes(indicator.toLowerCase())
  );
};

export const getUniqueValues = (data, field) => {
  const values = new Set();
  let hasBlank = false;

  data.forEach((row) => {
    const value = getNestedValue(row, field);
    if (value === undefined || value === null) {
      hasBlank = true;
      return;
    }

    if (field === "attachments" && Array.isArray(value)) {
      if (value.length === 0) {
        hasBlank = true;
        return;
      }
      const label = `${value.length} attachment${value.length > 1 ? 's' : ''}`;
      values.add(label);
      return;
    }

    if (Array.isArray(value)) {
      values.add(value.toString());
      return;
    }

    if (typeof value === 'string' && value.trim() === '') {
      hasBlank = true;
      return;
    }

    if (isDateField(field)) {
      const formattedDate = formatDate(value);
      if (formattedDate !== "-") {
        values.add(formattedDate);
      } else {
        hasBlank = true;
      }
    } else {
      values.add(value.toString());
    }
  });

  const result = Array.from(values).sort((a, b) => {
    if (a.includes("-") && b.includes("-")) {
      const [dayA, monthA, yearA] = a.split("-").map(Number);
      const [dayB, monthB, yearB] = b.split("-").map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    }
    return a.localeCompare(b);
  });

  if (hasBlank) {
    if (field === "attachments") {
      result.unshift("0 attachments");
    } else {
      result.unshift("");
    }
  }

  return result;
};

export const applyFilter = (
  value,
  filterValue,
  operator,
  field,
  filterType,
  columnFilters,
  dateRanges
) => {
  const isBlank =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (field === "attachments" && Array.isArray(value) && value.length === 0);

  const blankSelector = field === "attachments" ? "0 attachments" : "";

  if (Array.isArray(filterValue) && filterValue.includes(blankSelector)) {
    if (isBlank) return true;
  }

  if (isBlank) return false;

  if (!operator) return true;
  if (operator === "multiSelect" && (!filterValue || filterValue.length === 0)) return true;

  let comparableValue;
  if (field === "attachments" && Array.isArray(value)) {
    comparableValue = `${value.length} attachment${value.length > 1 ? 's' : ''}`;
  } else if (isDateField(field)) {
    comparableValue = formatDate(value);
  } else {
    comparableValue = value;
  }

  if (isNumericField(field)) {
    const filter = columnFilters[field];

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;

    if (filter?.range) {
      const min =
        filter.range.min !== "" ? parseFloat(filter.range.min) : -Infinity;
      const max =
        filter.range.max !== "" ? parseFloat(filter.range.max) : Infinity;
      return numValue >= min && numValue <= max;
    }
  }

  if (isDateField(field)) {
    const currentFilterType = filterType[field] || "individual";
    const dateValue = new Date(value);

    if (currentFilterType === "range") {
      const { from, to } = dateRanges[field] || {};
      if (from && to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return dateValue >= fromDate && dateValue <= toDate;
      }
      return true;
    } else {
      return filterValue.some((val) => comparableValue === val);
    }
  }

  const stringValue = String(comparableValue).toLowerCase();

  switch (operator) {
    case "multiSelect":
      return filterValue.some((val) => stringValue === String(val).toLowerCase());
    default:
      return true;
  }
};

/**
 * The rows a column's filter list should be built from.
 *
 * getUniqueValues() was handed the whole dataset, so every column offered
 * every value it had ever held even after other filters had removed those
 * rows (observations, General R10). It now sees the rows that survive every
 * OTHER filter and the search.
 *
 * This column's own filter is deliberately excluded. Including it would leave
 * only the values already selected, and there would be no way to widen a
 * filter once narrowed - which is how spreadsheets behave, and what users
 * expect.
 */
export const rowsForFilterOptions = (
  data,
  field,
  { columnFilters = {}, filterType = {}, dateRanges = {}, searchQuery = "", searchColumns = [] } = {}
) => {
  const others = Object.entries(columnFilters).filter(([f]) => f !== field);
  if (others.length === 0 && !String(searchQuery || "").trim()) return data;

  return data.filter((row) => {
    for (const [f, filter] of others) {
      const value = getNestedValue(row, f);
      if (!applyFilter(value, filter.value, filter.operator, f, filterType, columnFilters, dateRanges)) {
        return false;
      }
    }
    return rowMatchesSearch(row, searchColumns, searchQuery);
  });
};

export const requestSort = (key, sortConfig, setSortConfig) => {
  let direction = "asc";
  if (sortConfig.key === key && sortConfig.direction === "asc") {
    direction = "desc";
  }
  setSortConfig({ key, direction });
};

/* ------------------------------------------------------------------ *
 * Sorting and searching
 *
 * Both grids previously sorted with their own inline comparator that
 * guessed at the type of every value:
 *
 *   - only `undefined` counted as empty, so a field explicitly set to
 *     null fell through to String(null) and sorted among the data as the
 *     literal text "null";
 *   - any two strings were fed to `new Date()` first, so a text column
 *     whose values happen to parse as dates ("May", "1-2") sorted as
 *     dates while its neighbours sorted as text;
 *   - objects and arrays reached String() and collapsed to
 *     "[object Object]", making every row compare equal.
 *
 * One comparator now serves both grids, and it sorts on the same value
 * the user can see in the cell.
 * ------------------------------------------------------------------ */

const isBlankValue = (v) =>
  v === null ||
  v === undefined ||
  (typeof v === "string" && v.trim() === "") ||
  (Array.isArray(v) && v.length === 0);

/**
 * The cell's value as the user reads it: dates as DD-MM-YYYY, amounts
 * grouped, percentages with a sign. Used for search, column filters and
 * text sorting so all three agree with the screen.
 */
export const displayValue = (value, field) => {
  if (isBlankValue(value)) return "";
  const formatted = formatCellValue(value, field);
  return formatted === "-" ? "" : String(formatted);
};

/**
 * Does this row match a free-text search?
 *
 * Matches against the displayed text AND the raw value, so both
 * "12-07-2026" and "2026-07-12" find the same bill, and "1,00,000"
 * finds an amount stored as 100000.
 */
export const rowMatchesSearch = (row, columns, query) => {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return columns.some((column) => {
    const value = getNestedValue(row, column.field);
    if (isBlankValue(value)) return false;
    if (displayValue(value, column.field).toLowerCase().includes(q)) return true;
    const raw = Array.isArray(value)
      ? value.join(", ")
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
    return raw.toLowerCase().includes(q);
  });
};

/**
 * Compare two rows on one column. Blanks always sort last, in both
 * directions, so reversing the sort never fills the first page with
 * empty cells.
 */
export const compareValues = (a, b, field, direction = "asc") => {
  const av = getNestedValue(a, field);
  const bv = getNestedValue(b, field);

  const aBlank = isBlankValue(av);
  const bBlank = isBlankValue(bv);
  if (aBlank && bBlank) return 0;
  if (aBlank) return 1; // blanks last regardless of direction
  if (bBlank) return -1;

  const sign = direction === "desc" ? -1 : 1;

  // Sr no is numeric text: compare as a number so 7- and 8-digit serials
  // order correctly.
  if (field === "srNo") {
    const an = Number(av);
    const bn = Number(bv);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return sign * (an - bn);
  }

  if (isDateField(field)) {
    const at = new Date(av).getTime();
    const bt = new Date(bv).getTime();
    const aOk = !Number.isNaN(at);
    const bOk = !Number.isNaN(bt);
    if (aOk && bOk) return sign * (at - bt);
    if (aOk) return -1;
    if (bOk) return 1;
  } else if (isNumericField(field) || isPercentageField(field)) {
    const an = parseFloat(av);
    const bn = parseFloat(bv);
    const aOk = !Number.isNaN(an);
    const bOk = !Number.isNaN(bn);
    if (aOk && bOk) return sign * (an - bn);
    if (aOk) return -1;
    if (bOk) return 1;
  } else if (typeof av === "number" && typeof bv === "number") {
    return sign * (av - bv);
  }

  return (
    sign *
    displayValue(av, field).localeCompare(displayValue(bv, field), undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
};

/** Sr no as the tiebreaker, newest first, matching the server's order. */
export const compareBySrNo = (a, b) => {
  const an = Number(getNestedValue(a, "srNo"));
  const bn = Number(getNestedValue(b, "srNo"));
  if (!Number.isNaN(an) && !Number.isNaN(bn)) return bn - an;
  return String(getNestedValue(b, "srNo") || "").localeCompare(
    String(getNestedValue(a, "srNo") || "")
  );
};

/**
 * The column a team's tab sorts on by default, latest first. Mirrors
 * SORT_FIELD in the backend's utils/tab-predicates.js.
 *
 * The Incoming tab used to inherit the Home tab's column - col 62 for
 * PIMO, col 82 for Accounts - which is blank on every incoming bill by
 * definition, so the tab was left in arbitrary order (observations,
 * Sorting R36). Incoming sorts on the dispatch date instead: col 61 for
 * PIMO, col 80 for Accounts.
 */
export const defaultSortField = (role, tab = "home") => {
  const BY_TAB = {
    home: {
      site_officer: "taxInvRecdAtSite", // col 24
      // Col 40, Dt Given-QS for Prov COP, per her sorting matrix (29.09,
      // item 19) and the server's order. This still said col 35, so the grid
      // re-sorted QS Home away from the order the server sent.
      qs_site: "qsCOP.dateGiven", // col 40
      site_pimo: "pimoMumbai.dateReceived", // col 62
      pimo_mumbai: "pimoMumbai.dateReceived",
      director: "taxInvRecdAtSite", // col 24
      accounts: "accountsDept.dateReceived", // col 82
      admin: "srNo", // latest Sr no first (1.10, item 3)
    },
    incoming: {
      site_pimo: "pimoMumbai.dateGiven", // col 61
      pimo_mumbai: "pimoMumbai.dateGiven",
      accounts: "accountsDept.dateGiven", // col 80
    },
    forwarded: {
      site_officer: "pimoMumbai.dateGiven", // col 61
      qs_site: "pimoMumbai.dateReturnedFromQs", // col 66
      site_pimo: "accountsDept.dateGiven", // col 80
      pimo_mumbai: "accountsDept.dateGiven",
      director: "accountsDept.paymentDate", // col 89
      accounts: "accountsDept.paymentDate", // col 89
    },
  };
  return BY_TAB[tab]?.[role] || null;
};

// Fields the spec formats as "% number" rather than a plain amount.
// Field entry sheet, column 31 (Advance Percentage).
const isPercentageField = (field) => /percentage/i.test(field);

export const formatCellValue = (value, field) => {
  if (value === undefined || value === null || value === "") return "-";

  if (isPercentageField(field)) {
    const pct = parseFloat(value);
    // Trim a trailing ".00" so 10 reads as "10%", not "10.00%"
    if (!isNaN(pct)) return `${Number.isInteger(pct) ? pct : pct.toFixed(2)}%`;
    return value.toString();
  }

  if (isNumericField(field)) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return formatCurrency(numValue);
    }
  }

  if (isDateField(field)) {
    if (typeof value === "number") {
      const date = new Date(value);
      if (date.getFullYear() > 1971) {
        return formatDate(date);
      }
    }
    if (typeof value === "string" && value.includes("T")) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
    }
    return value.toString();
  }

  if (field.includes("status")) {
    return value.toString();
  }

  return value.toString();
};

export const getStatusStyle = (status) => {
  if (!status) return {};
  const statusLower = status.toLowerCase();
  if (
    statusLower.includes("approve") ||
    statusLower === "paid" ||
    statusLower === "active"
  ) {
    return { color: "#15803d", fontWeight: "bold" };
  } else if (statusLower.includes("reject") || statusLower === "fail") {
    return { color: "#b91c1c", fontWeight: "bold" };
  } else if (
    statusLower.includes("pend") ||
    statusLower === "waiting" ||
    statusLower === "unpaid"
  ) {
    return { color: "#ca8a04", fontWeight: "bold" };
  }
  return {};
};

export const getEditableFields = (currentUserRole, getColumnsForRole) => {
  const roleMapping = {
    admin: "ADMIN",
    site_officer: "SITE_OFFICER",
    qs_site: "QS_TEAM",
    site_pimo: "PIMO_MUMBAI_MIGO_SES",
    // pimo_mumbai: "PIMO_MUMBAI_ADVANCE_FI",
    accounts: "ACCOUNTS_TEAM",
    director: "DIRECTOR_TRUSTEE_ADVISOR",
  };

  const mappedRole = roleMapping[currentUserRole] || currentUserRole;
  const editableFields = getColumnsForRole(mappedRole).map((col) => col.field);

  return editableFields || [];
};

export const handleCellEdit = (field, value, rowId, setEditedValues) => {
  console.log("handleCellEdit called with:", { field, value, rowId });
  setEditedValues((prev) => ({
    ...prev,
    [rowId]: {
      ...prev[rowId],
      [field]: value,
    },
  }));
};
