import * as XLSX from 'xlsx';

// Column configs (order = display order). `header` is the Excel column header
// (also used as the results-table header). Data starts at Excel row 2.
const UPDATE_COLUMNS = [
    { header: 'Vendor No' },
    { header: '206AB Compliance' },
    { header: 'PAN Status' },
    { header: 'Addl 1' },
    { header: 'Addl 2' },
];

const IMPORT_COLUMNS = [
    { header: 'Vendor No' },
    { header: 'Vendor Name' },
    { header: 'PAN' },
    { header: 'GST Number' },
    { header: '206AB Compliance' },
    { header: 'PAN Status' },
    { header: 'Email IDs' },
    { header: 'Phone No' },
    { header: 'Addl 1' },
    { header: 'Addl 2' },
];

// Parse an uploaded vendor file into data rows keyed by column header.
const parseVendorFile = async (file) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const headers = (rows[0] || []).map((h) => String(h).trim());
    const dataRows = [];
    // rows[0] is the header row -> Excel row 1. Data starts at Excel row 2.
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i] || [];
        // Skip fully empty rows
        if (r.every((c) => c === '' || c === null || c === undefined)) continue;
        const cells = {};
        headers.forEach((h, idx) => { cells[h] = r[idx] ?? ''; });
        dataRows.push({ excelRow: i + 1, cells }); // 1-indexed Excel row (header = row 1)
    }
    return dataRows;
};

export const parseVendorUpdateFile = (file) => parseVendorFile(file);
export const parseVendorImportFile = (file) => parseVendorFile(file);

// True only when the backend payload actually processed rows (partial or full
// success). A whole-file rejection (e.g. missing required columns) has none of
// these, so we should show an error instead of a results table.
export const hasVendorResultData = (info) => !!info && (
    info.updated !== undefined ||
    info.imported !== undefined ||
    info.created !== undefined ||
    info.inserted !== undefined ||
    info.added !== undefined ||
    info.skipped !== undefined ||
    info.failed !== undefined ||
    Array.isArray(info.errors)
);

const escapeHtml = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

// Generic results-tab renderer.
// dataRows: output of parseVendorFile
// info: backend response `data` object { updated/imported, skipped, errors: [{ row, error }] }
// options: { title, columns, successKeys, failedKeys }
const openVendorResults = (dataRows, info = {}, options = {}) => {
    const {
        title = 'Vendor Results',
        columns = UPDATE_COLUMNS,
        successKeys = ['updated'],
        failedKeys = ['skipped'],
    } = options;

    const errorList = Array.isArray(info.errors) ? info.errors : [];

    // Map errors by their Excel row number
    const errorByRow = {};
    errorList.forEach((e) => {
        if (e && e.row !== undefined && e.row !== null) errorByRow[e.row] = e.error;
    });

    // Build per-row results from the uploaded file
    const results = dataRows.map((r) => {
        const err = errorByRow[r.excelRow];
        return { cells: r.cells, status: err ? 'Failed' : 'Success', error: err || '' };
    });

    // Any error rows that didn't match a parsed row -> append as failed rows
    const matchedRows = new Set(dataRows.map((r) => r.excelRow));
    errorList.forEach((e) => {
        if (e && !matchedRows.has(e.row)) {
            results.push({ cells: {}, status: 'Failed', error: e.error || '' });
        }
    });

    // Prefer explicit backend counts, fall back to computed counts
    const firstDefined = (keys) => {
        for (const k of keys) {
            if (info[k] !== undefined && info[k] !== null) return info[k];
        }
        return undefined;
    };
    const successCount = firstDefined(successKeys) ?? results.filter((r) => r.status === 'Success').length;
    const failedCount = firstDefined(failedKeys) ?? (info.errors?.length ?? results.filter((r) => r.status === 'Failed').length);

    const headHtml = columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('');

    const rowsHtml = results.map((r) => {
        const isFail = r.status === 'Failed';
        const cellsHtml = columns.map((c) => `<td>${escapeHtml(r.cells[c.header])}</td>`).join('');
        return `
            <tr class="${isFail ? 'failed-row' : 'success-row'}">
                ${cellsHtml}
                <td class="status ${isFail ? 'status-failed' : 'status-success'}">${escapeHtml(r.status)}</td>
                <td class="error-cell">${escapeHtml(r.error)}</td>
            </tr>`;
    }).join('');

    const html = `
        <html>
          <head>
            <title>${escapeHtml(title)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #222; }
              h1 { font-size: 22px; margin: 0 0 4px 0; }
              .generated { color: #666; font-style: italic; font-size: 13px; margin-bottom: 16px; }
              .summary { display: flex; gap: 16px; margin-bottom: 20px; }
              .summary-card { padding: 12px 20px; border-radius: 8px; font-size: 16px; font-weight: bold; }
              .summary-success { background: #eaedf9; color: #364cbb; border: 1px solid #b9c2ef; }
              .summary-failed { background: #fce8e6; color: #c5221f; border: 1px solid #f0b4b0; }
              table { width: 100%; border-collapse: collapse; }
              thead { background-color: #f2f2f2; }
              th { background-color: #f8f9fa; color: #000; font-size: 14px; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #ddd; }
              td { padding: 8px; font-size: 13px; border: 1px solid #ddd; text-align: left; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .status { font-weight: bold; text-align: center; }
              .status-success { color: #364cbb; }
              .status-failed { color: #c5221f; }
              .failed-row td { background-color: #fdeceb; }
              .error-cell { color: #c5221f; }
            </style>
          </head>
          <body>
            <h1>${escapeHtml(title)}</h1>
            <div class="generated">Generated on: ${new Date().toLocaleString('en-IN')}</div>
            <div class="summary">
              <div class="summary-card summary-success">Successful: ${successCount}</div>
              <div class="summary-card summary-failed">Failed: ${failedCount}</div>
            </div>
            <table>
              <thead>
                <tr>
                  ${headHtml}
                  <th>Status</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>`;

    const resultWindow = window.open('', '_blank');
    if (!resultWindow) {
        return false; // popup blocked
    }
    resultWindow.document.open();
    resultWindow.document.write(html);
    resultWindow.document.close();
    return true;
};

export const openVendorUpdateResults = (dataRows, info = {}) => openVendorResults(dataRows, info, {
    title: 'Vendor Mass Update Results',
    columns: UPDATE_COLUMNS,
    successKeys: ['updated'],
    failedKeys: ['skipped'],
});

export const openVendorImportResults = (dataRows, info = {}) => openVendorResults(dataRows, info, {
    title: 'Vendor Import Results',
    columns: IMPORT_COLUMNS,
    successKeys: ['imported', 'created', 'inserted', 'added', 'updated'],
    failedKeys: ['skipped', 'failed'],
});
