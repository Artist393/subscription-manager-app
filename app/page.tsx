import { cookies } from "next/headers"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import ClientApp from "./page_client"

export default async function Page() {
  const cookieStore = await cookies()
  const hasSession = Boolean(cookieStore.get("session")?.value)

  return (
    <main className="mx-auto max-w-6xl p-6 grid gap-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/placeholder-logo.svg" alt="" className="h-8 w-8" />
          <h1 className="text-2xl font-semibold text-pretty">Subscription Manager</h1>
        </div>
        <div className="text-sm text-muted-foreground">Track your recurring costs</div>
      </header>

      <Suspense>
        <ClientApp initialAuthenticated={hasSession} />
      </Suspense>
      <Toaster />
    </main>
  )
}
