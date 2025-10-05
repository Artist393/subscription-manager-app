export type BillingCycle = "Monthly" | "Annually" | "Quarterly"

export interface Subscription {
  id: string
  userId: string
  name: string
  billing_cycle: BillingCycle
  is_active: boolean
  base_cost: number
  tax_rate: number
  created_at: string
}

export interface SubscriptionWithCost extends Subscription {
  total_monthly_cost: number
}

export function cycleFactor(cycle: BillingCycle) {
  switch (cycle) {
    case "Monthly":
      return 1
    case "Quarterly":
      return 3
    case "Annually":
      return 12
    default:
      return 1
  }
}

export function computeMonthlyCost(sub: Pick<Subscription, "base_cost" | "tax_rate" | "billing_cycle">) {
  const factor = cycleFactor(sub.billing_cycle)
  return (sub.base_cost * (1 + sub.tax_rate)) / factor
}
