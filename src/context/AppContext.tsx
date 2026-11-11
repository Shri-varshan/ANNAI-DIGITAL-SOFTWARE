import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuditEvent,
  Branch,
  Customer,
  DesignItem,
  Order,
  OrderSpecs,
  OrderPricing,
  OrderStatus,
  PaymentMethod,
  Sector,
  Service,
  ShiftRecord,
  Transaction,
  TransactionCategory,
  User,
} from '../types';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BRANCHES,
  INITIAL_CUSTOMERS,
  INITIAL_DESIGNS,
  INITIAL_ORDERS,
  INITIAL_SECTORS,
  INITIAL_SERVICES,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_ACTIVE_SHIFT,
} from '../data/seedData';

export type AppView =
  | 'overview'
  | 'new-order'
  | 'orders'
  | 'production'
  | 'designs'
  | 'customers'
  | 'transactions'
  | 'expenses'
  | 'cash-shifts'
  | 'reports'
  | 'audit'
  | 'settings';

interface CreateOrderPayload {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  companyName?: string;
  serviceId: string;
  designId?: string;
  specs: OrderSpecs;
  pricing: {
    unitRate: number;
    calculatedArea?: number;
    subtotal: number;
    finishingCharges: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    advancePaid: number;
    balanceDue: number;
  };
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  overrideSectorId?: string;
  overrideReason?: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  dueDate?: string;
}

