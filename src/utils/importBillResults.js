import * as XLSX from 'xlsx';

// Columns shown in the results table (the bill template has ~99 columns, so we
// only surface the key identifying ones). `header` must match the Excel header.
const BILL_COLUMNS = [
    { header: 'Sr no' },
    { header: 'Region' },
    { header: 'Vendor no' },
    { header: 'Vendor Name' },
    { header: 'Tax Inv no' },
    { header: 'Tax Inv Amt' },
];

// Parse the uploaded import-bill file into data rows keyed by column header.
export const parseBillImportFile = async (file) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const headers = (rows[0] || []).map((h) => String(h).trim());
    const dataRows = [];
    // rows[0] is the header row -> Excel row 1. Data starts at Excel row 2.
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i] || [];
        if (r.every((c) => c === '' || c === null || c === undefined)) continue;
        const cells = {};
        headers.forEach((h, idx) => { cells[h] = r[idx] ?? ''; });
        dataRows.push({ excelRow: i + 1, cells }); // 1-indexed Excel row (header = row 1)
    }
    return dataRows;
};

// True only when the backend payload actually processed rows. A whole-file
// rejection (thrown error, no summary) should show an error, not a table.
export const hasBillResultData = (payload) => {
    const summary = payload?.data?.summary;
    const meta = payload?.meta || {};
    return !!summary || Array.isArray(meta.skippedRows) || Array.isArray(meta.existingBills);
};

const escapeHtml = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

// Open a new tab with the import-bills results table.
// dataRows: output of parseBillImportFile
// payload: full backend response body (response.data)
export const openBillImportResults = (dataRows, payload = {}) => {
    const summary = payload?.data?.summary || {};
    const meta = payload?.meta || {};

    // Collect failed rows (keyed by Excel row number) from the two failure buckets
    const failedByRow = {};
    (meta.skippedRows || []).forEach((r) => {
        if (!r || r.rowNumber === undefined || r.rowNumber === null) return;
        failedByRow[r.rowNumber] = {
            reason: `Vendor not found in vendor master${r.vendorName ? `: ${r.vendorName}` : ''}${r.vendorNo ? ` (${r.vendorNo})` : ''}`,
            source: r,
        };
    });
    (meta.existingBills || []).forEach((r) => {
        if (!r || r.rowNumber === undefined || r.rowNumber === null) return;
        failedByRow[r.rowNumber] = {
            reason: 'Bill already exists — use the update option instead',
            source: r,
        };
    });

    // Build per-row results from the uploaded file
    const results = dataRows.map((r) => {
        const fail = failedByRow[r.excelRow];
        return { cells: r.cells, status: fail ? 'Failed' : 'Success', error: fail ? fail.reason : '' };
    });

    // Any failed rows that didn't match a parsed row -> append using backend data
    const matchedRows = new Set(dataRows.map((r) => r.excelRow));
    Object.keys(failedByRow).forEach((rowNum) => {
        if (!matchedRows.has(Number(rowNum))) {
            const { source, reason } = failedByRow[rowNum];
            results.push({
                cells: {
                    'Sr no': source.srNo ?? '',
                    'Vendor no': source.vendorNo ?? '',
                    'Vendor Name': source.vendorName ?? '',
                },
                status: 'Failed',
                error: reason,
            });
        }
    });

    // Counts: prefer backend summary, fall back to computed
    const summaryHas = (k) => summary[k] !== undefined && summary[k] !== null;
    const successCount = (summaryHas('inserted') || summaryHas('updated'))
        ? (summary.inserted || 0) + (summary.updated || 0)
        : results.filter((r) => r.status === 'Success').length;
    const failedCount = (summaryHas('skipped') || summaryHas('alreadyExisting') || summaryHas('errors'))
        ? (summary.skipped || 0) + (summary.alreadyExisting || 0) + (summary.errors || 0)
        : results.filter((r) => r.status === 'Failed').length;

    const headHtml = BILL_COLUMNS.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('');

    const rowsHtml = results.map((r) => {
        const isFail = r.status === 'Failed';
        const cellsHtml = BILL_COLUMNS.map((c) => `<td>${escapeHtml(r.cells[c.header])}</td>`).join('');
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
            <title>Bill Import Results</title>
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
            <h1>Bill Import Results</h1>
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
