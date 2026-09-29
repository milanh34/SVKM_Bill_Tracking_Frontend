/**
 * Range checks shared by the global filters on Home, Forwarded and the
 * reports (29.09, item 14): a date column with from/to, an amount column
 * with min/max. Either bound may be given alone, and both are inclusive.
 */

/**
 * A date as a sortable yyyymmdd number, or null when it is not a date.
 * Working in whole days makes both bounds cover the full day.
 * Reports send "dd-mm-yyyy" strings, which `new Date()` would misread;
 * bills and some report columns come through as ISO timestamps, read here
 * as a local date, the way the grids show them.
 */
export const parseDateKey = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const toKey = (y, m, d) => {
    if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
    return y * 10000 + m * 100 + d;
  };

  if (value instanceof Date) {
    return isNaN(value.getTime())
      ? null
      : toKey(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  const text = String(value).trim();

  // dd-mm-yyyy or dd/mm/yyyy
  let m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return toKey(Number(m[3]), Number(m[2]), Number(m[1]));

  // yyyy-mm-dd, as the date inputs give it
  m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return toKey(Number(m[1]), Number(m[2]), Number(m[3]));

  // ISO timestamp
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const d = new Date(text);
    return isNaN(d.getTime()) ? null : toKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  return null;
};

/**
 * An amount as a number, or null when blank or not a number.
 * Accepts numbers and strings such as "1,23,456.50", "₹ 1,000", "Rs.1000" or "(500)".
 */
export const parseAmount = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "object") return null;

  let text = String(value).trim();
  if (text === "") return null;

  let negative = false;
  const bracketed = text.match(/^\((.*)\)$/);
  if (bracketed) {
    negative = true;
    text = bracketed[1];
  }
  text = text.replace(/[,\s]/g, "").replace(/^(rs\.?|inr|₹)/i, "");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;

  const n = Number(text);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
};

/** True when `value` falls on or between the dates; a blank value fails once a bound is set. */
export const inDateRange = (value, fromDate, toDate) => {
  const from = parseDateKey(fromDate);
  const to = parseDateKey(toDate);
  if (from === null && to === null) return true;
  const key = parseDateKey(value);
  if (key === null) return false;
  if (from !== null && key < from) return false;
  if (to !== null && key > to) return false;
  return true;
};

/** True when `value` falls on or between the amounts; a blank value fails once a bound is set. */
export const inAmountRange = (value, minAmount, maxAmount) => {
  const min = parseAmount(minAmount);
  const max = parseAmount(maxAmount);
  if (min === null && max === null) return true;
  const amount = parseAmount(value);
  if (amount === null) return false;
  if (min !== null && amount < min) return false;
  if (max !== null && amount > max) return false;
  return true;
};

/** Reads "a.b.c" off a row. */
export const getFieldValue = (row, field) => {
  if (!row || !field) return undefined;
  if (!field.includes(".")) return row[field];
  return field.split(".").reduce((value, key) => (value == null ? undefined : value[key]), row);
};

/**
 * The amount columns a bill grid can offer, in the order to offer them.
 * Home and Forwarded show only those in the role's columns.
 */
export const BILL_AMOUNT_FIELDS = [
  "taxInvAmt",
  "poAmt",
  "copDetails.amount",
  "accountsDept.paymentAmt",
  "advanceAmt",
  "proformaInvAmt",
  "migoDetails.amount",
  "sesDetails.amount",
  "miroDetails.amount",
];

/** [{ value, label }] for the `fields` present in `columns`, labelled as the columns are. */
export const pickFieldOptions = (columns, fields) =>
  fields
    .map((field) => columns.find((c) => c.field === field))
    .filter(Boolean)
    .map((column) => ({ value: column.field, label: column.headerName || column.field }));

/** Distinct non-blank regions of the rows, sorted alphabetically. */
export const sortedRegions = (rows, field = "region") => {
  const seen = new Set();
  (rows || []).forEach((row) => {
    const region = getFieldValue(row, field);
    if (region !== undefined && region !== null && String(region).trim() !== "") {
      seen.add(String(region));
    }
  });
  return [...seen].sort((a, b) => a.localeCompare(b));
};
