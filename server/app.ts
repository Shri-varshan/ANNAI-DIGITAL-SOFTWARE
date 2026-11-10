import express, { Request, Response, NextFunction } from 'express';
import { getDb, saveDb, resetDb, DatabaseSchema } from './db.ts';
import { Order, Transaction, Customer, ShiftRecord, AuditEvent, Sector, OrderStatus, PaymentMethod } from '../src/types/index.ts';

const app = express();

// Body parser
app.use(express.json());

// CORS & Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Helper: Append Audit Log
function addAuditLog(
  db: DatabaseSchema,
  entityType: AuditEvent['entityType'],
  entityId: string,
  action: string,
  performedBy: string,
  details: string
): AuditEvent {
  const newLog: AuditEvent = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    entityType,
    entityId,
    action,
    performedBy,
    details,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(newLog);
  return newLog;
}

// Helper: Recalculate pending jobs across sectors
function recalculateSectorLoads(db: DatabaseSchema) {
  db.sectors = db.sectors.map((sec) => {
    const pendingCount = db.orders.filter(
      (o) =>
        o.assignedSectorId === sec.id &&
        ['Confirmed', 'In Production', 'Quality Check'].includes(o.status)
    ).length;
    return { ...sec, currentPendingJobs: pendingCount };
  });
}

// ---------------------- API ROUTES ----------------------

// 1. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Annai Digital Printing Backend API',
    branch: 'Madhavaram Main Hub',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// 2. Full Bootstrap Payload
app.get('/api/bootstrap', (_req: Request, res: Response) => {
  const db = getDb();
  recalculateSectorLoads(db);
  res.json({
    success: true,
    data: db,
    serverTime: new Date().toISOString(),
  });
});

// 3. Get Orders
app.get('/api/orders', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, data: db.orders });
});

// 4. Create Order
app.post('/api/orders', (req: Request, res: Response) => {
  const db = getDb();
  const payload = req.body;

  const service = db.services.find((s) => s.id === payload.serviceId);
  if (!service) {
    res.status(400).json({ success: false, error: 'Service not found' });
    return;
  }

  // 1. Automated Sector Allocation Engine
  let assignedSectorId = '';
  let assignedSectorName = '';
  let assignmentReason = '';
  let isOverride = false;

  if (payload.overrideSectorId) {
    const overrideSector = db.sectors.find((s) => s.id === payload.overrideSectorId);
    if (overrideSector) {
      assignedSectorId = overrideSector.id;
      assignedSectorName = overrideSector.name;
      isOverride = true;
      assignmentReason = `Supervisor Override: ${payload.overrideReason || 'Operator selected manual sector'}`;
    }
  }

  if (!assignedSectorId) {
    const eligible = db.sectors.filter((s) => service.eligibleSectorIds.includes(s.id));
    if (eligible.length === 1) {
      assignedSectorId = eligible[0].id;
      assignedSectorName = eligible[0].name;
      assignmentReason = `Dedicated Capability: ${eligible[0].name} is the sole sector configured for ${service.name}`;
    } else if (eligible.length > 1) {
      eligible.sort((a, b) => a.currentPendingJobs - b.currentPendingJobs);
      const selected = eligible[0];
      const second = eligible[1];
      assignedSectorId = selected.id;
      assignedSectorName = selected.name;
      assignmentReason = `Auto-balanced: ${selected.name} has ${selected.currentPendingJobs} active jobs vs ${second.name} with ${second.currentPendingJobs} jobs`;
    } else {
      assignedSectorId = db.sectors[0].id;
      assignedSectorName = db.sectors[0].name;
      assignmentReason = `Default fallback assigned to ${db.sectors[0].name}`;
    }
  }

  // 2. Customer Lookup / Creation
  let customerId = payload.customerId;
  const rawPhone = (payload.customerPhone || '').trim();

  if (!customerId) {
    const existing = db.customers.find((c) => c.phone === rawPhone && rawPhone.length > 0);
    if (existing) {
      customerId = existing.id;
      existing.totalOrders += 1;
      existing.totalSpent += payload.pricing.totalAmount;
      existing.outstandingBalance += payload.pricing.balanceDue;
    } else {
      customerId = `cust-${Date.now()}`;
      const newCust: Customer = {
        id: customerId,
        name: payload.customerName || 'Walk-in Customer',
        phone: rawPhone || 'N/A',
        companyName: payload.companyName,
        totalOrders: 1,
        totalSpent: payload.pricing.totalAmount,
        outstandingBalance: payload.pricing.balanceDue,
        createdAt: new Date().toISOString(),
      };
      db.customers.unshift(newCust);
    }
  } else {
    const existing = db.customers.find((c) => c.id === customerId);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += payload.pricing.totalAmount;
      existing.outstandingBalance += payload.pricing.balanceDue;
    }
  }

  const orderNum = `ADP-${new Date().getFullYear()}-${1040 + db.orders.length + 1}`;
  const newOrderId = `ord-${Date.now()}`;
  const selectedDesign = db.designs.find((d) => d.id === payload.designId);

  const paymentStatus =
    payload.pricing.balanceDue <= 0
      ? 'Paid'
      : payload.pricing.advancePaid > 0
      ? 'Partial'
      : 'Unpaid';

  const operatorName = payload.operatorName || 'Billing Operator';
  const operatorId = payload.operatorId || 'usr-praveen';

  const newOrder: Order = {
    id: newOrderId,
    orderNumber: orderNum,
    branchId: payload.branchId || 'br-madhavaram',
    customerId,
    customerName: payload.customerName || 'Walk-in Customer',
    customerPhone: rawPhone || 'N/A',
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
    operatorId,
    operatorName,
  };

  db.orders.unshift(newOrder);

  // 3. Financial Transaction Recording for Advance Payment
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
      branchId: newOrder.branchId,
      operatorId,
      operatorName,
      externalRef: payload.paymentRef,
      notes: `Advance for ${service.name} (${orderNum})`,
      timestamp: new Date().toISOString(),
    };

    db.transactions.unshift(newTxn);

    // If CASH payment, strictly increment physical cash drawer expected cash!
    if (payload.paymentMethod === 'CASH') {
      db.activeShift.expectedCash += payload.pricing.advancePaid;
    }

    addAuditLog(
      db,
      'PAYMENT',
      newTxn.id,
      'ADVANCE_COLLECTED',
      operatorName,
      `₹${payload.pricing.advancePaid} via ${payload.paymentMethod} collected for ${orderNum}`
    );
  }

  addAuditLog(
    db,
    'ORDER',
    newOrderId,
    'ORDER_CREATED',
    operatorName,
    `Order ${orderNum} created for ${newOrder.customerName}. ${assignmentReason}`
  );

  recalculateSectorLoads(db);
  saveDb(db);

  res.status(201).json({ success: true, order: newOrder });
});

