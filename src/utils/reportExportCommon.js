import Cookies from "js-cookie";

/*
 * Pieces every report download and print share (mail of 1 October).
 */

const pad = (n) => String(n).padStart(2, "0");

/** "01/10/2026 14:05" - date AND time (1.10, item O-16b). */
export const formatGeneratedAt = (now = new Date()) =>
    `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

export const generatedAtText = (now = new Date()) => `Report generated on: ${formatGeneratedAt(now)}`;

/**
 * "<report name>_DDMMYYYY.xlsx", e.g. "Invoices at Site_01102026.xlsx"
 * (1.10, item O-16a). A trailing "as on" is dropped and characters Windows
 * will not take in a file name are replaced.
 */
export const reportFileName = (name, now = new Date(), ext = "xlsx") => {
    const base = String(name || "Report")
        .replace(/\s+as on\s*$/i, "")
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim() || "Report";
    return `${base}_${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}.${ext}`;
};

/** The regions this user may pick from, as the report pages read them. */
export const availableRegionList = () => {
    try {
        const list = JSON.parse(Cookies.get("availableRegions") || "[]");
        return Array.isArray(list) ? list.filter(Boolean).map(String) : [];
    } catch {
        return [];
    }
};

/** DD-MM-YYYY, from either YYYY-MM-DD or something already formatted. */
const criteriaDate = (d) => {
    if (!d) return "";
    const parts = String(d).split("-");
    return parts.length === 3 && parts[0].length === 4
        ? `${parts[2]}-${parts[1]}-${parts[0]}`
        : String(d);
};

export const ALL_REGIONS_LABEL = "All regions";

/**
 * The selection criteria a report was run with, as { region, dates }.
 *
 * Two bugs lived here. The region label treated ANY array as "All"
 * (observation N-02) - and the report pages seed their region state with the
 * user's whole list of regions, which IS an array, so the printed header said
 * "All" no matter what was chosen. And the download never received the
 * criteria at all, so neither region nor date range appeared in the Excel
 * file (observation N-03).
 *
 * When every region the user can pick is selected the label is "All regions"
 * rather than the whole list, which made the sheet's column very wide
 * (1.10, item O-16d). `filters.availableRegions` overrides the cookie.
 */
export const describeReportCriteria = (filters) => {
    if (!filters) return null;

    const { region, fromDate, toDate } = filters;

    let regionLabel;
    if (region === undefined || region === null || region === "") {
        regionLabel = ALL_REGIONS_LABEL;
    } else if (Array.isArray(region)) {
        const named = region.filter(Boolean).map(String);
        const available = Array.isArray(filters.availableRegions)
            ? filters.availableRegions.filter(Boolean).map(String)
            : availableRegionList();
        const chosen = new Set(named.map((r) => r.toLowerCase()));
        const coversAll =
            available.length > 0 && available.every((r) => chosen.has(r.toLowerCase()));
        // An empty list, one that literally says ALL, or every region on offer, is unrestricted.
        regionLabel =
            named.length === 0 || chosen.has("all") || coversAll
                ? ALL_REGIONS_LABEL
                : named.join(", ");
    } else {
        regionLabel = String(region).toLowerCase() === "all" ? ALL_REGIONS_LABEL : String(region);
    }

    const dateParts = [];
    if (fromDate) dateParts.push(`From: ${criteriaDate(fromDate)}`);
    if (toDate) dateParts.push(`To: ${criteriaDate(toDate)}`);

    return { region: regionLabel, dates: dateParts.join(", ") };
};

/** One line of criteria text, for a sheet cell. */
export const criteriaLine = (criteria) =>
    !criteria
        ? ""
        : criteria.dates
            ? `Region: ${criteria.region}   |   ${criteria.dates}`
            : `Region: ${criteria.region}`;

/** The criteria block for a printed report, count included (1.10, item O-18). */
export const printCriteriaHtml = (criteria, count) => {
    const parts = [];
    if (criteria) {
        parts.push(`<div>Region: <strong>${criteria.region}</strong></div>`);
        if (criteria.dates) parts.push(`<div><strong>${criteria.dates}</strong></div>`);
    }
    if (count !== undefined && count !== null) {
        parts.push(`<div>Total Count: <strong>${Number(count).toLocaleString("en-IN")}</strong></div>`);
    }
    return parts.length ? `<div class="report-filters">${parts.join("")}</div>` : "";
};
