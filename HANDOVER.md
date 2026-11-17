# 📋 Project Handover & Context Summary: Trio Car Wash & Oil Center

> **Date Generated:** 2026-11-12  
> **Workspace:** `D:\Trio Car Wash`  
> **Purpose:** Seamless transfer of project state, architecture, and agent context to another device.

---

## 🚀 How to Resume Work on Your New Device

If you are using Antigravity, VS Code, or another AI coding environment on your second machine:

1. **Copy or Clone the Project:** Transfer the `Trio Car Wash` folder to your new computer (via Git, USB, or cloud sync).
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
4. **Resume with the AI Agent:** In your new chat session, simply mention this file:
   > `@HANDOVER.md I transferred this project from my other PC. Please read the handover and help me with [next task].`

---

## 🛠️ Tech Stack & Key Libraries

- **Framework:** React 19 (`react` & `react-dom` 19.3.1)
- **Language:** TypeScript 7 (`tsconfig.app.json`, `tsconfig.node.json`)
- **Build Tool:** Vite 8 (`@vitejs/plugin-react` & `@tailwindcss/vite`)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React (`lucide-react`)
- **Backend / Database:** Google Firebase v13 (Firestore, Auth) with hybrid offline LocalStorage fallback
- **Linter:** Oxlint (`oxlint` 1.90.0)
- **Deployment Targets:** Firebase Hosting (`firebase.json`) & Vercel (`vercel.json`)

---

## 💡 System Architecture & Core Modules

The application is structured into modular feature domains under `src/`:

```
d:\Trio Car Wash\src
├── assets/                  # Logos and static media (masar-tech-logo, hero.png, etc.)
├── components/
│   ├── Analytics/           # ReportsDashboard.tsx (revenue, profits, charts)
│   ├── Auth/                # LoginPage.tsx (Admin vs. Cashier login)
│   ├── Inventory/           # InventoryList, AddItem, Restock, ReduceStock, MovementHistory
│   ├── Orders/              # OrdersList.tsx (order history & status)
│   ├── POS/                 # POSDashboard.tsx, NewOrderModal.tsx, ReceiptModal.tsx
│   ├── Services/            # ServicesManager.tsx (custom service pricing per car size)
│   ├── Settings/            # SettingsView.tsx (Firebase credentials, print & store settings)
│   ├── Shifts/              # ShiftManager.tsx, ExpenseModal.tsx (cash drawer & shift closing)
│   ├── UI/                  # MasarTechModal.tsx, ToastContainer.tsx
│   ├── Workers/             # WorkersManager.tsx (staff management)
│   └── Navbar.tsx           # Global navigation and agency modal triggers
├── context/
│   └── AppContext.tsx       # Central state provider (orders, stock, shifts, workers, auth)
├── data/
│   └── initialData.ts       # Default Egyptian market presets (Shell, Mobil, Mann filters, etc.)
├── services/
│   ├── firebase.ts          # Firebase SDK initialization & Firestore sync
│   ├── storage.ts           # Hybrid persistence layer (localStorage <-> Firestore)
│   └── whatsapp.ts          # WhatsApp receipt generation & oil change reminder deep-links
└── types/
    └── index.ts             # Complete TypeScript definitions for all business entities
```

---

## ✨ Implemented Features & Recent Progress

1. **Dynamic Vehicle Pricing & Service Management (`src/components/Services`):**
   - Owners can add, edit, and delete services.
   - Distinct pricing based on vehicle category (Sedan, SUV / Crossover, Van / Microbus, Motorcycle).

2. **Smart Inventory & Oil Stock Control (`src/components/Inventory`):**
   - Stock In (`RestockModal`) with purchase price and supplier info.
   - Stock Out / Manual deduction (`ReduceStockModal`) for leaks, shrinkage, or internal salon consumption.
   - Automatic inventory deduction when completing an order in POS.
   - Low-stock warning indicators and comprehensive movement audit history (`MovementHistoryModal`).

3. **POS & Order Execution (`src/components/POS`):**
   - Fast order processing for cashier and technician screens.
   - Automatic next oil change mileage calculation based on chosen oil grade (e.g. 5,000 km or 10,000 km).
   - Thermal receipt modal (80mm & 58mm printer friendly).
   - Instant WhatsApp invoice generator with formatted breakdown.

4. **Shift & Cash Drawer Management (`src/components/Shifts`):**
   - Shift opening with starting cash float.
   - Petty cash daily expense recording (`ExpenseModal`).
   - Payment method breakdown: Cash, InstaPay, Vodafone Cash/wallets, and Visa.
   - Shift end reconciliation showing calculated vs. actual physical cash.

5. **Agency & Developer Branding (`Masar Tech`):**
   - Masar Tech developer showcase modal integrated into the top navbar and login footer.
   - Clean transparent dark-mode logo rendering.

6. **Cloud & Security Rules:**
   - Dual-mode data persistence: works offline instantly out of the box via `localStorage`, or syncs seamlessly with Firestore when configured.
   - Secured Firestore rules in `firestore.rules`.

7. **Staff Management & Developer Security Isolation (`src/components/Workers`):**
   - Developer accounts and developer role assignments are isolated from normal shop management.
   - Shop owners only see and manage their regular staff (cashiers, technicians, and owners).
   - The developer account (`@developer`), developer role option in modals, and developer metrics are visible exclusively when authenticated in Developer Mode (`isDev`).

---

## ⚙️ Environment Variables & Config

Refer to `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
*(Note: Users can also input Firebase keys directly in the in-app Settings UI without editing `.env` files).*

---

## 📌 Common Commands Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launch local Vite development server |
| `npm run build` | Type-check with `tsc -b` and produce optimized production bundle in `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Fast code quality check using Oxlint |
| `npx firebase-tools deploy --only hosting` | Deploy latest production build to Firebase Hosting |
