import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  Wallet,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, orders, sectors, customers, getLiveMetrics } = useApp();
  const [reportRange, setReportRange] = useState<'today' | 'month' | 'year'>('today');

  const metrics = getLiveMetrics();

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'Metric,Value\n';
    const rows = [
      `Total Payments Received,${metrics.todayIncome}`,
      `Total Payments Outflow,${metrics.todayExpenses}`,
      `Net Settlement,${metrics.todayIncome - metrics.todayExpenses}`,
      `Cash in Physical Drawer,${metrics.expectedCash}`,
      `UPI Collection,${metrics.upiIncome}`,
      `Bank Transfers,${metrics.bankIncome}`,
      `Total Customer Outstanding,${metrics.totalOutstanding}`,
      `Orders in Production,${metrics.ordersInProduction}`,
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annai_executive_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial & Operational Reports
          </h1>
          <p className="text-xs text-slate-500">
            Audit-backed metrics for daily collection, channel reconciliation, and sector turnaround.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Grid 1: High Level Revenue & Collections Report */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Daily Collection & Financial Inflow Summary
            </h2>
            <p className="text-xs text-slate-500">Madhavaram Hub · Audited Ledger Basis</p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-500">Gross Income Collected</span>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{metrics.todayIncome.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500">Advances + Balance settlements</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-500">Gross Shop Expenditures</span>
            <div className="text-2xl font-bold font-mono text-red-600">
              ₹{metrics.todayExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500">Raw materials, courier, petty cash</div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <span className="text-xs font-semibold text-blue-900">Net Retained Cashflow</span>
            <div className="text-2xl font-bold font-mono text-blue-700">
              ₹{(metrics.todayIncome - metrics.todayExpenses).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-blue-800">Operational surplus</div>
          </div>
        </div>

        {/* Channel Breakdown Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Payment Channel</th>
                <th className="py-2.5 px-4">Ledger Destination</th>
                <th className="py-2.5 px-4 text-right">Inflow (₹)</th>
                <th className="py-2.5 px-4 text-right">Outflow (₹)</th>
                <th className="py-2.5 px-4 text-right">Net Channel Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                  Physical Cash Drawer (கல்லா)
                </td>
                <td className="py-3 px-4 font-sans text-slate-500">Physical Counter Desk</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  ₹{metrics.cashIncome.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right text-red-600">
                  ₹{metrics.cashExpenses.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  ₹{(metrics.cashIncome - metrics.cashExpenses).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                  UPI / QR Code (GPay / PhonePe)
                </td>
                <td className="py-3 px-4 font-sans text-slate-500">Business Bank Account</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  ₹{metrics.upiIncome.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right text-slate-400">₹0.00</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  ₹{metrics.upiIncome.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                  Direct Bank Transfer (NEFT / RTGS)
                </td>
                <td className="py-3 px-4 font-sans text-slate-500">Current Account HDFC</td>
                <td className="py-3 px-4 text-right text-emerald-700 font-bold">
                  ₹{metrics.bankIncome.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4 text-right text-red-600">
                  ₹{metrics.todayExpenses > metrics.cashExpenses ? (metrics.todayExpenses - metrics.cashExpenses).toLocaleString('en-IN') : 0}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  ₹{(metrics.bankIncome - (metrics.todayExpenses > metrics.cashExpenses ? metrics.todayExpenses - metrics.cashExpenses : 0)).toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid 2: Sector Machine Turnaround & Outstanding Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Workload Report */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Sector Production Volume
          </h3>
          <div className="space-y-3">
            {sectors.map((s) => {
              const sectorOrders = orders.filter((o) => o.assignedSectorId === s.id);
              const sectorRevenue = sectorOrders.reduce((sum, o) => sum + o.pricing.totalAmount, 0);

              return (
                <div key={s.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {sectorOrders.length} total orders · Machine: {s.machinery.split('(')[0]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-slate-900">
                      ₹{sectorRevenue.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-500">Processed Value</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Receivables Ageing */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Customer Receivables
            </h3>
            <span className="font-mono text-xs font-bold text-red-600">
              ₹{metrics.totalOutstanding.toLocaleString('en-IN')} Due
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {customers
              .filter((c) => c.outstandingBalance > 0)
              .map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{c.name}</span>
                    {c.companyName && (
                      <span className="block text-[11px] text-slate-500">{c.companyName}</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">{c.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-red-600 text-sm">
                      ₹{c.outstandingBalance.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-slate-500">Upon pickup</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
