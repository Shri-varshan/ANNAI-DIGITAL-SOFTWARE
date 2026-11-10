import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Search, PlusCircle, Phone, Building, ArrowUpRight } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, setActiveView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer & Corporate Account Directory</span>
            <span className="text-xs font-mono font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {customers.length} Accounts
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Account balances, order history, and phone-number indexed lookup.
          </p>
        </div>

        <div className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          Total Customer Receivables: ₹{totalOutstanding.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Customer Name, 10-Digit Mobile, or Shop..."
            className="w-full text-xs px-3 py-2 pl-9 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer / Contact</th>
                <th className="py-3 px-4 font-semibold">Business / Shop</th>
                <th className="py-3 px-4 font-semibold text-center">Total Orders</th>
                <th className="py-3 px-4 font-semibold text-right">Lifetime Spend</th>
                <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {c.companyName ? (
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.companyName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Individual Walk-in</span>
                    )}
                    {c.address && (
                      <div className="text-[10px] text-slate-500 truncate max-w-[220px]">
                        {c.address}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                    {c.totalOrders}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{c.totalSpent.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {c.outstandingBalance > 0 ? (
                      <span className="text-red-600">
                        ₹{c.outstandingBalance.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-emerald-600">₹0.00</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setActiveView('new-order')}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded text-[11px] border border-blue-200 transition-colors"
                    >
                      Bill Order
                    </button>
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
