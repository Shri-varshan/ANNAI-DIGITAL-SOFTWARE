import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  Monitor,
  PlusCircle,
  Clock,
  CheckCircle2,
  Layers,
  Ruler,
  Printer,
  Search,
  ArrowRight,
  Palette,
  FileCheck,
  Phone,
  User,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const DesignerDashboardView: React.FC = () => {
  const {
    currentUser,
    orders,
    designs,
    setActiveView,
    setDesignerTokenOrder,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'AWAITING' | 'PRODUCTION' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currentSystemNo = currentUser.systemNo || 'System 01';

  // Filter orders created by this terminal / designer, or matching system
  const myOrders = orders.filter((o) => {
    // If user is a designer, prioritize their system or operatorId
    if (currentUser.role === 'DESIGNER') {
      return (
        o.designerSystemNo === currentSystemNo ||
        o.operatorId === currentUser.id ||
        o.designerId === currentUser.id
      );
    }
    // If owner or other role viewing this dashboard, show all designer-tagged orders
    return true;
  });

  // KPI calculations
  const totalTickets = myOrders.length;
  const awaitingBilling = myOrders.filter((o) => o.status === 'Awaiting Billing');
  const inProduction = myOrders.filter((o) =>
    ['Confirmed', 'In Production', 'Quality Check'].includes(o.status)
  );
  const completedJobs = myOrders.filter((o) =>
    ['Ready for Collection', 'Completed'].includes(o.status)
  );

  const totalSqFt = myOrders.reduce((sum, o) => {
    const area =
      o.specs.unit === 'ft'
        ? o.specs.width * o.specs.height
        : (o.specs.width * o.specs.height) / 144;
    return sum + (area || 0);
  }, 0);

  // Tab Filtering
  const displayedOrders = myOrders.filter((o) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'AWAITING'
        ? o.status === 'Awaiting Billing'
        : activeTab === 'PRODUCTION'
        ? ['Confirmed', 'In Production', 'Quality Check'].includes(o.status)
        : ['Ready for Collection', 'Completed'].includes(o.status);

    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      (o.specs.artworkFileName &&
        o.specs.artworkFileName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/30 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Workstation Terminal
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-300 text-xs font-mono">
                {currentUser.name}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
              <span>Designer Command Desk</span>
              <span className="text-xs font-bold font-mono bg-blue-500 text-white px-2.5 py-1 rounded-lg">
                🖥️ {currentSystemNo}
              </span>
            </h1>
            <p className="text-slate-300 text-xs max-w-xl leading-relaxed">
              Create customer job tickets, upload and verify design files, and issue token slips for billing. Commercial quantities and payments are handled exclusively at the Cashier counter.
            </p>
          </div>

          <button
            onClick={() => setActiveView('new-order')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Design Ticket (F2)</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Today's Tickets</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalTickets}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Created from {currentSystemNo}
          </div>
        </div>

        {/* Awaiting Billing */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">At Cash Counter</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            {awaitingBilling.length}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">
            Waiting for quantity & payment
          </div>
        </div>

        {/* In Printing Floor */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Printing in Back</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 font-mono">
            {inProduction.length}
          </div>
          <div className="text-[11px] text-blue-600/80 mt-1">
            Authorized by Cashier
          </div>
        </div>

        {/* Total SqFt Output */}
        <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Designed</span>
            <Ruler className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono">
            {Math.round(totalSqFt)} <span className="text-xs font-normal">sq.ft</span>
          </div>
          <div className="text-[11px] text-indigo-600/80 mt-1">
            Completed: {completedJobs.length} jobs
          </div>
        </div>
      </div>

      {/* Main Jobs Queue & Template Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Jobs List (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Bar & Tabs */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'ALL', label: 'All Jobs', count: myOrders.length },
                  { id: 'AWAITING', label: 'At Cashier', count: awaitingBilling.length },
                  { id: 'PRODUCTION', label: 'Printing Floor', count: inProduction.length },
                  { id: 'COMPLETED', label: 'Completed', count: completedJobs.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search token, customer, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Jobs Cards / List */}
          <div className="space-y-3">
            {displayedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No design tickets found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click the button below to take a new customer order and generate their job token.
                </p>
                <button
                  onClick={() => setActiveView('new-order')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  + Create First Ticket
                </button>
              </div>
            ) : (
              displayedOrders.map((order) => {
                const area =
                  order.specs.unit === 'ft'
                    ? order.specs.width * order.specs.height
                    : Number(((order.specs.width * order.specs.height) / 144).toFixed(1));

                const isAwaiting = order.status === 'Awaiting Billing';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isAwaiting
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-blue-900 text-sm">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isAwaiting
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : order.status === 'In Production'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'Ready for Collection'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {isAwaiting ? 'Awaiting Cashier Billing' : order.status}
                        </span>
                        <span className="text-slate-400 text-xs font-mono">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {order.customerName}
                          </div>
                          <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{order.customerPhone}</span>
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold text-slate-800">
                            {order.serviceName}
                          </div>
                          <div className="text-blue-700 font-mono font-bold text-[11px]">
                            {order.specs.width} × {order.specs.height} {order.specs.unit} ({area} sq.ft)
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono truncate max-w-lg">
                        📄 File: {order.specs.artworkFileName || order.specs.shopTemplateCode || 'murugan_banner_10x4.tif'}
                        {order.specs.customerNotes && (
                          <span className="text-slate-500 italic ml-2">
                            &ldquo;{order.specs.customerNotes}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      <button
                        onClick={() => setDesignerTokenOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors"
                        title="Print / View Customer Token Chit"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Token Slip</span>
                      </button>

                      {isAwaiting ? (
                        <div className="text-right">
                          <span className="text-[10px] text-amber-800 font-bold block">
                            Token with Customer
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Waiting for Cashier
                          </span>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className="text-[11px] text-emerald-700 font-bold block">
                            Authorized
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Cashier: {order.cashierName || 'Praveen'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quick Shop Template Launcher (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Shop PC Templates</span>
              </h3>
              <button
                onClick={() => setActiveView('designs')}
                className="text-[11px] text-blue-600 font-semibold hover:underline"
              >
                Catalogue
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Standard shop-floor designs ready in <strong>D:\DESIGNS\</strong> for instant CorelDraw / Photoshop editing:
            </p>

            <div className="space-y-2">
              {designs.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  onClick={() => setActiveView('new-order')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{d.title}</div>
                    <div className="text-[10px] font-mono text-blue-700 font-semibold">{d.code}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveView('new-order')}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Open Full Designer Intake
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
