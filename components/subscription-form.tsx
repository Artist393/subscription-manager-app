"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { BillingCycle, Subscription } from "@/types/subscription"

type Props = {
  editing?: Subscription | null
  onSaved?: () => void
  onCancelEdit?: () => void
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function SubscriptionForm({ editing, onSaved, onCancelEdit }: Props) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly")
  const [isActive, setIsActive] = useState(true)
  const [baseCost, setBaseCost] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setBillingCycle(editing.billing_cycle)
      setIsActive(editing.is_active)
      setBaseCost(editing.base_cost)
      setTaxRate(editing.tax_rate)
    } else {
      setName("")
      setBillingCycle("Monthly")
      setIsActive(true)
      setBaseCost(0)
      setTaxRate(0)
    }
  }, [editing])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name,
      billing_cycle: billingCycle,
      is_active: isActive,
      base_cost: Number(baseCost),
      tax_rate: Number(taxRate),
    }
    try {
      const res = await fetch(editing ? `/api/subscriptions/${editing.id}` : "/api/subscriptions", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed")
      }
      await mutate((key: string) => key?.startsWith?.("/api/subscriptions"), undefined, { revalidate: true })
      toast({ title: editing ? "Subscription updated" : "Subscription created" })
      onSaved?.()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid gap-2">
        <Label>Billing cycle</Label>
        <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
          <SelectTrigger>
            <SelectValue placeholder="Select cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Quarterly">Quarterly</SelectItem>
            <SelectItem value="Annually">Annually</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="active" className="mr-4">
          Active
        </Label>
        <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="base">Base cost</Label>
        <Input
          id="base"
          type="number"
          step="0.01"
          value={baseCost}
          onChange={(e) => setBaseCost(Number.parseFloat(e.target.value || "0"))}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tax">Tax rate (e.g. 0.05)</Label>
        <Input
          id="tax"
          type="number"
          step="0.001"
          value={taxRate}
          onChange={(e) => setTaxRate(Number.parseFloat(e.target.value || "0"))}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="shrink-0">
          {editing ? "Update" : "Create"}
        </Button>
        {editing ? (
          <Button type="button" variant="secondary" onClick={onCancelEdit}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
