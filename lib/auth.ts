import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"
import type { User } from "./db"
import { db } from "./db"

const textEncoder = new TextEncoder()

// In-memory secret for demo. Regenerated on server reloads.
// In a real app, use an env var secret.
const SECRET = randomBytes(32)

const SESSION_COOKIE = "session"

export interface SessionPayload {
  sub: string // user id
  email: string
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
}

export async function getSession(): Promise<{ user: User } | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE)?.value
  if (!cookie) return null
  try {
    const { payload } = await jwtVerify(cookie, SECRET)
    const userId = String(payload.sub)
    const user = db.findUserById(userId)
    if (!user) return null
    return { user }
  } catch {
    return null
  }
}

// Password hashing helpers (scrypt with per-user salt)
export function hashPassword(password: string) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `${salt.toString("hex")}:${hash.toString("hex")}`
}

export function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":")
  const salt = Buffer.from(saltHex, "hex")
  const hash = Buffer.from(hashHex, "hex")
  const candidate = scryptSync(password, salt, 64)
  try {
    return timingSafeEqual(hash, candidate)
  } catch {
    return false
  }
}
