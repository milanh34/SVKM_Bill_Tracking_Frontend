import * as XLSX from "xlsx";

/**
 * Downloadable results file for uploads.
 *
 * The client asked twice for "the file showing results after upload, indicating
 * success/failure against each line". The results table already existed, but
 * only as a popup tab. This turns the same rows into a workbook.
 *
 * The results tab is written with document.write into a same-origin popup, so
 * its Download button calls back into this window through window.opener.
 */

const SAFE = /[\\/:*?"<>|]/g;

const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
};

/**
 * Register a download for the results just rendered, and return the markup for
 * the button that triggers it from inside the results tab.
 *
 * @param {string} title    heading of the results tab, e.g. "Bill Import Results"
 * @param {Array}  columns  [{ header }] - the identifying columns shown
 * @param {Array}  results  [{ cells, status, error }] - one entry per uploaded line
 */
export const registerResultsDownload = (title, columns, results) => {
  const header = [...columns.map((c) => c.header), "Status", "Error"];

  const rows = results.map((r) => [
    ...columns.map((c) => {
      const v = r.cells?.[c.header];
      return v === undefined || v === null ? "" : v;
    }),
    r.status,
    r.error || "",
  ]);

  window.__svkmDownloadResults = () => {
    const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);

    // Identifying columns stay narrow; the Error column carries sentences.
    sheet["!cols"] = header.map((_, i) => ({
      wch: i === header.length - 1 ? 52 : i === header.length - 2 ? 10 : 16,
    }));
    sheet["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { c: 0, r: 0 },
        e: { c: header.length - 1, r: rows.length },
      }),
    };

    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Results");
    XLSX.writeFile(book, `${title.replace(SAFE, "")} ${stamp()}.xlsx`);
  };

  return `
    <button type="button" class="dl" onclick="window.opener && window.opener.__svkmDownloadResults
      ? window.opener.__svkmDownloadResults()
      : alert('Please keep the original tab open to download the results file.')">
      Download results (.xlsx)
    </button>`;
};

/** Styling for the button above, injected into the results tab's stylesheet. */
export const DOWNLOAD_BUTTON_CSS = `
  .dl {
    font: 600 14px Arial, sans-serif;
    background: #364cbb; color: #fff; border: none; border-radius: 6px;
    padding: 10px 18px; cursor: pointer; margin-bottom: 20px;
  }
  .dl:hover { background: #2a3c96; }
  @media print { .dl { display: none; } }
`;
