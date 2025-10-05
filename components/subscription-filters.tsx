"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Props = {
  search: string
  onSearchChange: (v: string) => void
  cycle: string
  onCycleChange: (v: string) => void
  sortBy: string
  order: "asc" | "desc"
  onSortByChange: (v: string) => void
  onOrderChange: (v: "asc" | "desc") => void
  onExportCsv: () => void
}

export function SubscriptionFilters(props: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="grid gap-2">
        <label className="text-sm">Search</label>
        <Input
          placeholder="Search by name"
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm">Billing cycle</label>
        <Select value={props.cycle} onValueChange={props.onCycleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annually">Annually</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm">Sort by</label>
        <Select value={props.sortBy} onValueChange={props.onSortByChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="cost">Total monthly cost</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm">Order</label>
        <Select value={props.order} onValueChange={(v) => props.onOrderChange(v as "asc" | "desc")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:ml-auto flex gap-2">
        <Button variant="secondary" onClick={props.onExportCsv}>
          Export CSV
        </Button>
      </div>
    </div>
  )
}
