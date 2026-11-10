import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { NewOrderView } from './components/views/NewOrderView';
import { OrdersView } from './components/views/OrdersView';
import { ProductionView } from './components/views/ProductionView';
import { DesignCatalogueView } from './components/views/DesignCatalogueView';
import { CustomersView } from './components/views/CustomersView';
import { TransactionsView } from './components/views/TransactionsView';
import { ExpensesView } from './components/views/ExpensesView';
import { CashShiftsView } from './components/views/CashShiftsView';
import { ReportsView } from './components/views/ReportsView';
import { AuditLogView } from './components/views/AuditLogView';
import { SettingsView } from './components/views/SettingsView';
import { ThermalReceiptModal } from './components/common/ThermalReceipt';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, receiptModalOrder, setReceiptModalOrder } = useApp();

  // Keyboard shortcut listener (e.g. F2 for quick POS order entry)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveView('new-order');
      } else if (e.key === 'Escape') {
        if (receiptModalOrder) {
          setReceiptModalOrder(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView, receiptModalOrder, setReceiptModalOrder]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeView === 'overview' && <OverviewView />}
            {activeView === 'new-order' && <NewOrderView />}
            {activeView === 'orders' && <OrdersView />}
            {activeView === 'production' && <ProductionView />}
            {activeView === 'designs' && <DesignCatalogueView />}
            {activeView === 'customers' && <CustomersView />}
            {activeView === 'transactions' && <TransactionsView />}
            {activeView === 'expenses' && <ExpensesView />}
            {activeView === 'cash-shifts' && <CashShiftsView />}
            {activeView === 'reports' && <ReportsView />}
            {activeView === 'audit' && <AuditLogView />}
            {activeView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Thermal Receipt & Tax Invoice Modal */}
      {receiptModalOrder && (
        <ThermalReceiptModal
          order={receiptModalOrder}
          onClose={() => setReceiptModalOrder(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
