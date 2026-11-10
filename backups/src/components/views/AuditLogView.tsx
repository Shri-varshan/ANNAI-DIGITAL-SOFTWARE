import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, Clock, User, FileText } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filtered = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || log.entityType === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Immutable Security & Operations Audit Log</span>
          </h1>
          <p className="text-xs text-slate-500">
            Traceable timeline of all orders, payments, sector overrides, expenses, and shift custody transfers.
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          {auditLogs.length} Logged Events
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Operator Name, Order ID, or Event Details..."
            className="w-full text-xs px-3 py-2 pl-9 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {['ALL', 'ORDER', 'PAYMENT', 'EXPENSE', 'SHIFT', 'SETTINGS'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                typeFilter === type
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'All Events' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Stream Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Scope</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Details & Rationale</th>
                <th className="py-2.5 px-4">Responsible User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString('en-IN')}{' '}
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        log.entityType === 'ORDER'
                          ? 'bg-blue-100 text-blue-900'
                          : log.entityType === 'PAYMENT'
                          ? 'bg-emerald-100 text-emerald-900'
                          : log.entityType === 'EXPENSE'
                          ? 'bg-red-100 text-red-900'
                          : log.entityType === 'SHIFT'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      {log.entityType}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900 font-mono text-[11px]">
                    {log.action}
                  </td>

                  <td className="py-3 px-4 text-slate-700 max-w-md">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                    {log.performedBy}
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
