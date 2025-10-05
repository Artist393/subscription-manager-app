# 🚀 Subscription Manager – AI-Powered Dashboard

> **Live Demo**: [https://subscription-manager-app.vercel.app](https://subscription-manager-app.vercel.app)  
> Built in **24 hours** for the **Shipsy AI Campus Challenge** using Next.js, TypeScript, and **Gemini CLI**

A sleek, full-stack subscription management dashboard that proves you don’t need magic — just great tools and better thinking.

🔐 Log in | ➕ Create | 🔄 Edit | ❌ Delete | 🔍 Filter | 📊 Calculate | 📄 Export

---

## 🌟 Why This Stands Out

This isn't just another CRUD app. It’s a **real-world-ready prototype** built with:
- ✅ Clean, modular code (OOP principles: encapsulation & modularity)
- ✅ Smart calculated fields (`total_monthly_cost`) that normalize annual/quarterly costs
- ✅ JWT-based auth with secure password hashing (`scrypt`)
- ✅ Pagination, filtering, sorting, and CSV export
- ✅ 100% prompt-driven development using **Gemini CLI**

🎯 Purpose: Show how AI can accelerate coding without sacrificing ownership or understanding.

---

## 🔧 Tech Stack

| Layer | Tool |
|------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI Library | ShadCN + Tailwind CSS |
| State | React Hooks + SWR |
| Auth | JWT in HTTP-only cookies |
| DB | In-memory simulation (`lib/db.ts`) |
| Hosting | Vercel |
| AI Assistant | Gemini CLI (for logic, debugging, security) |

---

## 🛠 Key Features

### ✅ Authentication System
- Simulated login with secure `scrypt` password hashing
- Session persistence via JWT-like tokens
- Protected routes prevent unauthorized access

### ✅ CRUD Operations
Manage subscriptions with ease:
- **Create**: Add new plans with name, cycle, cost, tax
- **Read**: View list with smart calculations
- **Update**: Edit any field inline
- **Delete**: With confirmation modal

### ✅ Data Model
Each subscription includes:
| Field | Type | Example |
|------|------|--------|
| `name` | Text | "Netflix Premium" |
| `billing_cycle` | Enum | Monthly / Quarterly / Annually |
| `is_active` | Boolean | ✅ Active / ❌ Inactive |
| `total_monthly_cost` | Calculated | Auto-computed from base cost + tax + cycle factor |


Ensures fair comparison across different billing cycles!

✅ Listing & Management
Pagination: 8 items per page
Filter: By billing cycle (Monthly, Quarterly, Annually)
Sort: By total monthly cost
Search: Find by name instantly
Export: One-click CSV download
🤖 How I Used Gemini CLI
This project was built with AI, not by AI.

I used Gemini CLI as my co-pilot for:

Writing secure scrypt password hashing logic
Debugging SWR mutation issues after form submit
Generating proper JWT session flow in Next.js
Structuring TypeScript interfaces (SubscriptionWithCost)
Optimizing calculated field logic for fairness
📌 All prompts documented in /docs/ai-prompts.md — because transparency builds trust.

📂 Project Structure
src/
├── app/                  → Pages & API routes
├── components/           → Reusable UI
├── lib/                  → Auth & DB logic
├── types/                → TypeScript models
└── docs/                 → Submission artifacts
    ├── ai-prompts.md     → My AI journey
    ├── architecture.md   → Design breakdown
    ├── commits.md        → Git history proof
    └── video.md          → Demo walkthrough

Clean. Modular. Maintainable.

🎥 Watch the Demo
See it in action:
👉 Watch Demo Video

In this 3-minute walkthrough, I explain:

How the app works
My architectural decisions
How I used AI effectively
And why this is my original work
📦 Local Setup
Want to run it locally?

bash


1
2
3
4
5
6
7
8
9
10
11
# Clone the repo
git clone https://github.com/Artist393/subscription-manager-app.git

# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:3000
No database setup needed — powered by simulated in-memory storage 🚀

🏁 Final Note
This project reflects my ability to:

Think architecturally
Code cleanly
Use AI responsibly
Deliver fast under constraints
Built during the Shipsy AI Campus challenge — where future developers are reimagined.

Author: Artist393
Date: May 5, 2025
GitHub: @Artist393

🔢 **Smart Calculation Logic**:
```ts
total_monthly_cost = (base_cost × (1 + tax_rate)) / cycleFactor
