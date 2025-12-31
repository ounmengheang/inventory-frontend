# Frontend Structure Documentation

## 📁 Project Overview
This is a Next.js 14+ inventory management system built with TypeScript, React, and Tailwind CSS.

---

## 🗂️ Root Directory Structure

```
inventory-frontend/
├── app/                    # Next.js App Router (pages & layouts)
├── components/             # React components (UI & business logic)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions & API calls
├── public/                 # Static assets (images, icons)
├── scripts/                # Database SQL scripts
├── styles/                 # Global CSS styles
├── types/                  # TypeScript type definitions
├── .next/                  # Next.js build output (auto-generated)
└── Configuration files
```

---

## 📂 Detailed Folder Structure

### `/app` - Application Routes & Pages
Uses Next.js 14+ App Router with file-based routing.

```
app/
├── layout.tsx              # Root layout (wraps all pages)
├── page.tsx                # Home page (/)
├── globals.css             # Global styles
│
├── auth/                   # Authentication pages
│   ├── login/              # Login page (/auth/login)
│   ├── sign-up/            # Sign up page (/auth/sign-up)
│   ├── sign-up-success/    # Success confirmation page
│   └── error/              # Auth error page
│
├── dashboard/              # Business Intelligence Dashboard
│   ├── page.tsx            # Main dashboard (/dashboard)
│   ├── activity-log/       # Activity log page
│   └── settings/           # Dashboard settings
│
├── inventory/              # Inventory Management
│   └── page.tsx            # Inventory list & management (/inventory)
│
├── customers/              # Customer Management
│   └── page.tsx            # Customer list & CRUD (/customers)
│
├── suppliers/              # Supplier Management
│   └── page.tsx            # Supplier list & CRUD (/suppliers)
│
├── invoices/               # Invoice Management
│   ├── page.tsx            # Invoice list (/invoices)
│   └── create/             # Create invoice page (/invoices/create)
│
├── purchase-orders/        # Purchase Order Management
│   └── page.tsx            # PO list & management (/purchase-orders)
│
└── transactions/           # Transaction History
    └── page.tsx            # Transaction list (/transactions)
```

**Key Files:**
- `layout.tsx` - Defines the root HTML structure, includes fonts, analytics, and theme provider
- `page.tsx` - Each page.tsx represents a route endpoint
- `globals.css` - Contains Tailwind directives and custom CSS variables

---

### `/components` - Reusable UI Components
Organized by feature domains.

```
components/
├── ui/                     # Shadcn/ui base components (buttons, dialogs, cards, etc.)
│   ├── button.tsx          # Button component with variants
│   ├── card.tsx            # Card container component
│   ├── dialog.tsx          # Modal/dialog component
│   ├── input.tsx           # Form input component
│   ├── table.tsx           # Table components
│   ├── badge.tsx           # Badge/label component
│   ├── select.tsx          # Dropdown select component
│   └── ... (30+ UI primitives)
│
├── auth/                   # Authentication components
│   └── user-menu.tsx       # User dropdown menu (logout, profile)
│
├── navigation/             # Navigation components
│   └── sidebar.tsx         # Main sidebar navigation with responsive overlay
│
├── dashboard/              # Dashboard-specific components
│   ├── stats-cards.tsx             # Revenue, invoices, products stats
│   ├── revenue-chart.tsx           # Bar chart for revenue
│   ├── top-products.tsx            # Best-selling products list
│   ├── low-stock-alert.tsx         # Low stock warnings
│   ├── sales-performance.tsx       # Sales metrics
│   ├── profit-summary.tsx          # Profit calculations
│   ├── inventory-health.tsx        # Inventory status overview
│   ├── customer-insights.tsx       # Customer analytics
│   ├── supplier-analytics.tsx      # Supplier performance
│   ├── restock-alerts.tsx          # Restock predictions
│   └── recent-activity.tsx         # Activity feed
│
├── inventory/              # Inventory management components
│   ├── inventory-table.tsx         # Main inventory data table
│   ├── inventory-dialog.tsx        # Add/edit product modal
│   ├── inventory-form.tsx          # Product form fields
│   └── add-stock-dialog.tsx        # Restock modal
│
├── customers/              # Customer management components
│   ├── customers-table.tsx         # Customer data table
│   └── customer-dialog.tsx         # Add/edit customer modal
│
├── suppliers/              # Supplier management components
│   ├── supplier-table.tsx          # Supplier data table
│   ├── supplier-dialog.tsx         # Add/edit supplier modal
│   ├── supplier-form.tsx           # Supplier form fields
│   └── supplier-detail-dialog.tsx  # Supplier details with products
│
├── invoice/                # Invoice components
│   ├── invoice-list.tsx            # Invoice data table
│   ├── create-invoice-form.tsx     # Invoice creation form
│   ├── invoice-preview.tsx         # Invoice PDF preview
│   └── khqr-payment-dialog.tsx     # KHQR payment QR code
│
├── purchase-orders/        # Purchase order components
│   ├── purchase-order-table.tsx    # PO data table
│   ├── purchase-order-dialog.tsx   # Create/edit PO modal
│   ├── purchase-order-form.tsx     # PO form fields
│   └── invoice-generator.tsx       # Generate invoice from PO
│
├── transactions/           # Transaction components
│   └── (transaction-related components)
│
└── theme-provider.tsx      # Dark/light theme context provider
```