// 5. Update Order Status
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;
  const { status, notes, operatorName } = req.body;

  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  order.status = status as OrderStatus;
  if (notes) order.internalNotes = notes;
  if (status === 'Completed') {
    order.collectedAt = new Date().toISOString();
  }

  addAuditLog(
    db,
    'ORDER',
    order.id,
    'STATUS_CHANGED',
    operatorName || 'Shop Operator',
    `Order ${order.orderNumber} status transitioned to ${status}. ${notes ? `Note: ${notes}` : ''}`
  );

  recalculateSectorLoads(db);
  saveDb(db);

  res.json({ success: true, order });
});

// 6. Record Order Balance Payment
app.post('/api/orders/:id/payment', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;
  const { amount, method, ref, operatorId, operatorName } = req.body;

  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ success: false, error: 'Invalid payment amount' });
    return;
  }

  const newAdvance = order.pricing.advancePaid + numAmount;
  const newBalance = Math.max(0, order.pricing.totalAmount - newAdvance);
  const newPaymentStatus = newBalance === 0 ? 'Paid' : 'Partial';

  order.paymentStatus = newPaymentStatus;
  order.pricing.advancePaid = newAdvance;
  order.pricing.balanceDue = newBalance;

  // Deduct from customer outstanding balance
  const customer = db.customers.find((c) => c.id === order.customerId);
  if (customer) {
    customer.outstandingBalance = Math.max(0, customer.outstandingBalance - numAmount);
  }

  const newTxn: Transaction = {
    id: `txn-${Date.now()}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    direction: 'IN',
    amount: numAmount,
    paymentMethod: method as PaymentMethod,
    category: 'ORDER_BALANCE',
    sectorId: order.assignedSectorId,
    sectorName: order.assignedSectorName,
    branchId: order.branchId,
    operatorId: operatorId || 'usr-praveen',
    operatorName: operatorName || 'Billing Operator',
    externalRef: ref,
    notes: `Balance payment collected for ${order.orderNumber}`,
    timestamp: new Date().toISOString(),
  };

  db.transactions.unshift(newTxn);

  // If CASH, increment physical cash drawer expected cash!
  if (method === 'CASH') {
    db.activeShift.expectedCash += numAmount;
  }

  addAuditLog(
    db,
    'PAYMENT',
    newTxn.id,
    'PAYMENT_RECORDED',
    operatorName || 'Billing Operator',
    `Collected balance ₹${numAmount} via ${method} for ${order.orderNumber}. Remaining due: ₹${newBalance}`
  );

  saveDb(db);
  res.json({ success: true, order, transaction: newTxn });
});

// 7. Get Transactions Ledger
app.get('/api/transactions', (_req: Request, res: Response) => {
  const db = getDb();
  res.json({ success: true, data: db.transactions });
});

// 8. Record Shop Expense (Cash Outflow)
app.post('/api/expenses', (req: Request, res: Response) => {
  const db = getDb();
  const { amount, category, paymentMethod, sectorId, notes, externalRef, operatorId, operatorName } = req.body;

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({ success: false, error: 'Invalid expense amount' });
    return;
  }

  const sector = db.sectors.find((s) => s.id === sectorId);

  const newTxn: Transaction = {
    id: `txn-${Date.now()}`,
    direction: 'OUT',
    amount: numAmount,
    paymentMethod: paymentMethod as PaymentMethod,
    category,
    sectorId: sector?.id,
    sectorName: sector?.name || 'Shared Shop Expense',
    branchId: 'br-madhavaram',
    operatorId: operatorId || 'usr-praveen',
    operatorName: operatorName || 'Billing Operator',
    externalRef,
    notes: notes || 'Shop expense payment',
    timestamp: new Date().toISOString(),
  };

  db.transactions.unshift(newTxn);

  // If CASH paid out, strictly decrease physical cash drawer expected cash!
  if (paymentMethod === 'CASH') {
    db.activeShift.expectedCash = Math.max(0, db.activeShift.expectedCash - numAmount);
  }

  addAuditLog(
    db,
    'EXPENSE',
    newTxn.id,
    'EXPENSE_RECORDED',
    operatorName || 'Billing Operator',
    `Expense of ₹${numAmount} (${category}) paid via ${paymentMethod}. ${notes || ''}`
  );

  saveDb(db);
  res.status(201).json({ success: true, transaction: newTxn });
});

// 9. Shift Reconciliation & Handover
app.post('/api/shifts/reconcile', (req: Request, res: Response) => {
  const db = getDb();
  const { actualCash, handoverToOperatorId, notes, discrepancyReason, currentOperatorName } = req.body;

  const numCash = Number(actualCash);
  const incomingOperator = db.users.find((u) => u.id === handoverToOperatorId) || db.users[0];
  const discrepancy = numCash - db.activeShift.expectedCash;

  const closedShift: ShiftRecord = {
    ...db.activeShift,
    actualCountedCash: numCash,
    discrepancy,
    status: 'CLOSED',
    handoverToOperatorId: incomingOperator.id,
    handoverToOperatorName: incomingOperator.name,
    notes: `${notes || ''} ${discrepancyReason ? `Discrepancy Note: ${discrepancyReason}` : ''}`.trim(),
    closedAt: new Date().toISOString(),
  };

  // Next Shift starts with physically counted cash
  const nextShift: ShiftRecord = {
    id: `shift-${Date.now()}`,
    branchId: 'br-madhavaram',
    operatorId: incomingOperator.id,
    operatorName: incomingOperator.name,
    openingCash: numCash,
    expectedCash: numCash,
    status: 'OPEN',
    notes: `Handover from ${currentOperatorName || 'Previous Operator'}. Opening physical cash: ₹${numCash}.`,
    openedAt: new Date().toISOString(),
  };

  db.shifts.unshift(closedShift);
  db.activeShift = nextShift;

  addAuditLog(
    db,
    'SHIFT',
    closedShift.id,
    'SHIFT_CLOSED_AND_RECONCILED',
    currentOperatorName || 'Operator',
    `Shift closed. Expected: ₹${closedShift.expectedCash}, Counted: ₹${numCash}, Discrepancy: ₹${discrepancy}. Handover to ${incomingOperator.name}.`
  );

  saveDb(db);
  res.json({ success: true, closedShift, nextShift });
});

// 10. Update Sector Settings
app.patch('/api/sectors/:id', (req: Request, res: Response) => {
  const db = getDb();
  const { id } = req.params;
  const patch = req.body;

  const sector = db.sectors.find((s) => s.id === id);
  if (!sector) {
    res.status(404).json({ success: false, error: 'Sector not found' });
    return;
  }

  Object.assign(sector, patch);

  addAuditLog(
    db,
    'SETTINGS',
    sector.id,
    'SECTOR_UPDATED',
    patch.performedBy || 'Shop Owner',
    `Updated configuration for sector ${sector.name}`
  );

  saveDb(db);
  res.json({ success: true, sector });
});

// 11. Reset to Chennai Demo Seed
app.post('/api/reset-demo', (_req: Request, res: Response) => {
  const freshDb = resetDb();
  res.json({ success: true, data: freshDb });
});

// 12. Full Data Export
app.get('/api/export', (_req: Request, res: Response) => {
  const db = getDb();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=annai_db_backup_${new Date().toISOString().slice(0, 10)}.json`);
  res.send(JSON.stringify(db, null, 2));
});

export default app;
