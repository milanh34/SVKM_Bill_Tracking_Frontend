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

export const requestSort = (key, onSort) => {
  onSort(key);
};

export const formatCellValue = (value, field) => {
  if (value === undefined || value === null || value === "") return "-";

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