interface AppContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  branches: Branch[];
  sectors: Sector[];
  services: Service[];
  designs: DesignItem[];
  customers: Customer[];
  orders: Order[];
  transactions: Transaction[];
  shifts: ShiftRecord[];
  activeShift: ShiftRecord;
  auditLogs: AuditEvent[];
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;
  receiptModalOrder: Order | null;
  setReceiptModalOrder: (order: Order | null) => void;
  designerTokenOrder: Order | null;
  setDesignerTokenOrder: (order: Order | null) => void;
  cashierBillingOrder: Order | null;
  setCashierBillingOrder: (order: Order | null) => void;
  isBackendConnected: boolean;
  refreshBackendData: () => Promise<void>;
  // Actions
  createOrder: (payload: CreateOrderPayload) => Order;
  createDesignerJobTicket: (data: {
    customerName: string;
    customerPhone: string;
    companyName?: string;
    serviceId: string;
    designId?: string;
    specs: OrderSpecs;
    designerSystemNo: string;
    priority?: 'NORMAL' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }) => Promise<Order>;
  finalizeCashierBilling: (data: {
    orderId: string;
    quantity: number;
    material: string;
    finish: string;
    customerNotes?: string;
    pricing: OrderPricing;
    paymentMethod: PaymentMethod;
    paymentRef?: string;
    creditAuthorized?: boolean;
    creditReason?: string;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  recordOrderPayment: (orderId: string, amount: number, method: PaymentMethod, ref?: string) => void;
  recordExpense: (data: {
    amount: number;
    category: TransactionCategory;
    paymentMethod: PaymentMethod;
    sectorId?: string;
    notes?: string;
    externalRef?: string;
  }) => void;
  reconcileAndCloseShift: (
    actualCash: number,
    handoverToOperatorId: string,
    notes?: string,
    discrepancyReason?: string
  ) => void;
  updateSectorSettings: (sectorId: string, patch: Partial<Sector>) => void;
  resetToDemoData: () => void;
  // Metrics helper
  getLiveMetrics: () => {
    todayIncome: number;
    todayExpenses: number;
    cashIncome: number;
    cashExpenses: number;
    upiIncome: number;
    bankIncome: number;
    expectedCash: number;
    ordersInProduction: number;
    ordersReady: number;
    totalOutstanding: number;
    sectorLoadMap: Record<string, number>;
  };
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'annai_digital_printing_v1_store';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Default to Praveen (Billing Operator)
  const [activeBranch, setActiveBranch] = useState<Branch>(INITIAL_BRANCHES[0]); // Madhavaram
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  
  const [sectors, setSectors] = useState<Sector[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sectors`);
    return saved ? JSON.parse(saved) : INITIAL_SECTORS;
  });

  const [services] = useState<Service[]>(INITIAL_SERVICES);
  const [designs] = useState<DesignItem[]>(INITIAL_DESIGNS);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [activeShift, setActiveShift] = useState<ShiftRecord>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_active_shift`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVE_SHIFT;
  });

  const [shifts, setShifts] = useState<ShiftRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_shifts`);
    return saved ? JSON.parse(saved) : [INITIAL_ACTIVE_SHIFT];
  });

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<Order | null>(null);
  const [designerTokenOrder, setDesignerTokenOrder] = useState<Order | null>(null);
  const [cashierBillingOrder, setCashierBillingOrder] = useState<Order | null>(null);

  // Sync state from Backend REST API
  const refreshBackendData = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.sectors) setSectors(json.data.sectors);
        if (json.data.customers) setCustomers(json.data.customers);
        if (json.data.orders) setOrders(json.data.orders);
        if (json.data.transactions) setTransactions(json.data.transactions);
        if (json.data.activeShift) setActiveShift(json.data.activeShift);
        if (json.data.shifts) setShifts(json.data.shifts);
        if (json.data.auditLogs) setAuditLogs(json.data.auditLogs);
        setIsBackendConnected(true);
      }
    } catch {
      setIsBackendConnected(false);
    }
  }, []);

  // Initial load and light multi-terminal polling (every 10s)
  useEffect(() => {
    refreshBackendData();
    const timer = setInterval(refreshBackendData, 10000);
    return () => clearInterval(timer);
  }, [refreshBackendData]);

  // Fallback sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sectors`, JSON.stringify(sectors));
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${STORAGE_KEY}_active_shift`, JSON.stringify(activeShift));
    localStorage.setItem(`${STORAGE_KEY}_shifts`, JSON.stringify(shifts));
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [sectors, customers, orders, transactions, activeShift, shifts, auditLogs]);

  // Recalculate pending jobs on sectors based on active orders
  useEffect(() => {
    setSectors((prev) =>
      prev.map((sec) => {
        const count = orders.filter(
          (o) =>
            o.assignedSectorId === sec.id &&
            ['Confirmed', 'In Production', 'Quality Check'].includes(o.status)
        ).length;
        return { ...sec, currentPendingJobs: count };
      })
    );
  }, [orders]);

  const addAuditLog = (
    entityType: AuditEvent['entityType'],
    entityId: string,
    action: string,
    details: string
  ) => {
    const newLog: AuditEvent = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      entityType,
      entityId,
      action,
      performedBy: `${currentUser.name} (${currentUser.role})`,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const createOrder = (payload: CreateOrderPayload): Order => {
    const service = services.find((s) => s.id === payload.serviceId);
    if (!service) throw new Error('Service not found');

    // 1. Sector Assignment Engine
    let assignedSectorId = '';
    let assignedSectorName = '';
    let assignmentReason = '';
    let isOverride = false;

    if (payload.overrideSectorId) {
      const overrideSector = sectors.find((s) => s.id === payload.overrideSectorId);
      if (overrideSector) {
        assignedSectorId = overrideSector.id;
        assignedSectorName = overrideSector.name;
        isOverride = true;
        assignmentReason = `Supervisor Override: ${payload.overrideReason || 'Operator selected manual sector'}`;
      }
    }

    if (!assignedSectorId) {
      // Find eligible sectors
      const eligible = sectors.filter((s) => service.eligibleSectorIds.includes(s.id));
      if (eligible.length === 1) {
        assignedSectorId = eligible[0].id;
        assignedSectorName = eligible[0].name;
        assignmentReason = `Dedicated Capability: ${eligible[0].name} is the sole sector configured for ${service.name}`;
      } else if (eligible.length > 1) {
        // Automatic workload balancing: select sector with fewest active pending jobs
        eligible.sort((a, b) => a.currentPendingJobs - b.currentPendingJobs);
        const selected = eligible[0];
        assignedSectorId = selected.id;
        assignedSectorName = selected.name;
        const second = eligible[1];
        assignmentReason = `Auto-balanced: ${selected.name} has ${selected.currentPendingJobs} active jobs vs ${second.name} with ${second.currentPendingJobs} jobs`;
      } else {
        // Fallback default to Sector 1
        assignedSectorId = sectors[0].id;
        assignedSectorName = sectors[0].name;
        assignmentReason = `Default fallback assigned to ${sectors[0].name}`;
      }
    }

    // 2. Customer Handling
    let customerId = payload.customerId;
    if (!customerId) {
      const existingCustomer = customers.find((c) => c.phone === payload.customerPhone.trim());
      if (existingCustomer) {
        customerId = existingCustomer.id;
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === existingCustomer.id
              ? {
                  ...c,
                  totalOrders: c.totalOrders + 1,
                  totalSpent: c.totalSpent + payload.pricing.totalAmount,
                  outstandingBalance: c.outstandingBalance + payload.pricing.balanceDue,
                }
              : c
          )
        );
      } else {
        customerId = `cust-${Date.now()}`;
        const newCust: Customer = {
          id: customerId,
          name: payload.customerName || 'Walk-in Customer',
          phone: payload.customerPhone || 'N/A',
          companyName: payload.companyName,
          totalOrders: 1,
          totalSpent: payload.pricing.totalAmount,
          outstandingBalance: payload.pricing.balanceDue,
          createdAt: new Date().toISOString(),
        };
        setCustomers((prev) => [newCust, ...prev]);
      }
    } else {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + payload.pricing.totalAmount,
                outstandingBalance: c.outstandingBalance + payload.pricing.balanceDue,
              }
            : c
        )
      );
    }

    const orderNum = `ADP-${new Date().getFullYear()}-${1040 + orders.length + 1}`;
    const newOrderId = `ord-${Date.now()}`;
    const selectedDesign = designs.find((d) => d.id === payload.designId);

    const paymentStatus =
      payload.pricing.balanceDue <= 0
        ? 'Paid'
        : payload.pricing.advancePaid > 0
        ? 'Partial'
        : 'Unpaid';

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: orderNum,
      branchId: activeBranch.id,
      customerId,
      customerName: payload.customerName || 'Walk-in Customer',
      customerPhone: payload.customerPhone || 'N/A',
      companyName: payload.companyName,
      serviceId: service.id,
      serviceName: service.name,
      designId: selectedDesign?.id,
      designCode: selectedDesign?.code,
      specs: payload.specs,
      pricing: payload.pricing,
      assignedSectorId,
      assignedSectorName,
      assignmentReason,
      isOverride,
      overrideReason: payload.overrideReason,
      status: 'Confirmed',
      paymentStatus,
      priority: payload.priority || 'NORMAL',
      createdAt: new Date().toISOString(),
      dueDate: payload.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      operatorId: currentUser.id,
      operatorName: currentUser.name,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastCreatedOrder(newOrder);
    setReceiptModalOrder(newOrder);

    // 3. Financial Recording (if advance > 0)
    if (payload.pricing.advancePaid > 0) {
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        orderId: newOrderId,
        orderNumber: orderNum,
        direction: 'IN',
        amount: payload.pricing.advancePaid,
        paymentMethod: payload.paymentMethod,
        category: payload.pricing.balanceDue <= 0 ? 'ORDER_FULL' : 'ORDER_ADVANCE',
        sectorId: assignedSectorId,
        sectorName: assignedSectorName,
        branchId: activeBranch.id,
        operatorId: currentUser.id,
        operatorName: currentUser.name,
        externalRef: payload.paymentRef,
        notes: `Advance for ${service.name} (${orderNum})`,
        timestamp: new Date().toISOString(),
      };

      setTransactions((prev) => [newTxn, ...prev]);

      // If CASH payment, strictly update physical cash drawer expected cash!
      if (payload.paymentMethod === 'CASH') {
        setActiveShift((prev) => ({
          ...prev,
          expectedCash: prev.expectedCash + payload.pricing.advancePaid,
        }));
      }

      addAuditLog(
        'PAYMENT',
        newTxn.id,
        'ADVANCE_COLLECTED',
        `₹${payload.pricing.advancePaid} via ${payload.paymentMethod} collected for ${orderNum}`
      );
    }

    addAuditLog(
      'ORDER',
      newOrderId,
      'ORDER_CREATED',
      `Order ${orderNum} created for ${payload.customerName}. ${assignmentReason}`
    );

    // Persist to Backend REST API in background
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        branchId: activeBranch.id,
        operatorId: currentUser.id,
        operatorName: currentUser.name,
      }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));

    return newOrder;
  };

  const createDesignerJobTicket = async (data: {
    customerName: string;
    customerPhone: string;
    companyName?: string;
    serviceId: string;
    designId?: string;
    specs: OrderSpecs;
    designerSystemNo: string;
    priority?: 'NORMAL' | 'HIGH' | 'URGENT';
    dueDate?: string;
  }): Promise<Order> => {
    const service = services.find((s) => s.id === data.serviceId) || services[0];

    // Sector allocation
    let assignedSectorId = '';
    let assignedSectorName = '';
    let assignmentReason = '';

    const eligible = sectors.filter((s) => service.eligibleSectorIds.includes(s.id));
    if (eligible.length === 1) {
      assignedSectorId = eligible[0].id;
      assignedSectorName = eligible[0].name;
      assignmentReason = `Dedicated Capability: ${eligible[0].name} for ${service.name}`;
    } else if (eligible.length > 1) {
      const sorted = [...eligible].sort((a, b) => a.currentPendingJobs - b.currentPendingJobs);
      assignedSectorId = sorted[0].id;
      assignedSectorName = sorted[0].name;
      assignmentReason = `Auto-balanced routing to ${sorted[0].name}`;
    } else {
      assignedSectorId = sectors[0].id;
      assignedSectorName = sectors[0].name;
      assignmentReason = `Default fallback to ${sectors[0].name}`;
    }

    // Customer lookup or creation
    let customerId = '';
    const rawPhone = (data.customerPhone || '').trim();
    const existingCustomer = customers.find((c) => c.phone === rawPhone && rawPhone.length > 0);
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      customerId = `cust-${Date.now()}`;
      const newCust: Customer = {
        id: customerId,
        name: data.customerName || 'Walk-in Customer',
        phone: rawPhone || 'N/A',
        companyName: data.companyName,
        totalOrders: 1,
        totalSpent: 0,
        outstandingBalance: 0,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [newCust, ...prev]);
    }

    const orderNum = `ADP-${new Date().getFullYear()}-${1040 + orders.length + 1}`;
    const newOrderId = `ord-${Date.now()}`;
    const selectedDesign = designs.find((d) => d.id === data.designId);

    const area = data.specs.unit === 'ft'
      ? data.specs.width * data.specs.height
      : Number(((data.specs.width * data.specs.height) / 144).toFixed(2));

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: orderNum,
      branchId: activeBranch.id,
      customerId,
      customerName: data.customerName || 'Walk-in Customer',
      customerPhone: rawPhone || 'N/A',
      companyName: data.companyName,
      serviceId: service.id,
      serviceName: service.name,
      designId: selectedDesign?.id,
      designCode: selectedDesign?.code,
      specs: {
        ...data.specs,
        quantity: 1, // Placeholder until cashier discussion
      },
      pricing: {
        unitRate: 0,
        calculatedArea: area,
        subtotal: 0,
        finishingCharges: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        advancePaid: 0,
        balanceDue: 0,
      },
      assignedSectorId,
      assignedSectorName,
      assignmentReason,
      isOverride: false,
      status: 'Awaiting Billing',
      paymentStatus: 'Unpaid',
      priority: data.priority || 'NORMAL',
      createdAt: new Date().toISOString(),
      dueDate: data.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      designerSystemNo: data.designerSystemNo || currentUser.systemNo || 'System 01',
      designerId: currentUser.id,
      designerName: currentUser.name,
      isBilled: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastCreatedOrder(newOrder);
    setDesignerTokenOrder(newOrder);

    addAuditLog(
      'ORDER',
      newOrderId,
      'DESIGN_TICKET_CREATED',
      `Design Ticket ${orderNum} created by ${currentUser.name} on ${newOrder.designerSystemNo}. Size: ${newOrder.specs.width}x${newOrder.specs.height} ${newOrder.specs.unit}. Sent to Cashier.`
    );

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newOrder,
        status: 'Awaiting Billing',
      }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));

    return newOrder;
  };

  const finalizeCashierBilling = async (data: {
    orderId: string;
    quantity: number;
    material: string;
    finish: string;
    customerNotes?: string;
    pricing: OrderPricing;
    paymentMethod: PaymentMethod;
    paymentRef?: string;
    creditAuthorized?: boolean;
    creditReason?: string;
  }): Promise<Order> => {
    let updatedOrder: Order | null = null;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== data.orderId) return ord;

        const paymentStatus =
          data.pricing.balanceDue <= 0
            ? 'Paid'
            : data.pricing.advancePaid > 0
            ? 'Partial'
            : 'Unpaid';

        updatedOrder = {
          ...ord,
          specs: {
            ...ord.specs,
            quantity: data.quantity,
            material: data.material,
            finish: data.finish,
            customerNotes: data.customerNotes || ord.specs.customerNotes,
          },
          pricing: data.pricing,
          status: 'Confirmed', // Authorized for production!
          paymentStatus,
          isBilled: true,
          billedAt: new Date().toISOString(),
          cashierId: currentUser.id,
          cashierName: currentUser.name,
          creditAuthorized: data.creditAuthorized,
          creditReason: data.creditReason,
        };
        return updatedOrder;
      })
    );

    // Update customer stats
    if (updatedOrder) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === (updatedOrder as unknown as Order).customerId
            ? {
                ...c,
                totalSpent: c.totalSpent + data.pricing.totalAmount,
                outstandingBalance: c.outstandingBalance + data.pricing.balanceDue,
              }
            : c
        )
      );
    }

    // Record advance payment transaction if advance > 0
    if (data.pricing.advancePaid > 0 && updatedOrder) {
      const order = updatedOrder as unknown as Order;
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        direction: 'IN',
        amount: data.pricing.advancePaid,
        paymentMethod: data.paymentMethod,
        category: data.pricing.balanceDue <= 0 ? 'ORDER_FULL' : 'ORDER_ADVANCE',
        sectorId: order.assignedSectorId,
        sectorName: order.assignedSectorName,
        branchId: order.branchId,
        operatorId: currentUser.id,
        operatorName: currentUser.name,
        externalRef: data.paymentRef,
        notes: `Advance for ${order.serviceName} (${order.orderNumber}) at Cashier Counter`,
        timestamp: new Date().toISOString(),
      };

      setTransactions((prev) => [newTxn, ...prev]);

      if (data.paymentMethod === 'CASH') {
        setActiveShift((prev) => ({
          ...prev,
          expectedCash: prev.expectedCash + data.pricing.advancePaid,
        }));
      }

      addAuditLog(
        'PAYMENT',
        newTxn.id,
        'ADVANCE_COLLECTED',
        `₹${data.pricing.advancePaid} via ${data.paymentMethod} collected for ${order.orderNumber} at Cashier Counter`
      );
    }

    if (updatedOrder) {
      const ord = updatedOrder as unknown as Order;
      addAuditLog(
        'ORDER',
        ord.id,
        'BILLING_FINALIZED',
        `Billing finalized by Cashier (${currentUser.name}). Qty: ${data.quantity}, Mat: ${data.material}, Total: ₹${data.pricing.totalAmount}. Order Authorized for Production.`
      );
    }

    // Call backend API
    fetch(`/api/orders/${data.orderId}/finalize-billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        cashierId: currentUser.id,
        cashierName: currentUser.name,
      }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));

    return updatedOrder || orders.find((o) => o.id === data.orderId)!;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, notes?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status,
          internalNotes: notes || ord.internalNotes,
          collectedAt: status === 'Completed' ? new Date().toISOString() : ord.collectedAt,
        };
      })
    );

    addAuditLog(
      'ORDER',
      orderId,
      'STATUS_CHANGED',
      `Order status transitioned to ${status}. ${notes ? `Note: ${notes}` : ''}`
    );

    // Persist to Backend REST API
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, operatorName: currentUser.name }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));
  };

  const recordOrderPayment = (
    orderId: string,
    amount: number,
    method: PaymentMethod,
    ref?: string
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newAdvance = order.pricing.advancePaid + amount;
    const newBalance = Math.max(0, order.pricing.totalAmount - newAdvance);
    const newPaymentStatus = newBalance === 0 ? 'Paid' : 'Partial';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: newPaymentStatus,
              pricing: {
                ...o.pricing,
                advancePaid: newAdvance,
                balanceDue: newBalance,
              },
            }
          : o
      )
    );

    // Update customer outstanding balance
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === order.customerId
          ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amount) }
          : c
      )
    );

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      direction: 'IN',
      amount,
      paymentMethod: method,
      category: 'ORDER_BALANCE',
      sectorId: order.assignedSectorId,
      sectorName: order.assignedSectorName,
      branchId: activeBranch.id,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      externalRef: ref,
      notes: `Balance payment collected for ${order.orderNumber}`,
      timestamp: new Date().toISOString(),
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Strictly update cash drawer if CASH
    if (method === 'CASH') {
      setActiveShift((prev) => ({
        ...prev,
        expectedCash: prev.expectedCash + amount,
      }));
    }

    addAuditLog(
      'PAYMENT',
      newTxn.id,
      'PAYMENT_RECORDED',
      `Collected balance ₹${amount} via ${method} for ${order.orderNumber}. Remaining due: ₹${newBalance}`
    );

    // Persist to Backend REST API
    fetch(`/api/orders/${orderId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        method,
        ref,
        operatorId: currentUser.id,
        operatorName: currentUser.name,
      }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));
  };

  const recordExpense = (data: {
    amount: number;
    category: TransactionCategory;
    paymentMethod: PaymentMethod;
    sectorId?: string;
    notes?: string;
    externalRef?: string;
  }) => {
    const sector = sectors.find((s) => s.id === data.sectorId);

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      direction: 'OUT',
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      category: data.category,
      sectorId: sector?.id,
      sectorName: sector?.name || 'Shared Shop Expense',
      branchId: activeBranch.id,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      externalRef: data.externalRef,
      notes: data.notes || 'Shop expense payment',
      timestamp: new Date().toISOString(),
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // If CASH paid out, strictly decrease physical cash drawer expected cash!
    if (data.paymentMethod === 'CASH') {
      setActiveShift((prev) => ({
        ...prev,
        expectedCash: Math.max(0, prev.expectedCash - data.amount),
      }));
    }

    addAuditLog(
      'EXPENSE',
      newTxn.id,
      'EXPENSE_RECORDED',
      `Expense of ₹${data.amount} (${data.category}) paid via ${data.paymentMethod}. ${data.notes || ''}`
    );

    // Persist to Backend REST API
    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        operatorId: currentUser.id,
        operatorName: currentUser.name,
      }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));
  };

  const reconcileAndCloseShift = (
    actualCash: number,
    handoverToOperatorId: string,
    notes?: string,
    discrepancyReason?: string
  ) => {
    const incomingOperator = INITIAL_USERS.find((u) => u.id === handoverToOperatorId) || currentUser;
    const discrepancy = actualCash - activeShift.expectedCash;

    const closedShift: ShiftRecord = {
      ...activeShift,
      actualCountedCash: actualCash,
      discrepancy,
      status: 'CLOSED',
      handoverToOperatorId,
      handoverToOperatorName: incomingOperator.name,
      notes: `${notes || ''} ${discrepancyReason ? `Discrepancy Note: ${discrepancyReason}` : ''}`.trim(),
      closedAt: new Date().toISOString(),
    };

    // New opened shift starting with the physically counted cash
    const nextShift: ShiftRecord = {
      id: `shift-${Date.now()}`,
      branchId: activeBranch.id,
      operatorId: incomingOperator.id,
      operatorName: incomingOperator.name,
      openingCash: actualCash,
      expectedCash: actualCash,
      status: 'OPEN',
      notes: `Handover from ${currentUser.name}. Opening physical cash: ₹${actualCash}.`,
      openedAt: new Date().toISOString(),
    };

    setShifts((prev) => [closedShift, ...prev]);
    setActiveShift(nextShift);

    addAuditLog(
      'SHIFT',
      closedShift.id,
      'SHIFT_CLOSED_AND_RECONCILED',
      `Shift closed by ${currentUser.name}. Expected ₹${closedShift.expectedCash}, Counted ₹${actualCash}, Diff: ₹${discrepancy}. Handover to ${incomingOperator.name}.`
    );

    // Persist to Backend REST API
    fetch('/api/shifts/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actualCash,
        handoverToOperatorId,
        notes,
        discrepancyReason,
        currentOperatorName: currentUser.name,
      }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));
  };

  const updateSectorSettings = (sectorId: string, patch: Partial<Sector>) => {
    setSectors((prev) =>
      prev.map((s) => (s.id === sectorId ? { ...s, ...patch } : s))
    );
    addAuditLog('SETTINGS', sectorId, 'SECTOR_UPDATED', `Updated configuration for sector ${sectorId}`);

    // Persist to Backend REST API
    fetch(`/api/sectors/${sectorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...patch, performedBy: currentUser.name }),
    })
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => setIsBackendConnected(false));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_sectors`);
    localStorage.removeItem(`${STORAGE_KEY}_customers`);
    localStorage.removeItem(`${STORAGE_KEY}_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_active_shift`);
    localStorage.removeItem(`${STORAGE_KEY}_shifts`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);

    setSectors(INITIAL_SECTORS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setActiveShift(INITIAL_ACTIVE_SHIFT);
    setShifts([INITIAL_ACTIVE_SHIFT]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveView('overview');

    // Reset Backend REST API
    fetch('/api/reset-demo', { method: 'POST' })
      .then(() => refreshBackendData())
      .catch(() => {});
  };

  const getLiveMetrics = () => {
    const incomeTxns = transactions.filter((t) => t.direction === 'IN');
    const expenseTxns = transactions.filter((t) => t.direction === 'OUT');

    const todayIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
    const todayExpenses = expenseTxns.reduce((sum, t) => sum + t.amount, 0);

    const cashIncome = incomeTxns.filter((t) => t.paymentMethod === 'CASH').reduce((sum, t) => sum + t.amount, 0);
    const cashExpenses = expenseTxns.filter((t) => t.paymentMethod === 'CASH').reduce((sum, t) => sum + t.amount, 0);

    const upiIncome = incomeTxns.filter((t) => t.paymentMethod === 'UPI').reduce((sum, t) => sum + t.amount, 0);
    const bankIncome = incomeTxns.filter((t) => t.paymentMethod === 'BANK').reduce((sum, t) => sum + t.amount, 0);

    const ordersInProduction = orders.filter((o) => ['Confirmed', 'In Production', 'Quality Check'].includes(o.status)).length;
    const ordersReady = orders.filter((o) => o.status === 'Ready for Collection').length;

    const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

    const sectorLoadMap: Record<string, number> = {};
    sectors.forEach((s) => {
      sectorLoadMap[s.id] = orders.filter((o) => o.assignedSectorId === s.id && ['Confirmed', 'In Production', 'Quality Check'].includes(o.status)).length;
    });

    return {
      todayIncome,
      todayExpenses,
      cashIncome,
      cashExpenses,
      upiIncome,
      bankIncome,
      expectedCash: activeShift.expectedCash,
      ordersInProduction,
      ordersReady,
      totalOutstanding,
      sectorLoadMap,
    };
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        currentUser,
        setCurrentUser,
        activeBranch,
        setActiveBranch,
        branches,
        sectors,
        services,
        designs,
        customers,
        orders,
        transactions,
        shifts,
        activeShift,
        auditLogs,
        lastCreatedOrder,
        setLastCreatedOrder,
        receiptModalOrder,
        setReceiptModalOrder,
        designerTokenOrder,
        setDesignerTokenOrder,
        cashierBillingOrder,
        setCashierBillingOrder,
        isBackendConnected,
        refreshBackendData,
        createOrder,
        createDesignerJobTicket,
        finalizeCashierBilling,
        updateOrderStatus,
        recordOrderPayment,
        recordExpense,
        reconcileAndCloseShift,
        updateSectorSettings,
        resetToDemoData,
        getLiveMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
