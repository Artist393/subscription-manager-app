import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { computeMonthlyCost, type Subscription, type SubscriptionWithCost } from "@/types/subscription"

function withCost(sub: Subscription): SubscriptionWithCost {
  return {
    ...sub,
    total_monthly_cost: Number(
      computeMonthlyCost({
        base_cost: sub.base_cost,
        tax_rate: sub.tax_rate,
        billing_cycle: sub.billing_cycle,
      }).toFixed(2),
    ),
  }
}

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "5")))
  const cycle = url.searchParams.get("cycle")
  const sort_by = url.searchParams.get("sort_by") // 'cost'
  const order = (url.searchParams.get("order") || "asc").toLowerCase() === "desc" ? "desc" : "asc"
  const search = (url.searchParams.get("search") || "").toLowerCase().trim()

  let items = db.listSubscriptions(session.user.id)

  // Filter by cycle
  if (cycle === "Monthly" || cycle === "Annually" || cycle === "Quarterly") {
    items = items.filter((i) => i.billing_cycle === cycle)
  }

  // Search by name
  if (search) {
    items = items.filter((i) => i.name.toLowerCase().includes(search))
  }

  // Map to include calculated cost
  let mapped = items.map(withCost)

  // Sort by cost if requested
  if (sort_by === "cost") {
    mapped = mapped.sort((a, b) => a.total_monthly_cost - b.total_monthly_cost)
    if (order === "desc") mapped.reverse()
  }

  const total = mapped.length
  const start = (page - 1) * limit
  const end = start + limit
  const paged = mapped.slice(start, end)

  return NextResponse.json({
    items: paged,
    page,
    limit,
    total,
    hasNextPage: end < total,
    hasPrevPage: start > 0,
  })
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, billing_cycle, is_active, base_cost, tax_rate } = body || {}

  if (!name || !billing_cycle || typeof is_active !== "boolean") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (!["Monthly", "Annually", "Quarterly"].includes(billing_cycle)) {
    return NextResponse.json({ error: "Invalid billing_cycle" }, { status: 400 })
  }

  const sub = db.upsertSubscription(session.user.id, {
    name: String(name),
    billing_cycle,
    is_active: Boolean(is_active),
    base_cost: Number(base_cost || 0),
    tax_rate: Number(tax_rate || 0),
  })

  return NextResponse.json(withCost(sub), { status: 201 })
}
