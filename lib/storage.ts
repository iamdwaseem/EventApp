import type { User, Event, Ticket, RedeemCode, Payment } from "./types"
import { mockUsers, mockEvents, mockTickets, mockRedeemCodes, mockPayments } from "./mock-data"

const STORAGE_KEYS = {
  USERS: "eventify_users",
  EVENTS: "eventify_events",
  TICKETS: "eventify_tickets",
  REDEEM_CODES: "eventify_redeem_codes",
  PAYMENTS: "eventify_payments",
  CURRENT_USER: "eventify_current_user",
}

// Initialize storage with mock data if empty
export function initializeStorage() {
  if (typeof window === "undefined") return

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers))
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEvents))
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(mockTickets))
  }
  if (!localStorage.getItem(STORAGE_KEYS.REDEEM_CODES)) {
    localStorage.setItem(STORAGE_KEYS.REDEEM_CODES, JSON.stringify(mockRedeemCodes))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(mockPayments))
  }
}

// User operations
export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export function saveUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

// Event operations
export function getEvents(): Event[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS)
  return data ? JSON.parse(data) : []
}

export function saveEvents(events: Event[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
}

export function getEventById(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id)
}

// Ticket operations
export function getTickets(): Ticket[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.TICKETS)
  return data ? JSON.parse(data) : []
}

export function saveTickets(tickets: Ticket[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets))
}

export function getUserTickets(userId: string): Ticket[] {
  return getTickets().filter((t) => t.userId === userId)
}

// Redeem code operations
export function getRedeemCodes(): RedeemCode[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.REDEEM_CODES)
  return data ? JSON.parse(data) : []
}

export function saveRedeemCodes(codes: RedeemCode[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.REDEEM_CODES, JSON.stringify(codes))
}

// Payment operations
export function getPayments(): Payment[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS)
  return data ? JSON.parse(data) : []
}

export function savePayments(payments: Payment[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments))
}
