// Shared amount helpers for the checklists (1.10, items O-04 / O-06).
// Every checklist imports these instead of keeping its own copy, so the
// on-screen and printed versions always agree.

// en-IN grouping with exactly two decimals: 500.1 -> "500.10",
// 4567856.12 -> "45,67,856.12". Without the fraction options
// toLocaleString trims the trailing paise zero (1.10, item O-04).
// Empty / non-numeric input is returned as-is (or "") so callers can keep
// their `formatAmount(x) || ""` pattern.
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === "" || isNaN(amount)) return amount || "";
  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

// 0-99 in words ("" for 0).
const twoDigits = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}`.trim());

// Whole rupees in Indian numbering (Crore / Lakh / Thousand / Hundred).
// Crores above 99 recurse, e.g. 150 crore -> "One Hundred and Fifty Crore".
const rupeesToWords = (num) => {
  if (num === 0) return "";
  const parts = [];
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;
  if (crore) parts.push(`${rupeesToWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(`${parts.length ? "and " : ""}${twoDigits(rest)}`);
  return parts.join(" ");
};

// Amount in words incl. paise (1.10, item O-06):
// 50000.12 -> "Fifty Thousand and Twelve Paise Only",
// 100000 -> "One Lakh Only", 0.5 -> "Fifty Paise Only", 0 -> "Zero Only".
export const numberToWords = (amount) => {
  if (amount === null || amount === undefined || amount === "" || isNaN(amount)) return "";
  // Work in whole paise to avoid floating-point drift (0.29 * 100 etc.).
  const totalPaise = Math.round(Math.abs(Number(amount)) * 100);
  const rupees = Math.floor(totalPaise / 100);
  const paise = totalPaise % 100;
  if (rupees === 0 && paise === 0) return "Zero Only";
  const rupeeWords = rupeesToWords(rupees);
  const paiseWords = paise ? `${twoDigits(paise)} Paise` : "";
  const words = rupeeWords && paiseWords ? `${rupeeWords} and ${paiseWords}` : rupeeWords || paiseWords;
  return `${Number(amount) < 0 ? "Minus " : ""}${words} Only`;
};
