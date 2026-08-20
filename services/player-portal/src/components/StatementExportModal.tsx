import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  X,
  Printer,
  Table,
  CheckCircle2,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { StatementRow, exportToCSV, exportToPDF } from '../services/exportService';

interface StatementExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const StatementExportModal: React.FC<StatementExportModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL'>('WEEK');

  if (!isOpen) return null;

  // Mock comprehensive statement ledger rows derived from actual betting activities
  const sampleRows: StatementRow[] = [
    {
      id: 'TXN_8849201',
      date: new Date(Date.now() - 3600000 * 2).toLocaleString('en-IN'),
      type: 'BET_WIN',
      reference: 'MKT_IND_AUS_T20',
      description: 'Back India @ 1.85 (Stake: ₹5,000) - WIN',
      grossAmount: 4250.00,
      commission: 85.00,
      netAmount: 4165.00,
      balanceAfter: 19165.00,
      status: 'SETTLED'
    },
    {
      id: 'TXN_8849102',
      date: new Date(Date.now() - 3600000 * 8).toLocaleString('en-IN'),
      type: 'CASHOUT',
      reference: 'MKT_ARS_CHE_PL',
      description: 'In-Play Cashout Arsenal vs Chelsea (Stake: ₹2,000)',
      grossAmount: 890.00,
      commission: 17.80,
      netAmount: 872.20,
      balanceAfter: 15000.00,
      status: 'SETTLED'
    },
    {
      id: 'TXN_8848900',
      date: new Date(Date.now() - 3600000 * 24).toLocaleString('en-IN'),
      type: 'DEPOSIT',
      reference: 'UPI_UTR_99210291',
      description: 'Instant UPI Deposit (Approved by Admin Gateway)',
      grossAmount: 10000.00,
      commission: 0.00,
      netAmount: 10000.00,
      balanceAfter: 14127.80,
      status: 'SETTLED'
    },
    {
      id: 'TXN_8847801',
      date: new Date(Date.now() - 3600000 * 48).toLocaleString('en-IN'),
      type: 'BET_LOSS',
      reference: 'MKT_ALC_SIN_WIM',
      description: 'Lay Sinner @ 2.10 (Liability: ₹1,100) - LOSS',
      grossAmount: -1100.00,
      commission: 0.00,
      netAmount: -1100.00,
      balanceAfter: 4127.80,
      status: 'SETTLED'
    }
  ];

  const handleExportCSV = () => {
    exportToCSV(sampleRows, `nexusvip_statement_${dateFilter.toLowerCase()}.csv`);
  };

  const handleExportPDF = () => {
    exportToPDF(sampleRows, user, `nexusvip_statement_${dateFilter.toLowerCase()}.pdf`);
  };

  const totalGross = sampleRows.reduce((sum, r) => sum + r.grossAmount, 0);
  const totalComm = sampleRows.reduce((sum, r) => sum + r.commission, 0);
  const totalNet = sampleRows.reduce((sum, r) => sum + r.netAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#1e1e1e] border border-[#2d2d2d] rounded-2xl p-6 shadow-2xl relative text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#f36c21]/20 border border-[#f36c21]/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#f36c21]" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Account Statement & P&L Export</h3>
              <p className="text-xs text-[#adadad]">Download certified transaction and betting reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#adadad] hover:text-white rounded-lg bg-[#272727] hover:bg-[#333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar bg-[#141414] p-1.5 rounded-xl border border-[#272727] text-xs font-bold">
          {(['TODAY', 'YESTERDAY', 'WEEK', 'MONTH', 'ALL'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                dateFilter === filter
                  ? 'bg-[#f36c21] text-white shadow font-black'
                  : 'text-[#adadad] hover:text-white'
              }`}
            >
              {filter === 'WEEK' ? 'Last 7 Days' : filter === 'MONTH' ? 'Last 30 Days' : filter}
            </button>
          ))}
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#171717] p-3 rounded-xl border border-[#272727]">
            <span className="text-[10px] uppercase font-bold text-[#888]">Gross Win/Loss</span>
            <div className={`text-base font-mono font-black ${totalGross >= 0 ? 'text-[#27AE60]' : 'text-[#FF4148]'}`}>
              {totalGross >= 0 ? '+' : ''}₹{totalGross.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#171717] p-3 rounded-xl border border-[#272727]">
            <span className="text-[10px] uppercase font-bold text-[#888]">Exchange Commission</span>
            <div className="text-base font-mono font-black text-amber-400">
              ₹{totalComm.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#171717] p-3 rounded-xl border border-[#272727]">
            <span className="text-[10px] uppercase font-bold text-[#888]">Net Realized P&L</span>
            <div className={`text-base font-mono font-black ${totalNet >= 0 ? 'text-[#27AE60]' : 'text-[#FF4148]'}`}>
              {totalNet >= 0 ? '+' : ''}₹{totalNet.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Statement Preview Table */}
        <div className="border border-[#272727] rounded-xl overflow-hidden max-h-52 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[10px] uppercase text-[#888] font-mono sticky top-0">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Market / Note</th>
                <th className="p-2.5 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272727] font-mono">
              {sampleRows.map((r) => (
                <tr key={r.id} className="hover:bg-[#252525]">
                  <td className="p-2.5 text-[11px] text-[#adadad]">{r.date.split(',')[0]}</td>
                  <td className="p-2.5 font-bold text-white text-[11px]">{r.type}</td>
                  <td className="p-2.5 text-[11px] text-slate-300 truncate max-w-[200px]">{r.description}</td>
                  <td className={`p-2.5 text-right font-black ${r.netAmount >= 0 ? 'text-[#27AE60]' : 'text-[#FF4148]'}`}>
                    {r.netAmount >= 0 ? '+' : ''}₹{r.netAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleExportCSV}
            className="py-3 px-4 rounded-xl bg-[#272727] hover:bg-[#333] border border-[#3d3d3d] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Table className="w-4 h-4 text-emerald-400" />
            <span>Download Excel / CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#f36c21] to-[#e05b12] hover:opacity-90 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-orange-600/20"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
