import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Smartphone,
  Building2,
  Package,
  Layers,
  CheckCircle,
  Clock,
  AlertTriangle,
  PlusCircle,
  Receipt,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    getLiveMetrics,
    activeShift,
    orders,
    transactions,
    auditLogs,
    sectors,
    setActiveView,
    setReceiptModalOrder,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');

  const metrics = getLiveMetrics();

  // Net Cash Flow
  const netProfit = metrics.todayIncome - metrics.todayExpenses;

  return (
    <div className="space-y-6">
      {/* View Title & Top Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial & Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time incoming/outgoing cash flows, sector workload balancing, and physical drawer (கல்லா) status.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-md transition-colors ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1 rounded-md transition-colors ${
                dateFilter === 'week' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded-md transition-colors ${
                dateFilter === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'hover:text-slate-900'
              }`}
            >
              This Month
            </button>
          </div>

          <button
            onClick={() => setActiveView('new-order')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Row 1: High-Priority Financial KPI Cards (60-30-10 Rule) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Received (Income) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Payments Received</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              ₹{metrics.todayIncome.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-medium">
              <span>Customer advances & balance settlements</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Cash: ₹{metrics.cashIncome.toLocaleString('en-IN')}</span>
            <span>UPI: ₹{metrics.upiIncome.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Card 2: Total Spent (Expenses) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Payments Made</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              ₹{metrics.todayExpenses.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span>Materials, rolls, petty cash, courier</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Cash Out: ₹{metrics.cashExpenses.toLocaleString('en-IN')}</span>
            <span>Bank: ₹{metrics.todayExpenses > metrics.cashExpenses ? (metrics.todayExpenses - metrics.cashExpenses).toLocaleString('en-IN') : 0}</span>
          </div>
        </div>

        {/* Card 3: Physical Cash Drawer (கல்லா) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-4 rounded-xl shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
              <span>Physical Cash (கல்லா)</span>
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
              {activeShift.status} Shift
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              ₹{metrics.expectedCash.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Opening float: ₹{activeShift.openingCash.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono truncate">
              Formula: Op + CashIn - CashOut
            </span>
            <button
              onClick={() => setActiveView('cash-shifts')}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              Count / Close →
            </button>
          </div>
        </div>

        {/* Card 4: Outstanding Customer Balances */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Outstanding Due From Customers</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              ₹{metrics.totalOutstanding.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">
              Receivable upon delivery collection
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Ready for pickup: {metrics.ordersReady} orders</span>
            <button
              onClick={() => setActiveView('orders')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Payment Channels & Production Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Payment Channel Breakdown (Real Money In) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Payment Channels Ledger
            </h3>
            <span className="text-[11px] text-slate-500">Today's Transactions</span>
          </div>

          <div className="space-y-3">
            {/* Cash */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Physical Cash Drawer</div>
                  <div className="text-[11px] text-slate-500">In: ₹{metrics.cashIncome.toLocaleString('en-IN')} · Out: ₹{metrics.cashExpenses.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                  ₹{(metrics.cashIncome - metrics.cashExpenses).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Net Cash Inflow</div>
              </div>
            </div>

            {/* UPI */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">UPI / QR (GPay / PhonePe)</div>
                  <div className="text-[11px] text-slate-500">Direct account deposits (No cash impact)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                  ₹{metrics.upiIncome.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium">100% Verified</div>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">NEFT / RTGS Bank Transfer</div>
                  <div className="text-[11px] text-slate-500">Supplier settlements & bulk accounts</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                  ₹{metrics.bankIncome.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Current A/C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Sector Workload & Automated Queue Depth */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Operating Sectors Load Distribution
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Madhavaram</span>
          </div>

          <div className="space-y-3">
            {sectors.map((sector) => {
              const pendingJobs = metrics.sectorLoadMap[sector.id] || 0;
              const loadPercent = Math.min(100, Math.round((pendingJobs / 6) * 100));

              return (
                <div
                  key={sector.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate max-w-[210px]">
                      {sector.name}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700">
                      {pendingJobs} jobs queued
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{sector.machinery}</p>

                  {/* Workload Progress Bar */}
                  <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pendingJobs > 3
                          ? 'bg-amber-500'
                          : pendingJobs > 0
                          ? 'bg-blue-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(15, loadPercent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                    <span>Capacity: {sector.maxDailyCapacity.toLocaleString('en-IN')} units</span>
                    <span className="font-medium text-slate-600">
                      {pendingJobs === 0
                        ? 'Available for jobs'
                        : pendingJobs <= 2
                        ? 'Optimal workload'
                        : 'Heavy workload'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Action Hub & Production Snapshot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Production Pipeline
              </h3>
              <span className="text-[11px] text-blue-600 font-semibold cursor-pointer" onClick={() => setActiveView('production')}>
                View Board →
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                <div className="text-[11px] font-medium text-amber-800">In Production</div>
                <div className="text-xl font-bold font-mono text-amber-900 mt-1">
                  {metrics.ordersInProduction}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">Active on printing beds</div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                <div className="text-[11px] font-medium text-emerald-800">Ready for Collection</div>
                <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
                  {metrics.ordersReady}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Completed & packed</div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Express Actions
              </div>
              <button
                onClick={() => setActiveView('new-order')}
                className="w-full py-2 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-between transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Quick POS Order (15s)</span>
                </div>
                <kbd className="px-1.5 py-0.5 bg-blue-500 text-[10px] rounded font-mono">F2</kbd>
              </button>

              <button
                onClick={() => setActiveView('expenses')}
                className="w-full py-2 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-between border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-slate-500" />
                  <span>Record Shop Outgoing Expense</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveView('cash-shifts')}
                className="w-full py-2 px-3 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-lg flex items-center justify-between border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-slate-500" />
                  <span>Shift Handover & Cash Count</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Active Orders Table & Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Recent Orders Requiring Action */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Orders in Madhavaram Shop
              </h3>
              <p className="text-xs text-slate-500">
                Sorted by delivery due time & priority
              </p>
            </div>
            <button
              onClick={() => setActiveView('orders')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              All Orders ({orders.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Order No</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Service & Specs</th>
                  <th className="py-2.5 px-4 font-semibold">Sector</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Balance</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{order.serviceName}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.specs.width}×{order.specs.height} {order.specs.unit} · {order.specs.material.split(' ')[0]}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {order.assignedSectorName.split('—')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                          order.status === 'Ready for Collection'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'In Production'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Quality Check'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {order.pricing.balanceDue > 0 ? (
                        <span className="text-red-600 font-semibold">
                          ₹{order.pricing.balanceDue.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Paid</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setReceiptModalOrder(order)}
                        className="p-1 text-slate-500 hover:text-blue-600 transition-colors rounded hover:bg-slate-100"
                        title="Print Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 Col): Real-Time Audit Log & Security Events */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Live Audit Stream</span>
              </div>
              <span className="text-[11px] text-slate-500 cursor-pointer hover:text-slate-800" onClick={() => setActiveView('audit')}>
                Full Log →
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-1 max-h-[360px] overflow-y-auto">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="py-2.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                    <span className="font-semibold text-slate-700">{log.action.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">By {log.performedBy}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              All financial actions recorded immutably
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
