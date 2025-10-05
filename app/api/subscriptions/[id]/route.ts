import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { computeMonthlyCost, type Subscription } from "@/types/subscription"

function withCost(sub: Subscription) {
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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const sub = db.getSubscription(session.user.id, params.id)
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(withCost(sub))
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
  try {
    const updated = db.upsertSubscription(session.user.id, {
      id: params.id,
      name: String(name),
      billing_cycle,
      is_active: Boolean(is_active),
      base_cost: Number(base_cost || 0),
      tax_rate: Number(tax_rate || 0),
    })
    return NextResponse.json(withCost(updated))
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to update" }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const ok = db.deleteSubscription(session.user.id, params.id)
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
