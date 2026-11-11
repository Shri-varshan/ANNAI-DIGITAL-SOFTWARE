export type Role = 'OWNER' | 'BRANCH_MANAGER' | 'DESIGNER' | 'BILLING_OPERATOR' | 'PRODUCTION_STAFF' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  branchId: string;
  systemNo?: string; // e.g. 'System 01', 'System 02' for designers
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  isActive: boolean;
  isPrimary: boolean;
}

export interface Sector {
  id: string;
  name: string;
  code: string; // 'SEC-1', 'SEC-2', 'SEC-3'
  branchId: string;
  description: string;
  machinery: string;
  maxDailyCapacity: number;
  currentPendingJobs: number;
  capabilities: string[]; // Service IDs
  color: string;
}

export type UnitType = 'sqft' | 'units' | 'sqinch';

export interface Service {
  id: string;
  name: string;
  category: 'banner' | 'cards' | 'vinyl' | 'stickers' | 'signage' | 'stationery';
  unitType: UnitType;
  defaultRate: number; // in INR
  setupCost: number;
  minOrderQty: number;
  eligibleSectorIds: string[];
  materials: string[];
  finishes: string[];
  requiresArtworkApproval: boolean;
  popularDimensions?: string[];
  description: string;
}

export interface DesignItem {
  id: string;
  code: string;
  title: string;
  category: string;
  serviceId: string;
  previewGradient: string;
  description: string;
  tags: string[];
  standardDimensions: string;
  isPopular?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  companyName?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  createdAt: string;
}

export type OrderStatus =
  | 'Draft'
  | 'Awaiting Billing'
  | 'Confirmed'
  | 'Artwork Pending'
  | 'In Production'
  | 'Quality Check'
  | 'Ready for Collection'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';

export interface OrderSpecs {
  width: number;
  height: number;
  unit: 'ft' | 'in' | 'cm';
  quantity: number;
  material: string;
  finish: string;
  customerNotes?: string;
  artworkSupplied: boolean;
  artworkSource?: 'CUSTOMER_FILE' | 'SHOP_TEMPLATE';
  artworkFileName?: string;
  artworkChannel?: 'WHATSAPP' | 'PENDRIVE' | 'UPLOAD';
  shopTemplateCode?: string;
  templateModifications?: string;
  designApproved?: boolean;
}

export interface OrderPricing {
  unitRate: number;
  calculatedArea?: number; // sqft
  subtotal: number;
  finishingCharges: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ADP-2026-1042
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  companyName?: string;
  serviceId: string;
  serviceName: string;
  designId?: string;
  designCode?: string;
  specs: OrderSpecs;
  pricing: OrderPricing;
  assignedSectorId: string;
  assignedSectorName: string;
  assignmentReason: string;
  isOverride: boolean;
  overrideReason?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  dueDate: string;
  operatorId: string;
  operatorName: string;
  designerSystemNo?: string;
  designerId?: string;
  designerName?: string;
  cashierId?: string;
  cashierName?: string;
  billedAt?: string;
  isBilled?: boolean;
  creditAuthorized?: boolean;
  creditReason?: string;
  collectedAt?: string;
  internalNotes?: string;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK';

export type TransactionCategory =
  | 'ORDER_ADVANCE'
  | 'ORDER_BALANCE'
  | 'ORDER_FULL'
  | 'MATERIAL_PURCHASE'
  | 'SUPPLIER_PAYMENT'
  | 'PETTY_CASH'
  | 'SHOP_EXPENSE'
  | 'REFUND'
  | 'TRANSFER';

export interface Transaction {
  id: string;
  orderId?: string;
  orderNumber?: string;
  direction: 'IN' | 'OUT';
  amount: number;
  paymentMethod: PaymentMethod;
  category: TransactionCategory;
  sectorId?: string;
  sectorName?: string;
  branchId: string;
  operatorId: string;
  operatorName: string;
  externalRef?: string; // UPI UTR or Bank Ref
  notes?: string;
  timestamp: string;
}

export interface ShiftRecord {
  id: string;
  branchId: string;
  operatorId: string;
  operatorName: string;
  openingCash: number;
  expectedCash: number;
  actualCountedCash?: number;
  discrepancy?: number;
  status: 'OPEN' | 'CLOSED';
  handoverToOperatorId?: string;
  handoverToOperatorName?: string;
  notes?: string;
  openedAt: string;
  closedAt?: string;
}

export interface AuditEvent {
  id: string;
  entityType: 'ORDER' | 'PAYMENT' | 'EXPENSE' | 'SHIFT' | 'SECTOR_ASSIGNMENT' | 'SETTINGS';
  entityId: string;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}
