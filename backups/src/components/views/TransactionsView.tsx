import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Transaction, PaymentMethod } from '../../types';
import {
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Wallet,
  Smartphone,
  Building2,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const { transactions, sectors } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      (t.orderNumber && t.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.externalRef && t.externalRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || t.paymentMethod === methodFilter;
    const matchesDirection = directionFilter === 'ALL' || t.direction === directionFilter;

    return matchesSearch && matchesMethod && matchesDirection;
  });

  const exportCSV = () => {
    const headers = 'ID,Date,Direction,Amount,Method,Category,OrderNo,Sector,Operator,Reference,Notes\n';
    const rows = filtered.map((t) =>
      `"${t.id}","${t.timestamp}","${t.direction}","${t.amount}","${t.paymentMethod}","${t.category}","${t.orderNumber || ''}","${t.sectorName || ''}","${t.operatorName}","${t.externalRef || ''}","${t.notes || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annai_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const totalIn = filtered.filter((t) => t.direction === 'IN').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = filtered.filter((t) => t.direction === 'OUT').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Unified record of all incoming receipts and outgoing expenditures across all sectors.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Ledger</span>
        </button>
      </div>

      {/* Summary Mini Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Filtered Inflow</div>
            <div className="text-xl font-bold text-emerald-700 font-mono mt-1 tabular-nums">
              ₹{totalIn.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Filtered Outflow</div>
            <div className="text-xl font-bold text-red-600 font-mono mt-1 tabular-nums">
              ₹{totalOut.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Net Settlement</div>
            <div className="text-xl font-bold text-blue-700 font-mono mt-1 tabular-nums">
              ₹{(totalIn - totalOut).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {filtered.length} entries
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order No, UTR reference, notes..."
            className="w-full text-xs px-3 py-2 pl-9 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">CASH (Physical Drawer)</option>
            <option value="UPI">UPI / GPay / QR</option>
            <option value="BANK">Bank Transfer (NEFT)</option>
          </select>
        </div>

        <div>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
          >
            <option value="ALL">All Directions (IN & OUT)</option>
            <option value="IN">Incoming Only (Receipts)</option>
            <option value="OUT">Outgoing Only (Expenses)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Date & Time</th>
                <th className="py-2.5 px-4 font-semibold">Direction</th>
                <th className="py-2.5 px-4 font-semibold">Category & Order</th>
                <th className="py-2.5 px-4 font-semibold">Sector Attribution</th>
                <th className="py-2.5 px-4 font-semibold">Channel</th>
                <th className="py-2.5 px-4 font-semibold">External Reference</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-4 font-semibold">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(t.timestamp).toLocaleDateString('en-IN')}{' '}
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  <td className="py-3 px-4">
                    {t.direction === 'IN' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                        IN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px]">
                        <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                        OUT
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{t.category.replace(/_/g, ' ')}</div>
                    {t.orderNumber && (
                      <span className="text-[10px] text-blue-600 font-mono font-medium block">
                        {t.orderNumber}
                      </span>
                    )}
                    {t.notes && <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{t.notes}</div>}
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {t.sectorName ? t.sectorName.split('—')[0] : 'Shared Counter'}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                        t.paymentMethod === 'CASH'
                          ? 'bg-amber-100 text-amber-900'
                          : t.paymentMethod === 'UPI'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-indigo-100 text-indigo-900'
                      }`}
                    >
                      {t.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {t.externalRef || '—'}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                    {t.direction === 'IN' ? (
                      <span className="text-emerald-700">+₹{t.amount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-red-600">-₹{t.amount.toLocaleString('en-IN')}</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {t.operatorName.split(' ')[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
