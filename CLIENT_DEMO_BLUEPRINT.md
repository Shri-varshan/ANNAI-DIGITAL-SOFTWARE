# ANNAI DIGITAL PRINTING — CLIENT MEETING BLUEPRINT
## Complete Operational Walkthrough & Presentation Guide

> **Date of Meeting**: November 10, 2026  
> **Client**: Annai Digital Printing, Madhavaram Main Branch, Chennai  
> **Multi-Terminal Localhost URLs**:  
> - 👑 **Owner / Super Admin**: [http://localhost:3000/](http://localhost:3000/) (or `/owner`)  
> - 🎨 **Designer Desk 01 (System 01 - Dinesh)**: [http://localhost:3001/](http://localhost:3001/) (or `/designer-1`)  
> - 💳 **Cashier Counter (Kallaa - Praveen)**: [http://localhost:3002/](http://localhost:3002/) (or `/cashier`)  
> - 🖨️ **Production Floor (Flora / Mimaki - Suresh)**: [http://localhost:3003/](http://localhost:3003/) (or `/production`)  
> - 🎨 **Designer Desk 02 (System 02 - Anand)**: [http://localhost:3004/](http://localhost:3004/) (or `/designer-2`)  
> **Backup Location**: `backups/` directory (Full snapshot preserved)

---

## 1. Executive Summary & Purpose

This software is the **Operating System** for Annai Digital Printing, connecting the front billing desk with the shop-floor printing machines and the physical cash drawer (கல்லா).

### The 3 Core Problems It Solves:
1. **Speed**: Cuts counter order-taking time down to **20 seconds** with auto-calculated square footage ($W \times H$) and instant advance/balance receipts.
2. **Artwork & Machine Handoff**: Handles both customer-provided files (WhatsApp/USB) and the shop's own PC template library (`.cdr` / `.psd`), automatically routing jobs to the correct printing sector with zero machine wear bottlenecks.
3. **Kallaa (கல்லா) Protection**: Enforces strict mathematical cash drawer tracking ($\text{Opening} + \text{Cash In} - \text{Cash Out}$), keeping physical cash strictly separated from GPay/UPI and requiring Indian Rupee denomination counts at shift handover.

---

## 2. The 5-Stage Operational Flowchart

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 5 REAL-WORLD SHOP STAGES                              │
│                                                                                        │
│  [STAGE 1: Counter Intake] ──► [STAGE 2: Artwork Selection] ──► [STAGE 3: Auto Routing]│
│  • Customer Phone Lookup        • Path A: USB / WhatsApp file    • Sector 1 (Flora)    │
│  • Banner Size (e.g. 10x4 ft)   • Path B: Shop PC Template       • Sector 2 (Mimaki)   │
│  • 50% Advance (Cash / UPI)       (CorelDraw / PSD edit)         • Sector 3 (Konica)   │
│  • Instant 80mm Print Chit                                              │              │
│                                                                         ▼              │
│  [STAGE 5: Kallaa Reconcile] ◄── [STAGE 4: Delivery & Balance] ◄── [Shop Floor Print]  │
│  • Expected vs Counted Cash       • Collect Remaining Balance      • RIP Software Open │
│  • Rupee Denominations            • Mark Order "Completed"        • Border Eyeleting  │
│  • Shift Handover Signoff         • Hand Over Finished Print       • Move to Ready     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. How Artwork Works in the Real Shop (The 2 Paths)

In commercial banner printing, customers either bring their own file or pick an existing template from the shop's hard drive:

| Path | What Happens at the Counter | What the Machine Operator in Back Does |
| :--- | :--- | :--- |
| **Path A: Customer Brought File** | Customer brings file on USB pen drive or sends to shop WhatsApp. Counter operator attaches file name / link (e.g. `murugan_banner_10x4.tif`). | Machine operator sees order in **Production Queue**, clicks **"Open File"**, opens it directly in printer RIP software (Photoprint / Onyx), and prints on the Flora 3.2m machine. |
| **Path B: Shop PC Ready Template** | Customer picks an existing shop design from the computer (e.g. Grand Opening arch, Festival, Birthday). Operator selects template code (`FLEX-GRAND-01`) and notes text changes (*"Shop Name: Murugan Sweets, Ph: 98401 23456"*). | DTP designer opens `D:\DESIGNS\FLEX-GRAND-01.cdr` on their PC, replaces the text in 2 minutes, exports to TIF, and queues it to the printer. |

---

## 4. The 3 Industrial Printing Sectors

Orders are automatically routed based on machine capability and lowest pending queue:

1. **Sector 1 — Solvent & Heavy Format (Flora LJ 320P 3.2m)**:
   - *Products*: Star Flex Banners (340gsm), Regular Frontlit (280gsm), Blackout Banners (440gsm), Hoardings.
   - *Key specs*: High speed, weather-resistant outdoor ink, metal eyeleting and border heat welding.
2. **Sector 2 — Eco-Solvent & Precision Vinyl (Mimaki CJV150-160)**:
   - *Products*: Glass Frosted Film, Sunboard Vinyl Pasting, Vehicle Vinyl Wraps, Custom Die-Cut Stickers.
   - *Key specs*: Odorless, ultra-high-definition photo printing with integrated contour cutting blade.
3. **Sector 3 — Digital Production Press & Signage (Konica Minolta C4070 + CO2 Laser)**:
   - *Products*: Premium Visiting Cards (350gsm art board), Tri-fold Brochures, 3D Acrylic LED Channel Letter Signboards.
   - *Key specs*: Lightning-speed paper sheet laser toner + CNC laser cutting for acrylic and wooden letters.

---

## 5. Live Client Demonstration Script (Step-by-Step)

Open [**http://localhost:3001/**](http://localhost:3001/) on your laptop:

### Step 1: Open the Interactive Shop Blueprint
- Click the black button in the top navbar: **"Shop Blueprint"**.
- Walk the owner through the 5 stages so they see you understand their business from start to finish.

### Step 2: Show the Fast POS Billing (<kbd>F2</kbd>)
- Hit <kbd>F2</kbd> or click **New Order**.
- Enter mobile `98401 23456` $\rightarrow$ watch it auto-load **Murugan Sweet Stall**.
- Select **Star Flex Banner Printing**.
- Enter Width: `10`, Height: `4` ft.
  - Point out: $10 \times 4 = 40\text{ sq.ft} \times ₹18 = ₹720$.
- Show **Artwork & Design Source**:
  - Click **"Customer Brought File"** $\rightarrow$ select **WhatsApp** (file: `WhatsApp-Banner-Print.pdf`).
  - Or toggle to **"Shop PC Template Library"** $\rightarrow$ select `FLEX-GRAND-01` and type text changes: *"Shop Name: Murugan Sweets"*.
- Point out the **Automated Machine Assignment**:
  - Automatically routes to **Sector 1 (Flora Solvent)** with live queue reasoning.
- Click **Half Advance (₹385)** via **CASH**.
- Click **Create Order & Generate Bill**.

### Step 3: Print Receipt Chit
- Show the **80mm Thermal Receipt** chit preview with bill number, customer details, and balance due.
- Click the **"A4 Invoice"** tab to show the formal GST tax invoice view.

### Step 4: The Machine Floor Screen (Production Queue)
- Click **Production Queue**.
- Show the 4 stages: `Confirmed` ➔ `In Production` ➔ `Finishing & QC` ➔ `Ready for Pickup`.
- Show how the machine operator sees:
  - Exact size: $10 \times 4\text{ ft}$
  - Material: Star Flex 340gsm
  - Design file link: `📂 WhatsApp-Banner-Print.pdf` (RIP READY)
- Click **"Start Printing →"** ➔ **"Mark QC Done →"** ➔ **"Ready for Collection →"**.

### Step 5: Customer Pickup & Remaining Balance
- Click **Orders** $\rightarrow$ select the order.
- Click **Collect Balance** $\rightarrow$ enter ₹385 via **UPI (GPay)** $\rightarrow$ order marks **Paid & Completed**.

### Step 6: Physical Cash Drawer (கல்லா) & Shift Handover
- Click **Cash & Shifts (கல்லா)** in the sidebar.
- Show the mathematical equation:
  $$\text{Expected Cash} = \text{Opening Float} + \text{Cash In} - \text{Cash Out}$$
- Explain: *"Notice that the UPI balance did not increase physical cash in the box—only cash advances touch the drawer."*
- Demonstrate the **Rupee Denomination Counter** (₹500, ₹200, ₹100, etc.) and show how any discrepancy requires an explanation note before handover.

---

## 6. Answers to Client Questions

1. **"Can we change sq.ft rates or machine names?"**
   - *Answer*: Yes, under **Settings**, you can update square foot rates, material types, setup charges, and machinery names anytime.
2. **"What if the internet disconnects?"**
   - *Answer*: Counter staff can continue taking walk-in orders and printing chits offline. All records are buffered and sync automatically when internet returns.
3. **"Can staff delete bills or hide missing cash?"**
   - *Answer*: No. Every order creation, discount, and shift discrepancy is permanently recorded in the **Immutable Audit Log** with operator name and timestamp.
4. **"Can we add our Sharma Nagar or Broadway branches later?"**
   - *Answer*: Yes! The architecture is built with multi-branch database support from day one.

---

## 7. Project Files & Verification Status

- **Frontend Core**: `src/App.tsx`, `src/context/AppContext.tsx`
- **Fast POS View**: `src/components/views/NewOrderView.tsx`
- **Shop Floor Kanban**: `src/components/views/ProductionView.tsx`
- **Cash Drawer Reconciler**: `src/components/views/CashShiftsView.tsx`
- **Receipts & Invoices**: `src/components/common/ThermalReceipt.tsx`
- **Backend API**: `server/app.ts`, `server/db.ts`, `server/index.ts`
- **Database Storage**: `server/data/db.json`
- **Permanent Backup Snapshot**: `backups/` directory
