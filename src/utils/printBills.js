import { getNestedValue } from "../components/dashboard/datatable/datatableUtils";

/**
 * Print the selected bills as a landscape table with a grand-total row.
 *
 * Shared by the Home and Forwarded tabs (29.09, item 5) so both print the
 * same sheet.
 *
 * @param {object[]} selectedData   rows to print
 * @param {object[]} visibleColumns columns, in on-screen order
 * @param {string}   role           shown in the header block
 * @param {string}   [title]
 */
export const printBills = ({ selectedData, visibleColumns, role, title = "Bills Report" }) => {
  const grandTotals = {};

  grandTotals.taxInvAmt = selectedData.reduce((total, row) => {
    const taxInvAmt = row.taxInvAmt || 0;
    return total + (typeof taxInvAmt === 'number' ? taxInvAmt : 0);
  }, 0);

  const copAmountColumn = visibleColumns.find(col => col.field === "copDetails.amount");
  if (copAmountColumn) {
    grandTotals["copDetails.amount"] = selectedData.reduce((total, row) => {
      const copAmount = row.copDetails?.amount || 0;
      return total + (typeof copAmount === 'number' ? copAmount : 0);
    }, 0);
  }

  const paymentAmtColumn = visibleColumns.find(col => col.field === "accountsDept.paymentAmt");
  if (paymentAmtColumn) {
    grandTotals["accountsDept.paymentAmt"] = selectedData.reduce((total, row) => {
      const paymentAmt = row.accountsDept?.paymentAmt || 0;
      return total + (typeof paymentAmt === 'number' ? paymentAmt : 0);
    }, 0);
  }

  const poAmtColumn = visibleColumns.find(col => col.field === "poAmt");
  if (poAmtColumn) {
    grandTotals["poAmt"] = selectedData.reduce((total, row) => {
      const valuePoAmt = row.poAmt || 0;
      return total + (typeof valuePoAmt === 'number' ? valuePoAmt : 0);
    }, 0);
  }

  const printWindow = window.open("", "_blank");

  const tableHTML = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <style>
        @page {
          size: landscape;
          margin: 1cm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          font-size: 11px;
        }
        td {
          font-size: 10px;
        }
        .amount {
          text-align: right;
        }
        .status-approved {
          color: #15803d;
          font-weight: bold;
        }
        .status-rejected {
          color: #b91c1c;
          font-weight: bold;
        }
        .status-pending {
          color: #ca8a04;
          font-weight: bold;
        }
        .print-info {
          margin-bottom: 10px;
          font-size: 10px;
          color: #666;
        }
        .grand-total-row {
          background-color: #f8f9fa;
          font-weight: bold;
          border-top: 2px solid #333;
        }
        .grand-total-row td {
          font-size: 11px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">${title}</div>
      <div class="print-info">
        <strong>Print Date:</strong> ${new Date().toLocaleDateString()}<br>
        <strong>Total Records:</strong> ${selectedData.length}<br>
        <strong>User Role:</strong> ${role}
      </div>
      <table>
        <thead>
          <tr>
            ${visibleColumns.map(col => `<th>${col.headerName}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${selectedData.map(row => `
            <tr>
              ${visibleColumns.map(col => {
    const value = getNestedValue(row, col.field);
    let displayValue = value || '-';

    if (col.field.includes('amount') || col.field.includes('Amt')) {
      if (value && !isNaN(value)) {
        displayValue = new Intl.NumberFormat('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true
        }).format(value);
      }
    }

    if (value && typeof value === 'string' && value.includes('T')) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          displayValue = date.toLocaleDateString('en-GB');
        }
      } catch (e) {
        console.log(e);
      }
    }

    let cellClass = '';
    if (col.field.includes('status') && value) {
      const statusLower = value.toLowerCase();
      if (statusLower.includes('approve') || statusLower === 'paid' || statusLower === 'active') {
        cellClass = 'status-approved';
      } else if (statusLower.includes('reject') || statusLower === 'fail') {
        cellClass = 'status-rejected';
      } else if (statusLower.includes('pend') || statusLower === 'waiting' || statusLower === 'unpaid') {
        cellClass = 'status-pending';
      }
    }

    if (col.field.includes('amount') || col.field.includes('Amt')) {
      cellClass += ' amount';
    }

    return `<td class="${cellClass}">${displayValue}</td>`;
  }).join('')}
            </tr>
          `).join('')}
          
          <!-- Grand Total Row -->
          <tr class="grand-total-row">
            ${visibleColumns.map((col, index) => {
    if (index === 0) {
      return `<td><strong>Grand Total</strong></td>`;
    } else if (grandTotals[col.field]) {
      const total = grandTotals[col.field];
      const formattedTotal = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(total);
      return `<td class="amount"><strong>${formattedTotal}</strong></td>`;
    } else {
      return `<td></td>`;
    }
  }).join('')}
          </tr>
        </tbody>
      </table>
    </body>
  </html>
  `;

  printWindow.document.write(tableHTML);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};
