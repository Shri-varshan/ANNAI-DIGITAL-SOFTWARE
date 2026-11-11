import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Palette,
  Layers,
  Users,
  ArrowLeftRight,
  Receipt,
  Wallet,
  BarChart3,
  ShieldCheck,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, orders, activeShift, currentUser } = useApp();

  const inProductionCount = orders.filter((o) =>
    ['Confirmed', 'In Production', 'Quality Check'].includes(o.status)
  ).length;

  const awaitingBillingCount = orders.filter((o) => o.status === 'Awaiting Billing').length;

  let navItems: NavItem[] = [];

  if (currentUser.role === 'DESIGNER') {
    navItems = [
      { id: 'designer-dashboard', label: 'Designer Dashboard', icon: LayoutDashboard },
      { id: 'new-order', label: 'New Design Ticket', icon: PlusCircle, badge: 'F2' },
      { id: 'orders', label: 'Track All Orders', icon: Package, badge: orders.length },
      { id: 'designs', label: 'Design Catalogue', icon: Palette },
      { id: 'customers', label: 'Customer Directory', icon: Users },
    ];
  } else if (currentUser.role === 'BILLING_OPERATOR') {
    navItems = [
      {
        id: 'cashier-dashboard',
        label: 'Cashier Dashboard',
        icon: LayoutDashboard,
        badge: awaitingBillingCount > 0 ? `${awaitingBillingCount} to bill` : undefined,
        badgeColor: 'bg-amber-500 text-white font-bold animate-pulse',
      },
      { id: 'orders', label: 'Billing & Orders', icon: Package, badge: orders.length },
      { id: 'new-order', label: 'Designer Desk (Intake)', icon: PlusCircle, badge: 'F2' },
      {
        id: 'cash-shifts',
        label: 'Cash & Shift (கல்லா)',
        icon: Wallet,
        badge: `₹${(activeShift.expectedCash / 1000).toFixed(1)}k`,
      },
      { id: 'expenses', label: 'Expenses (Petty Cash)', icon: Receipt },
      { id: 'customers', label: 'Customers & Balances', icon: Users },
      { id: 'reports', label: 'Daily Reports', icon: BarChart3 },
    ];
  } else if (currentUser.role === 'PRODUCTION_STAFF') {
    navItems = [
      {
        id: 'production',
        label: 'Production Queue',
        icon: Layers,
        badge: inProductionCount,
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      { id: 'orders', label: 'All Jobs List', icon: Package, badge: orders.length },
      { id: 'designs', label: 'Design Catalogue', icon: Palette },
    ];
  } else {
    // Owner / Super Admin
    navItems = [
      { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
      { id: 'cashier-dashboard', label: 'Cashier Desk (கல்லா)', icon: Wallet },
      { id: 'designer-dashboard', label: 'Designer Desk', icon: Palette },
      { id: 'new-order', label: 'New Order (Intake)', icon: PlusCircle, badge: 'F2' },
      {
        id: 'orders',
        label: 'Orders & Billing',
        icon: Package,
        badge: awaitingBillingCount > 0 ? `${awaitingBillingCount} bill` : orders.length,
        badgeColor: awaitingBillingCount > 0 ? 'bg-amber-500 text-white font-bold animate-pulse' : undefined,
      },
      {
        id: 'production',
        label: 'Production Queue',
        icon: Layers,
        badge: inProductionCount,
        badgeColor: 'bg-blue-100 text-blue-800',
      },
      { id: 'designs', label: 'Design Catalogue', icon: Palette },
      { id: 'customers', label: 'Customers', icon: Users },
      { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
      { id: 'expenses', label: 'Expenses', icon: Receipt },
      {
        id: 'cash-shifts',
        label: 'Cash & Shifts (கல்லா)',
        icon: Wallet,
        badge: `₹${(activeShift.expectedCash / 1000).toFixed(1)}k`,
      },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'audit', label: 'Audit Log', icon: ShieldCheck },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];
  }

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Top Header / Branding Subtitle */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white tracking-wide uppercase">
            Operations & Control
          </span>
          <span className="text-[11px] text-slate-400">
            Madhavaram Shop Desk
          </span>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" title="System Live" />
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isPosAction = item.id === 'new-order';

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? isPosAction
                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                    : 'bg-slate-800 text-white font-semibold'
                  : isPosAction
                  ? 'text-blue-400 hover:bg-slate-800/80 hover:text-blue-300'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? isPosAction
                        ? 'text-white'
                        : 'text-blue-400'
                      : 'text-slate-400'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Physical Cash Drawer (கல்லா) Status Box */}
      <div className="p-3 m-3 rounded-lg bg-slate-950 border border-slate-800">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-slate-400 font-medium">Physical Cash கல்லா</span>
          <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
            {activeShift.status}
          </span>
        </div>
        <div className="text-lg font-bold text-white font-mono tabular-nums">
          ₹{activeShift.expectedCash.toLocaleString('en-IN')}
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-snug">
          Opening: ₹{activeShift.openingCash.toLocaleString('en-IN')} · Single shared drawer across all 3 sectors
        </p>
        <button
          onClick={() => setActiveView('cash-shifts')}
          className="mt-2 w-full py-1.5 text-center text-[11px] font-semibold text-blue-400 bg-blue-950/40 hover:bg-blue-900/50 rounded border border-blue-800/50 transition-colors"
        >
          Shift Handover & Reconcile
        </button>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span>v2.4 Production</span>
        <span>Madhavaram (MDV)</span>
      </div>
    </aside>
  );
};
