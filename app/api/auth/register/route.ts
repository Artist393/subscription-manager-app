import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSessionCookie, hashPassword } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || "")
      .toLowerCase()
      .trim()
    const password = String(body.password || "")
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    const hashed = hashPassword(password)
    const user = db.createUser(email, hashed)
    await createSessionCookie({ sub: user.id, email: user.email })
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Registration failed" }, { status: 400 })
  }
}