**Key Concepts:**
- **UI Components** (`/ui`) - Base design system components from Shadcn/ui
- **Feature Components** - Business logic components organized by domain
- **Dialogs** - Modal forms for CRUD operations
- **Tables** - Data tables with search, filter, and pagination
- **Forms** - Complex forms with validation

---

### `/hooks` - Custom React Hooks
Reusable stateful logic.

```
hooks/
├── use-mobile.ts           # Detects if viewport is mobile size
├── use-sidebar-state.ts    # Manages sidebar open/close state (persisted)
└── use-toast.ts            # Toast notification system
```

**Usage:**
- `useMobile()` - Returns boolean for responsive breakpoints
- `useSidebarState()` - Syncs sidebar state with localStorage
- `useToast()` - Shows success/error notifications

---

### `/lib` - Utility Functions & Business Logic

```
lib/
├── api.ts                  # API client functions for backend communication
├── analytics.ts            # Dashboard analytics calculations
├── permissions.ts          # User role & permission checks
└── utils.ts                # Helper functions (cn, formatters, etc.)
```

**Key Functions:**

**`api.ts`** - Backend API calls:
- `getCurrentUser()` - Get logged-in user
- `getInventoryItems()` - Fetch inventory
- `addInventoryItem()`, `updateInventoryItem()`, `deleteInventoryItem()`
- `getInvoices()`, `createInvoice()`
- `getSuppliers()`, `addSupplier()`
- All CRUD operations for entities

**`analytics.ts`** - Dashboard calculations:
- `calculateTotalStats()` - Revenue, invoice count, product count
- `calculateSalesData()` - Top-selling products
- `getLowStockItems()` - Products below minimum stock
- `calculateRevenueByDate()` - Revenue trends
- `calculateSupplierAnalytics()` - Supplier performance

**`permissions.ts`** - Role-based access:
- `canWrite()` - Check if user can create/edit
- `canDelete()` - Check if user can delete
- `isManagerOrAdmin()` - Check elevated permissions
- `isStaff()` - Check staff role
- `getUserRole()` - Get current user role

**`utils.ts`** - Utilities:
- `cn()` - Tailwind class name merger
- Date formatters, currency formatters

---

### `/types` - TypeScript Type Definitions

```
types/
└── index.ts                # All TypeScript interfaces & types
```

**Main Types:**
```typescript
- InventoryItem      // Product with stock, pricing, images
- Invoice            // Invoice with items and customer
- InvoiceItem        // Line item in invoice
- Supplier           // Supplier details
- Customer           // Customer information
- PurchaseOrder      // Purchase order from supplier
- SalesData          // Analytics data structure
- User               // User with role
```

---

### `/scripts` - Database SQL Scripts

```
scripts/
├── 001_create_inventory_table.sql      # Inventory table schema
├── 002_create_storage_bucket.sql       # File storage setup
├── 003_create_invoices_table.sql       # Invoice tables
├── 004_create_suppliers_table.sql      # Supplier table
└── 005_create_purchase_orders_table.sql # PO table
```

**Purpose:** Database schema for Supabase backend

---

### `/public` - Static Assets

```
public/
├── images/                 # Product images, logos
├── icons/                  # App icons
└── favicon.ico             # Browser favicon
```

---

### `/styles` - Additional Styles

```
styles/
└── globals.css             # Additional global styles (if needed)
```

---

## 🔧 Configuration Files

### Core Configuration

