import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';

export const ProductionView: React.FC = () => {
  const { orders, sectors, updateOrderStatus, setReceiptModalOrder } = useApp();
  const [selectedSectorId, setSelectedSectorId] = useState<string>('ALL');

  const productionOrders = orders.filter((o) =>
    ['Confirmed', 'In Production', 'Quality Check', 'Ready for Collection'].includes(o.status)
  );

  const filteredOrders = productionOrders.filter((order) => {
    return selectedSectorId === 'ALL' || order.assignedSectorId === selectedSectorId;
  });

  const columns: { status: OrderStatus; title: string; color: string }[] = [
    { status: 'Confirmed', title: 'Confirmed / Queued', color: 'border-slate-300 bg-slate-50' },
    { status: 'In Production', title: 'In Production (Printing)', color: 'border-blue-300 bg-blue-50/40' },
    { status: 'Quality Check', title: 'Finishing & QC', color: 'border-purple-300 bg-purple-50/40' },
    { status: 'Ready for Collection', title: 'Ready for Pickup', color: 'border-emerald-300 bg-emerald-50/40' },
  ];

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'Confirmed':
        return 'In Production';
      case 'In Production':
        return 'Quality Check';
      case 'Quality Check':
        return 'Ready for Collection';
      case 'Ready for Collection':
        return 'Completed';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Shop Floor Production Queue</span>
            <span className="text-xs font-mono font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {filteredOrders.length} Active Jobs
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Workload distribution across Madhavaram printing machines and sector operators.
          </p>
        </div>

        {/* Sector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-700">
          <button
            onClick={() => setSelectedSectorId('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              selectedSectorId === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
            }`}
          >
            All Sectors ({productionOrders.length})
          </button>
          {sectors.map((s) => {
            const count = productionOrders.filter((o) => o.assignedSectorId === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSectorId(s.id)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedSectorId === s.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {s.code}: {s.name.split('—')[0]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Production Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              className={`rounded-xl border ${col.color} p-4 flex flex-col min-h-[500px] shadow-xs`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {col.title}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {colOrders.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No jobs currently in this stage.
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const nextSt = getNextStatus(order.status);
                    const isHighPriority = order.priority === 'HIGH' || order.priority === 'URGENT';

                    return (
                      <div
                        key={order.id}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
                      >
                        {/* Top row: Order Num & Priority */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-slate-900">
                            {order.orderNumber}
                          </span>
                          {isHighPriority && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-mono">
                              {order.priority}
                            </span>
                          )}
                        </div>

                        {/* Service & Specs */}
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {order.serviceName}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                            {order.specs.width}×{order.specs.height} {order.specs.unit} ({order.specs.quantity} qty)
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Material: {order.specs.material}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Finish: {order.specs.finish}
                          </div>
                        </div>

                        {/* Artwork File / Template Direct Access Box */}
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                            <span>Design Source:</span>
                            <span className="text-blue-700 font-mono font-semibold">
                              {order.specs.artworkSource === 'SHOP_TEMPLATE' ? 'Shop PC Template' : 'Customer File'}
                            </span>
                          </div>
                          {order.specs.artworkSource === 'SHOP_TEMPLATE' ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {order.specs.shopTemplateCode || order.designCode || 'FLEX-GRAND-01'}
                                </span>
                                <span className="text-[10px] text-slate-500">Edit in CorelDraw/PSD</span>
                              </div>
                              {order.specs.templateModifications && (
                                <div className="text-[10px] text-slate-700 mt-1 bg-white p-1 rounded border border-slate-200">
                                  <span className="font-semibold text-slate-900">Text:</span> {order.specs.templateModifications}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-slate-200">
                              <span className="font-mono font-medium text-slate-800 truncate max-w-[150px]" title={order.specs.artworkFileName || 'WhatsApp-Banner-Print.pdf'}>
                                📂 {order.specs.artworkFileName || 'WhatsApp-Banner-Print.pdf'}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                                RIP READY
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Customer note if any */}
                        {order.specs.customerNotes && (
                          <div className="p-1.5 bg-amber-50 rounded text-[10px] text-amber-900 border border-amber-200/60 leading-tight">
                            Note: {order.specs.customerNotes}
                          </div>
                        )}

                        {/* Sector Attribution Tag */}
                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {order.assignedSectorName.split('—')[0]}
                          </span>
                          <span className="text-slate-400 font-mono">
                            Due: {new Date(order.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setReceiptModalOrder(order)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                            title="Print Work Order Chit"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {nextSt && (
                            <button
                              onClick={() => updateOrderStatus(order.id, nextSt)}
                              className="flex-1 py-1 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Next: {nextSt}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
