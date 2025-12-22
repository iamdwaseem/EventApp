export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
  price: number
  image: string
  createdBy: string
  createdAt: string
}

export interface Ticket {
  id: string
  eventId: string
  userId: string
  qrCode: string
  redeemed: boolean
  redeemedAt?: string
  purchasedAt: string
}

export interface RedeemCode {
  id: string
  code: string
  eventId: string
  ticketId: string
  redeemed: boolean
  redeemedAt?: string
  createdAt: string
}

export interface Payment {
  id: string
  ticketId: string
  userId: string
  eventId: string
  amount: number
  status: "pending" | "completed" | "failed"
  paymentMethod: string
  createdAt: string
}
