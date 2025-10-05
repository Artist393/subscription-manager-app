import { randomUUID } from "crypto"
import type { Subscription } from "@/types/subscription"

export interface User {
  id: string
  email: string
  passwordHash: string // scrypt hash with salt
  created_at: string
}

type UserIndex = Map<string, User> // by email
type UserById = Map<string, User>
type SubsByUser = Map<string, Map<string, Subscription>> // userId -> (subId -> sub)

const usersByEmail: UserIndex = new Map()
const usersById: UserById = new Map()
const subsByUser: SubsByUser = new Map()

export const db = {
  createUser(email: string, passwordHash: string) {
    if (usersByEmail.has(email)) {
      throw new Error("User already exists")
    }
    const user: User = {
      id: randomUUID(),
      email,
      passwordHash,
      created_at: new Date().toISOString(),
    }
    usersByEmail.set(email, user)
    usersById.set(user.id, user)
    return user
  },
  findUserByEmail(email: string) {
    return usersByEmail.get(email) || null
  },
  findUserById(id: string) {
    return usersById.get(id) || null
  },
  upsertSubscription(userId: string, sub: Omit<Subscription, "id" | "userId" | "created_at"> & { id?: string }) {
    let bag = subsByUser.get(userId)
    if (!bag) {
      bag = new Map()
      subsByUser.set(userId, bag)
    }
    if (!sub.id) {
      const id = randomUUID()
      const newSub: Subscription = {
        id,
        userId,
        name: sub.name,
        billing_cycle: sub.billing_cycle,
        is_active: sub.is_active,
        base_cost: sub.base_cost,
        tax_rate: sub.tax_rate,
        created_at: new Date().toISOString(),
      }
      bag.set(id, newSub)
      return newSub
    } else {
      const existing = bag.get(sub.id)
      if (!existing) {
        throw new Error("Subscription not found")
      }
      const updated: Subscription = {
        ...existing,
        name: sub.name,
        billing_cycle: sub.billing_cycle,
        is_active: sub.is_active,
        base_cost: sub.base_cost,
        tax_rate: sub.tax_rate,
      }
      bag.set(updated.id, updated)
      return updated
    }
  },
  getSubscription(userId: string, id: string) {
    const bag = subsByUser.get(userId)
    if (!bag) return null
    return bag.get(id) || null
  },
  deleteSubscription(userId: string, id: string) {
    const bag = subsByUser.get(userId)
    if (!bag) return false
    return bag.delete(id)
  },
  listSubscriptions(userId: string) {
    const bag = subsByUser.get(userId)
    if (!bag) return []
    return Array.from(bag.values())
  },
}
