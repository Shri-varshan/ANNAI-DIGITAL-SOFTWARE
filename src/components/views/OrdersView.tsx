import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, PaymentMethod } from '../../types';
import {
  Search,
  Filter,
  Printer,
  ChevronRight,
  Clock,
  CheckCircle,
  IndianRupee,
  Layers,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    orders,
    sectors,
    updateOrderStatus,
    recordOrderPayment,
    setReceiptModalOrder,
    setActiveView,
    setCashierBillingOrder,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const awaitingBillingOrders = orders.filter((o) => o.status === 'Awaiting Billing');

  // Quick Balance Collection inside detail drawer
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>('CASH');
  const [collectRef, setCollectRef] = useState<string>('');
  const [showCollectBox, setShowCollectBox] = useState<boolean>(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      (order.companyName && order.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSector = sectorFilter === 'ALL' || order.assignedSectorId === sectorFilter;

    return matchesSearch && matchesStatus && matchesSector;
  });

  const handleOpenCollect = (order: Order) => {
    setSelectedOrder(order);
    setCollectAmount(order.pricing.balanceDue);
    setShowCollectBox(true);
  };

  const handleConfirmCollect = () => {
    if (!selectedOrder || collectAmount <= 0) return;
    recordOrderPayment(selectedOrder.id, collectAmount, collectMethod, collectRef);
    setShowCollectBox(false);

    // Refresh selectedOrder view
    const updated = orders.find((o) => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Order Management & Life-Cycle
          </h1>
          <p className="text-xs text-slate-500">
            Real-time track of {orders.length} printing jobs across Madhavaram sectors.
          </p>
        </div>

        <button
          onClick={() => setActiveView('new-order')}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
        >
          + Designer Desk (Intake)
        </button>
      </div>

      {/* Pending Designer Jobs Banner for Cashier */}
      {awaitingBillingOrders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-sm font-bold text-amber-900 tracking-tight flex items-center gap-2">
                <span>Jobs Awaiting Cashier Billing</span>
                <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {awaitingBillingOrders.length} Waiting
                </span>
              </h2>
            </div>
            <span className="text-xs text-amber-800 font-medium hidden sm:inline">
              Sent from Designer Desks · Finalize quantity, material & payment to authorize printing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {awaitingBillingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono font-bold text-blue-900 text-xs">
                      {order.orderNumber}
                    </span>
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      🖥️ {order.designerSystemNo || 'System 01'}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {order.customerName}
                  </div>
                  <div className="text-slate-500 text-[11px] font-mono">
                    {order.customerPhone}
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-1 truncate">
                    {order.serviceName}
                  </div>
                  <div className="text-[11px] text-blue-700 font-mono font-semibold mt-0.5">
                    Size: {order.specs.width} × {order.specs.height} {order.specs.unit} ({(order.specs.unit === 'ft' ? order.specs.width * order.specs.height : (order.specs.width * order.specs.height) / 144).toFixed(1)} sq.ft)
                  </div>
                </div>

                <button
                  onClick={() => setCashierBillingOrder(order)}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Finalize Bill & Collect Advance</span>
                  <span className="text-blue-200">➔</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Bill No, Customer, Mobile, or Shop..."
              className="w-full text-xs px-3 py-2 pl-9 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status Tabs */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
            >
              <option value="ALL">All Statuses ({orders.length})</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Production">In Production</option>
              <option value="Quality Check">Quality Check</option>
              <option value="Ready for Collection">Ready for Collection</option>
              <option value="Completed">Completed / Collected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
            >
              <option value="ALL">All Sectors (1, 2, 3)</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Order Bill</th>
                <th className="py-3 px-4 font-semibold">Customer Details</th>
                <th className="py-3 px-4 font-semibold">Service & Specs</th>
                <th className="py-3 px-4 font-semibold">Assigned Sector</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
                <th className="py-3 px-4 font-semibold text-right">Balance Due</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowCollectBox(false);
                    }}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div>{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      {order.companyName && (
                        <div className="text-[11px] text-slate-600">{order.companyName}</div>
                      )}
                      <div className="text-[11px] text-slate-400 font-mono">{order.customerPhone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{order.serviceName}</div>
                      <div className="text-[11px] text-slate-500">
                        {order.specs.width}×{order.specs.height} {order.specs.unit} ({order.specs.quantity} qty) · {order.specs.finish}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block">
                        {order.assignedSectorName.split('—')[0]}
                      </span>
                      {order.isOverride && (
                        <span className="block text-[10px] text-amber-700 font-mono mt-0.5">
                          (Manual Override)
                        </span>
                      )}
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
                            : order.status === 'Completed'
                            ? 'bg-slate-100 text-slate-800'
                            : order.status === 'Awaiting Billing'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.designerSystemNo && (
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                          🖥️ {order.designerSystemNo}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {order.status === 'Awaiting Billing' ? (
                        <span className="text-amber-700 text-xs font-semibold">Pending Billing</span>
                      ) : (
                        `₹${order.pricing.totalAmount.toLocaleString('en-IN')}`
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      {order.status === 'Awaiting Billing' ? (
                        <span className="text-slate-400 text-xs">--</span>
                      ) : order.pricing.balanceDue > 0 ? (
                        <span className="text-red-600 font-bold">
                          ₹{order.pricing.balanceDue.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Settled</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {order.status === 'Awaiting Billing' ? (
                          <button
                            onClick={() => setCashierBillingOrder(order)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold shadow-xs transition-colors"
                          >
                            Bill & Collect
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setReceiptModalOrder(order)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                              title="Print Receipt / Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {order.pricing.balanceDue > 0 && (
                              <button
                                onClick={() => handleOpenCollect(order)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-semibold border border-emerald-200"
                                title="Collect Remaining Balance"
                              >
                                Settle ₹{order.pricing.balanceDue}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal / Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-base font-bold text-slate-900">
                  {selectedOrder.orderNumber}
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  Created {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Status Progression */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Update Production Status
                </span>
                <span className="text-xs text-blue-600 font-semibold font-mono">
                  Current: {selectedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['In Production', 'Quality Check', 'Ready for Collection', 'Completed'] as OrderStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => updateOrderStatus(selectedOrder.id, st)}
                      className={`py-2 px-2 text-center rounded-lg text-xs font-semibold transition-all ${
                        selectedOrder.status === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Specifications & Sector Assignment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 border-b pb-1">Customer & Job Specs</div>
                <div><span className="text-slate-500">Customer:</span> <span className="font-semibold">{selectedOrder.customerName}</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="font-mono">{selectedOrder.customerPhone}</span></div>
                {selectedOrder.companyName && <div><span className="text-slate-500">Shop:</span> {selectedOrder.companyName}</div>}
                <div><span className="text-slate-500">Service:</span> <span className="font-semibold text-blue-700">{selectedOrder.serviceName}</span></div>
                <div><span className="text-slate-500">Dimensions:</span> {selectedOrder.specs.width}×{selectedOrder.specs.height} {selectedOrder.specs.unit} ({selectedOrder.specs.quantity} units)</div>
                <div><span className="text-slate-500">Material:</span> {selectedOrder.specs.material}</div>
                <div><span className="text-slate-500">Finish:</span> {selectedOrder.specs.finish}</div>
                {selectedOrder.specs.customerNotes && (
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-900 text-[11px] mt-1">
                    Note: {selectedOrder.specs.customerNotes}
                  </div>
                )}
              </div>

              <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-900 border-b pb-1">Sector & Financials</div>
                <div><span className="text-slate-500">Sector:</span> <span className="font-semibold text-slate-900">{selectedOrder.assignedSectorName}</span></div>
                <div className="text-[11px] text-slate-500 italic">{selectedOrder.assignmentReason}</div>
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-mono">₹{selectedOrder.pricing.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Finishing:</span>
                  <span className="font-mono">₹{selectedOrder.pricing.finishingCharges}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount:</span>
                  <span className="font-mono text-emerald-700">-₹{selectedOrder.pricing.discountAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-1">
                  <span>Total Amount:</span>
                  <span className="font-mono text-blue-700">₹{selectedOrder.pricing.totalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Advance Received:</span>
                  <span className="font-mono">₹{selectedOrder.pricing.advancePaid}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹{selectedOrder.pricing.balanceDue}</span>
                </div>
              </div>
            </div>

            {/* Collect Balance Box if balance > 0 */}
            {selectedOrder.pricing.balanceDue > 0 && (
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Collect Customer Balance Payment
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      max={selectedOrder.pricing.balanceDue}
                      value={collectAmount}
                      onChange={(e) => setCollectAmount(Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold px-3 py-1.5 border border-emerald-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={collectMethod}
                      onChange={(e) => setCollectMethod(e.target.value as any)}
                      className="w-full text-xs font-medium px-3 py-1.5 border border-emerald-300 rounded-md bg-white"
                    >
                      <option value="CASH">Cash கல்லா</option>
                      <option value="UPI">UPI / GPay / QR</option>
                      <option value="BANK">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleConfirmCollect}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold shadow-xs"
                    >
                      Confirm Collection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                onClick={() => setReceiptModalOrder(selectedOrder)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill Chit</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
