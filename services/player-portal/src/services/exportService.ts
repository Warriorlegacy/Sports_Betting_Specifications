export interface StatementRow {
  id: string;
  date: string;
  type: string;
  reference: string;
  description: string;
  grossAmount: number;
  commission: number;
  netAmount: number;
  balanceAfter: number;
  status: 'SETTLED' | 'PENDING' | 'CANCELLED';
}

export function exportToCSV(rows: StatementRow[], filename: string = 'nexusvip_account_statement.csv') {
  const headers = ['Transaction ID', 'Date & Time', 'Type', 'Reference', 'Description', 'Gross Amount (INR)', 'Commission (INR)', 'Net Amount (INR)', 'Balance After (INR)', 'Status'];
  
  const csvContent = [
    headers.join(','),
    ...rows.map((r) => [
      `"${r.id}"`,
      `"${r.date}"`,
      `"${r.type}"`,
      `"${r.reference}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.grossAmount.toFixed(2),
      r.commission.toFixed(2),
      r.netAmount.toFixed(2),
      r.balanceAfter.toFixed(2),
      `"${r.status}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(rows: StatementRow[], user: any, filename: string = 'nexusvip_statement.pdf') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF statement');
    return;
  }

  const dateGenerated = new Date().toLocaleString('en-IN');
  const totalGross = rows.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalCommission = rows.reduce((sum, r) => sum + r.commission, 0);
  const totalNet = rows.reduce((sum, r) => sum + r.netAmount, 0);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>NexusVIP Exchange Account Statement</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #111;
      margin: 20px;
      font-size: 12px;
      line-height: 1.4;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f36c21;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .logo span { color: #f36c21; }
    .badge {
      background: #f36c21;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
    }
    .info-label { font-size: 10px; color: #6c757d; font-weight: bold; text-transform: uppercase; }
    .info-val { font-size: 14px; font-weight: bold; margin-top: 2px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #1e1e1e;
      color: white;
      text-align: left;
      padding: 8px 10px;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #dee2e6;
      font-size: 11px;
    }
    tr:nth-child(even) { background-color: #f8f9fa; }
    .positive { color: #28a745; font-weight: bold; }
    .negative { color: #dc3545; font-weight: bold; }
    .summary-card {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .summary-table {
      width: 300px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      overflow: hidden;
    }
    .summary-table td { padding: 6px 12px; }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #dee2e6;
      padding-top: 10px;
      font-size: 10px;
      color: #6c757d;
      text-align: center;
    }
    @media print {
      body { margin: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">NEXUS<span>VIP</span> <span class="badge">Official Statement</span></div>
      <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">Sub-Second Betting Exchange & Live Casino Ledger</div>
    </div>
    <div style="text-align: right;">
      <button onclick="window.print()" style="background: #f36c21; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 5px;">Print / Save PDF</button>
      <div style="font-size: 10px; color: #6c757d;">Generated: ${dateGenerated}</div>
    </div>
  </div>

  <div class="info-grid">
    <div>
      <div class="info-label">Account Username</div>
      <div class="info-val">${user?.username || 'Client Player'}</div>
    </div>
    <div>
      <div class="info-label">Current Available Balance</div>
      <div class="info-val" style="color: #28a745;">₹${(user?.availableCredit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
    </div>
    <div>
      <div class="info-label">Current Liability Exposure</div>
      <div class="info-val" style="color: #dc3545;">₹${(user?.exposure || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Reference / Market</th>
        <th>Gross (₹)</th>
        <th>Comm (₹)</th>
        <th>Net P&L (₹)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((r) => `
        <tr>
          <td>${r.date}</td>
          <td><b>${r.type}</b></td>
          <td>${r.description}</td>
          <td>₹${r.grossAmount.toFixed(2)}</td>
          <td>₹${r.commission.toFixed(2)}</td>
          <td class="${r.netAmount >= 0 ? 'positive' : 'negative'}">
            ${r.netAmount >= 0 ? '+' : ''}₹${r.netAmount.toFixed(2)}
          </td>
          <td><span style="font-weight: bold; color: ${r.status === 'SETTLED' ? '#28a745' : '#e67e22'};">${r.status}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary-card">
    <table class="summary-table">
      <tr>
        <td><b>Total Gross Trading:</b></td>
        <td style="text-align: right;">₹${totalGross.toFixed(2)}</td>
      </tr>
      <tr>
        <td><b>Total Commission Rake (2%):</b></td>
        <td style="text-align: right; color: #dc3545;">₹${totalCommission.toFixed(2)}</td>
      </tr>
      <tr style="background: #f8f9fa; border-top: 2px solid #333;">
        <td><b>Net Realized P&L:</b></td>
        <td style="text-align: right;" class="${totalNet >= 0 ? 'positive' : 'negative'}">
          <b>${totalNet >= 0 ? '+' : ''}₹${totalNet.toFixed(2)}</b>
        </td>
      </tr>
    </table>
  </div>

  <div class="footer">
    NexusVIP Exchange & Live Casino • Encrypted Double-Entry Ledger Statement • Verified Official Document
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog
      setTimeout(function() { window.print(); }, 500);
    }
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