- **`next.config.mjs`** - Next.js configuration (images, routes, env)
- **`tsconfig.json`** - TypeScript compiler options
- **`components.json`** - Shadcn/ui component configuration
- **`middleware.ts`** - Next.js middleware (auth, redirects)

### Styling

- **`tailwind.config.ts`** - Tailwind CSS customization
- **`postcss.config.mjs`** - PostCSS plugins configuration

### Package Management

- **`package.json`** - Dependencies and scripts
- **`.env.local`** - Environment variables (API keys, URLs)

---

## 🎨 Styling System

### Tailwind CSS Utilities
- **Responsive breakpoints:**
  - `sm:` - 640px and up (tablets)
  - `md:` - 768px and up (small laptops)
  - `lg:` - 1024px and up (desktops)
  - `xl:` - 1280px and up (large screens)

### CSS Variables (Design Tokens)
Located in `app/globals.css`:
```css
--background, --foreground      # Page colors
--primary, --secondary          # Brand colors
--muted, --accent              # Neutral colors
--destructive                   # Error/danger color
--border, --input, --ring       # Form element colors
--card                          # Card backgrounds
--radius                        # Border radius
```

---

## 🚀 Key Features

### 1. **Responsive Design**
- Mobile-first approach
- Sidebar overlay on mobile
- Horizontal scrolling tables
- Responsive grids and forms
- Touch-friendly buttons

### 2. **Role-Based Access Control**
- **Staff** - Read inventory, create invoices
- **Manager** - Full access except user management
- **Admin** - Full system access

### 3. **Data Tables**
- Search functionality
- Multi-filter support
- Sortable columns
- Pagination ready
- Export capabilities

### 4. **Forms & Validation**
- Client-side validation
- Server-side error handling
- Real-time field updates
- Auto-save drafts

### 5. **Dashboard Analytics**
- Real-time statistics
- Revenue charts
- Sales trends
- Low stock alerts
- Supplier performance
- Customer insights

### 6. **Payment Integration**
- KHQR (Cambodian QR payment)
- Cash, Card, Bank Transfer
- Payment status tracking
- Invoice generation

---

## 🔄 Data Flow

```
User Interaction
    ↓
Component (UI)
    ↓
API Function (lib/api.ts)
    ↓
Backend API (Django)
    ↓
Database (Supabase/PostgreSQL)
    ↓
Response
    ↓
Component State Update
    ↓
UI Re-render
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## 📱 Responsive Breakpoints

| Device | Width | Tailwind |
|--------|-------|----------|
| Mobile | 320px - 639px | default |
| Tablet | 640px - 767px | `sm:` |
| Laptop | 768px - 1023px | `md:` |
| Desktop | 1024px+ | `lg:` |
| Large | 1280px+ | `xl:` |

---

## 🔐 Authentication Flow

1. User visits app → Redirected to `/auth/login`
2. Login with credentials → Token stored in localStorage
3. Token sent with every API request in Authorization header
4. Middleware checks auth on protected routes
5. Logout → Token removed, redirect to login

---

## 📊 Component Hierarchy

```
Layout (Root)
├── Sidebar (Navigation)
│   └── User Menu
│
└── Main Content Area
    ├── Page Header (Title, Actions)
    ├── Filters & Search
    ├── Data Table / Charts
    └── Dialogs/Modals (CRUD forms)
```

---

## 🎯 Best Practices

### File Organization
- Group by feature, not by type
- Keep components small and focused
- Extract reusable logic to hooks
- Use TypeScript for type safety

### Naming Conventions
- Components: PascalCase (`CustomerDialog.tsx`)
- Files: kebab-case (`customer-dialog.tsx`)
- Functions: camelCase (`getInventoryItems()`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Component Structure
```tsx
1. Imports
2. Types/Interfaces
3. Component definition
4. State & hooks
5. Event handlers
6. Effects
7. Render logic
8. Export
```

---

## 🐛 Debugging Tips

1. **Check Browser Console** - Look for API errors
2. **Verify Token** - Check localStorage for auth token
3. **Network Tab** - Monitor API requests/responses
4. **React DevTools** - Inspect component state
5. **Check Backend Logs** - Django server console

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

When adding new features:
1. Create components in appropriate feature folder
2. Add TypeScript types to `/types/index.ts`
3. Create API functions in `/lib/api.ts`
4. Test on mobile and desktop
5. Update this documentation

---

**Last Updated:** December 31, 2025
