"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import type { SubscriptionWithCost } from "@/types/subscription"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Props = {
  query: { page: number; limit: number; cycle?: string; search?: string; sort_by?: string; order?: "asc" | "desc" }
  onEdit: (s: SubscriptionWithCost) => void
}

export function SubscriptionTable({ query, onEdit }: Props) {
  const { toast } = useToast()
  const params = new URLSearchParams()
  params.set("page", String(query.page))
  params.set("limit", String(query.limit))
  if (query.cycle) params.set("cycle", query.cycle)
  if (query.search) params.set("search", query.search)
  if (query.sort_by) params.set("sort_by", query.sort_by)
  if (query.order) params.set("order", query.order)
  const key = `/api/subscriptions?${params.toString()}`

  const { data, isLoading, mutate } = useSWR(key, fetcher)

  async function remove(id: string) {
    if (!confirm("Delete this subscription?")) return
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast({ title: "Delete failed", description: err.error || "Error", variant: "destructive" })
      return
    }
    await mutate()
    toast({ title: "Deleted" })
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>
  }

  const items: SubscriptionWithCost[] = data?.items || []
  const total = data?.total || 0
  const page = data?.page || 1
  const limit = data?.limit || query.limit
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const totalMonthlySum = items.reduce((acc, s) => acc + Number(s.total_monthly_cost || 0), 0)

  return (
    <div className="grid gap-3">
      <div className="text-sm">
        Page total monthly sum: <span className="font-medium">${totalMonthlySum.toFixed(2)}</span>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Base</TableHead>
              <TableHead className="text-right">Tax</TableHead>
              <TableHead className="text-right">Total monthly</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.billing_cycle}</TableCell>
                <TableCell>{s.is_active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">${s.base_cost.toFixed(2)}</TableCell>
                <TableCell className="text-right">{(s.tax_rate * 100).toFixed(1)}%</TableCell>
                <TableCell className="text-right font-medium">${Number(s.total_monthly_cost).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(s)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`?page=${Math.max(1, page - 1)}`}
              onClick={(e) => {
                e.preventDefault()
                const prev = Math.max(1, page - 1)
                const url = new URL(window.location.href)
                url.searchParams.set("page", String(prev))
                history.replaceState({}, "", url.toString())
              }}
            />
          </PaginationItem>
          <div className="px-3 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <PaginationItem>
            <PaginationNext
              href={`?page=${Math.min(totalPages, page + 1)}`}
              onClick={(e) => {
                e.preventDefault()
                const next = Math.min(totalPages, page + 1)
                const url = new URL(window.location.href)
                url.searchParams.set("page", String(next))
                history.replaceState({}, "", url.toString())
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
