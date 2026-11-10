import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Branch,
  Customer,
  DesignItem,
  Order,
  Sector,
  Service,
  ShiftRecord,
  Transaction,
  User,
  AuditEvent,
} from '../src/types/index.ts';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_SECTORS,
  INITIAL_SERVICES,
  INITIAL_DESIGNS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_ACTIVE_SHIFT,
  INITIAL_AUDIT_LOGS,
} from '../src/data/seedData.ts';

export interface DatabaseSchema {
  branches: Branch[];
  users: User[];
  sectors: Sector[];
  services: Service[];
  designs: DesignItem[];
  customers: Customer[];
  orders: Order[];
  transactions: Transaction[];
  shifts: ShiftRecord[];
  activeShift: ShiftRecord;
  auditLogs: AuditEvent[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? path.join('/tmp', 'annai-data') : path.resolve(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function getInitialDatabase(): DatabaseSchema {
  const pastShift: ShiftRecord = {
    id: 'shift-prev-01',
    branchId: 'br-madhavaram',
    operatorId: 'usr-karthik',
    operatorName: 'Karthikeyan R.',
    openingCash: 2500,
    expectedCash: 3000,
    actualCountedCash: 3000,
    discrepancy: 0,
    status: 'CLOSED',
    handoverToOperatorId: 'usr-praveen',
    handoverToOperatorName: 'Praveen Kumar',
    notes: 'Morning float handed over to Praveen. Verified count: 6x ₹500.',
    openedAt: '2026-10-19T08:00:00Z',
    closedAt: '2026-10-19T20:00:00Z',
  };

  return {
    branches: INITIAL_BRANCHES,
    users: INITIAL_USERS,
    sectors: INITIAL_SECTORS,
    services: INITIAL_SERVICES,
    designs: INITIAL_DESIGNS,
    customers: INITIAL_CUSTOMERS,
    orders: INITIAL_ORDERS,
    transactions: INITIAL_TRANSACTIONS,
    shifts: [INITIAL_ACTIVE_SHIFT, pastShift],
    activeShift: INITIAL_ACTIVE_SHIFT,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
}

let inMemoryDb: DatabaseSchema | null = null;

export function initDb(): DatabaseSchema {
  if (inMemoryDb) return inMemoryDb;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      inMemoryDb = JSON.parse(raw);
      return inMemoryDb!;
    }

    // On Vercel / serverless: copy from bundled seed data if available
    const bundledSeedPath = path.resolve(__dirname, 'data', 'db.json');
    if (isVercel && fs.existsSync(bundledSeedPath)) {
      const raw = fs.readFileSync(bundledSeedPath, 'utf-8');
      inMemoryDb = JSON.parse(raw);
      if (inMemoryDb) {
        saveDb(inMemoryDb);
        return inMemoryDb;
      }
    }
  } catch (err) {
    console.warn('[DB] Failed to read database from disk, creating fresh seed:', err);
  }

  inMemoryDb = getInitialDatabase();
  saveDb(inMemoryDb);
  return inMemoryDb;
}

export function getDb(): DatabaseSchema {
  if (!inMemoryDb) {
    return initDb();
  }
  return inMemoryDb;
}

export function saveDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_PATH);
  } catch (err) {
    console.error('[DB] Failed to persist database to disk:', err);
  }
}

export function resetDb(): DatabaseSchema {
  inMemoryDb = getInitialDatabase();
  saveDb(inMemoryDb);
  return inMemoryDb;
}
