import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSessionCookie, verifyPassword } from "@/lib/auth"

export async function POST(req: Request) {
  const body = await req.json()
  const email = String(body.email || "")
    .toLowerCase()
    .trim()
  const password = String(body.password || "")
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }
  const user = db.findUserByEmail(email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
  await createSessionCookie({ sub: user.id, email: user.email })
  return NextResponse.json({ id: user.id, email: user.email })
}
