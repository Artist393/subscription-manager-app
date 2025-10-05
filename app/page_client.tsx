"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubscriptionForm } from "@/components/subscription-form"
import { SubscriptionTable } from "@/components/subscription-table"
import { SubscriptionFilters } from "@/components/subscription-filters"
import { useToast } from "@/hooks/use-toast"
import type { SubscriptionWithCost } from "@/types/subscription"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ClientApp({ initialAuthenticated }: { initialAuthenticated: boolean }) {
  const { toast } = useToast()
  const { data, mutate } = useSWR("/api/auth/me", fetcher, { fallbackData: { authenticated: initialAuthenticated } })

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [cycle, setCycle] = useState("")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("")
  const [order, setOrder] = useState<"asc" | "desc">("asc")

  const [editing, setEditing] = useState<SubscriptionWithCost | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = Number(params.get("page") || "1")
    setPage(Math.max(1, p))
  }, [])

  async function authSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const out = await res.json().catch(() => ({}) as any)

      if (!res.ok) {
        if (isLogin && res.status === 404 && out?.code === "NO_ACCOUNT") {
          setIsLogin(false)
          // Keep the email so the user can register quickly
          // Show a clear message prompting account creation
          toast({
            title: "No account found",
            description: "Create an account to continue.",
            variant: "destructive",
          })
          return
        }
        if (isLogin && res.status === 401 && out?.code === "WRONG_PASSWORD") {
          toast({
            title: "Incorrect password",
            description: "Please try again.",
            variant: "destructive",
          })
          return
        }
        throw new Error(out?.error || "Auth failed")
      }

      await mutate()
      setEmail("")
      setPassword("")
      toast({ title: isLogin ? "Logged in" : "Registered" })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Auth failed", variant: "destructive" })
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate()
  }

  function exportCsv() {
    // Build current list CSV from current query
    const params = new URLSearchParams()
    params.set("page", "1") // export first page from API by design
    params.set("limit", String(limit))
    if (cycle) params.set("cycle", cycle)
    if (search) params.set("search", search)
    if (sortBy) params.set("sort_by", sortBy)
    if (order) params.set("order", order)
    fetch(`/api/subscriptions?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        const items: SubscriptionWithCost[] = json.items || []
        const rows = [
          ["name", "billing_cycle", "is_active", "base_cost", "tax_rate", "total_monthly_cost"],
          ...items.map((i) => [
            i.name,
            i.billing_cycle,
            i.is_active ? "true" : "false",
            String(i.base_cost),
            String(i.tax_rate),
            String(i.total_monthly_cost),
          ]),
        ]
        const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "subscriptions.csv"
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  const query = useMemo(
    () => ({ page, limit, cycle, search, sort_by: sortBy, order }),
    [page, limit, cycle, search, sortBy, order],
  )

  if (!data?.authenticated) {
    return (
      <div className="mx-auto max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={authSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{isLogin ? "Login" : "Create account"}</Button>
                <Button type="button" variant="secondary" onClick={() => setIsLogin((v) => !v)}>
                  {isLogin ? "Need an account?" : "Have an account? Login"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Signed in</div>
        <Button variant="secondary" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit subscription" : "Create subscription"}</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionForm
              editing={editing || undefined}
              onSaved={() => setEditing(null)}
              onCancelEdit={() => setEditing(null)}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <SubscriptionFilters
            search={search}
            onSearchChange={setSearch}
            cycle={cycle}
            onCycleChange={setCycle}
            sortBy={sortBy}
            order={order}
            onSortByChange={setSortBy}
            onOrderChange={setOrder}
            onExportCsv={exportCsv}
          />
          <SubscriptionTable query={query} onEdit={(s) => setEditing(s)} />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Limit: {limit} per page</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Prev
              </Button>
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
