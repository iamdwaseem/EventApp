import type { User, Event, Ticket, RedeemCode, Payment } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "user@example.com",
    name: "John Doe",
    role: "user",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
]

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2025",
    description: "Join us for the biggest tech conference of the year featuring keynotes from industry leaders.",
    date: "2025-03-15",
    time: "09:00",
    location: "San Francisco Convention Center",
    capacity: 500,
    price: 99,
    image: "/tech-conference.png",
    createdBy: "2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Web Development Workshop",
    description: "Learn modern web development with React, Next.js, and Tailwind CSS.",
    date: "2025-02-20",
    time: "14:00",
    location: "New York Tech Hub",
    capacity: 100,
    price: 49,
    image: "/web-development-workshop.png",
    createdBy: "2",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "AI & Machine Learning Summit",
    description: "Explore the latest advancements in AI and machine learning with expert speakers.",
    date: "2025-04-10",
    time: "10:00",
    location: "Boston Innovation Center",
    capacity: 300,
    price: 129,
    image: "/ai-machine-learning-summit.jpg",
    createdBy: "2",
    createdAt: new Date().toISOString(),
  },
]

export const mockTickets: Ticket[] = [
  {
    id: "1",
    eventId: "1",
    userId: "1",
    qrCode: "TICKET-001-QR",
    redeemed: false,
    purchasedAt: new Date().toISOString(),
  },
]

export const mockRedeemCodes: RedeemCode[] = [
  {
    id: "1",
    code: "REDEEM-001",
    eventId: "1",
    ticketId: "1",
    redeemed: false,
    createdAt: new Date().toISOString(),
  },
]

export const mockPayments: Payment[] = [
  {
    id: "1",
    ticketId: "1",
    userId: "1",
    eventId: "1",
    amount: 99,
    status: "completed",
    paymentMethod: "paypal",
    createdAt: new Date().toISOString(),
  },
]
