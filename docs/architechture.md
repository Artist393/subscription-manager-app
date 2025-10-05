# Architecture Documentation

## App Purpose
A **Subscription Management Dashboard** built with **Next.js 14 (App Router)** and **TypeScript**.  
Users log in, manage subscriptions (CRUD), view paginated lists, filter by billing cycle, sort, and see calculated monthly costs.

Built as part of the Shipsy AI Campus challenge using Gemini CLI for prompt-driven development.

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | ShadCN UI + Tailwind CSS |
| State Management | React Hooks (`useState`, `useEffect`) + SWR for data fetching |
| Authentication | JWT-based session cookies (server-side) |
| Data Storage | In-memory database (`db.ts`) – simulated persistence |
| Utilities | `crypto` for password hashing (`scrypt`) |
| API | RESTful endpoints under `/app/api/subscriptions` |

---

## Folder Structure & Module Breakdown
src/
├── app/
│ ├── api/ → API routes (auth, CRUD)
│ ├── page_client.tsx → Main dashboard (after login)
│ └── page.tsx → Login page
│
├── components/
│ ├── ui/ → Reusable ShadCN components (Button, Input, etc.)
│ ├── subscription-form.tsx → Form to create/edit subscription
│ ├── subscription-table.tsx → Table with pagination & actions
│ └── subscription-filters.tsx → Search, filter, sort controls
│
├── lib/
│ ├── auth.ts → Session management, JWT signing/verification
│ └── db.ts → In-memory user & subscription storage
│
├── types/
│ └── subscription.ts → TypeScript interfaces: Subscription, BillingCycle
│
└── hooks/
└── use-toast.ts → Toast notifications (from ShadCN)


---

## Data Model: `Subscription` Object

Each subscription has the following fields:

| Field | Type | Requirement Met |
|------|------|------------------|
| `name` | `string` | ✅ Text field |
| `billing_cycle` | `"Monthly" \| "Quarterly" \| "Annually"` | ✅ Enum (dropdown) |
| `is_active` | `boolean` | ✅ Boolean field |
| `base_cost` | `number` | Input for calculation |
| `tax_rate` | `number` | Input for calculation |
| `total_monthly_cost` | `number` | ✅ Calculated field |

> 🔢 **Calculated Field Logic**:  
> `total_monthly_cost = (base_cost × (1 + tax_rate)) / cycleFactor`  
> Where `cycleFactor`: Monthly=1, Quarterly=3, Annually=12

This ensures fair comparison across different billing cycles.

Example:
- Base Cost: $120/year → $10/month
- Tax Rate: 10%
- Total Monthly: ($120 × 1.10)/12 = **$11/month**

Implemented in: `types/subscription.ts` → `computeMonthlyCost()`

---

## Authentication System

🔐 **Secure Login Flow**:
1. User submits email/password on `page.tsx`
2. Password verified using `scrypt` hash with salt (`lib/auth.ts`)
3. On success: JWT created and stored in **HTTP-only cookie**
4. Protected route (`page_client.tsx`) checks session via `getSession()` middleware
5. Logout clears cookie

### Key Security Features:
- HTTP-only cookie → prevents XSS theft
- Salted `scrypt` hashing → secure passwords
- JWT with 7-day expiry
- No external auth libraries used

Files:
- `lib/auth.ts` → session creation/validation
- `lib/db.ts` → user storage & lookup

---

## CRUD Operations

Fully implemented via REST-style API routes and client components.

| Operation | Method | Endpoint | Component |
|---------|--------|----------|-----------|
| Create | POST | `/api/subscriptions` | `SubscriptionForm` |
| Read | GET | `/api/subscriptions?page=1&limit=8` | `SubscriptionTable` + SWR |
| Update | PUT | `/api/subscriptions/[id]` | `SubscriptionForm` |
| Delete | DELETE | `/api/subscriptions/[id]` | Inline delete button |

All operations use:
- `fetcher` with SWR for revalidation
- Error handling with toast notifications
- Confirmation modal for delete

---

## Listing & Data Management

### ✅ Pagination
- 8 items per page
- Server-side simulation via `db.listSubscriptions()` filtering
- Previous/Next buttons update URL query param (`?page=2`)
- Implemented in: `SubscriptionTable.tsx`

### ✅ Filter
- Dropdown filters by `billing_cycle`: All, Monthly, Quarterly, Annually
- Search by name (text input)
- Applied via query params → reflected in API call
- Implemented in: `SubscriptionFilters.tsx`

### 🌟 Bonus: Sorting & Order
- Sort by: None, Total Monthly Cost
- Order: Ascending or Descending
- Controlled via dropdowns → passed to backend
- Clear UX with label grouping

---

## OOP & Clean Code Principles

Despite being a small app, it follows modern software design:

| Concept | Implementation |
|--------|----------------|
| **Encapsulation** | Each component manages its own state (`SubscriptionForm`, `SubscriptionTable`) |
| **Modularity** | Separation of concerns: UI, logic, types, auth, DB |
| **Reusability** | ShadCN UI components reused across forms/tables |
| **Type Safety** | Full TypeScript coverage (`types/subscription.ts`) |
| **Separation of Concerns** | Auth, DB, UI, API all in separate files |

This makes the code maintainable and scalable.

---

## Development Approach

- Built from scratch using **Next.js App Router**
- Used **Gemini CLI** to assist with:
  - Writing scrypt password hashing logic
  - Debugging SWR mutation issues
  - Implementing proper JWT session flow
  - Structuring TypeScript interfaces
- Followed Shipsy’s anti-plagiarism policy — original architecture and implementation
- Hourly commits show iterative progress (see `/docs/commits.md`)

---

## Anti-Plagiarism Note

> This project was conceptualized, architected, and developed entirely by me during the 24-hour Shipsy AI Campus challenge. While I received guidance from a peer during early brainstorming, all code was written by me based on my own design decisions. The authentication system, CRUD logic, calculated field, pagination, and filtering were all implemented independently. I actively used Gemini CLI for debugging and optimization, with documented prompts in `/docs/ai-prompts.md`.

Author: Artist393  
Date: May 5, 2025