"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [events, setEvents] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [redeemCodes, setRedeemCodes] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    capacity: 100,
    price: 50,
  })
  const [newRedeemCode, setNewRedeemCode] = useState({
    code: "",
    eventId: "",
  })

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || !session?.user?.isAdmin) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [eventsRes, ticketsRes, codesRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/tickets"),
          fetch("/api/redeem-codes")
        ])

        if (eventsRes.ok) setEvents(await eventsRes.json())
        if (ticketsRes.ok) setTickets(await ticketsRes.json())
        if (codesRes.ok) setRedeemCodes(await codesRes.json())
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [session, status, router])

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })

      const data = await res.json()
      if (res.ok) {
        setEvents([...events, data])
        setNewEvent({
          title: "", description: "", date: "", location: "", capacity: 100, price: 50
        })
      }
    } catch (error) {
      console.error("Error creating event", error)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      await fetch(`/api/events?id=${id}`, { method: "DELETE" })
      setEvents(events.filter(e => e.id !== id))
    } catch (error) {
      console.error("Error deleting event", error)
    }
  }

  const handleCreateRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/redeem-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRedeemCode),
      })
      const data = await res.json()
      if (res.ok) {
        setRedeemCodes([...redeemCodes, data])
        setNewRedeemCode({ code: "", eventId: "" })
      }
    } catch (error) {
      console.error("Error creating redeem code", error)
    }
  }

  const handleRedeemTicket = async (ticketId: string) => {
    // Implement manual redeem logic if needed, usually done via QR
    // For now, let's say we have an API
  }

  if (status === "loading" || isLoadingData) {
    return <div className="text-center py-12">Loading admin dashboard...</div>
  }

  if (!session?.user?.isAdmin) return null

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">Generate Events</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="redeem">Create Redeem</TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Create New Event</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input id="title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                    </div>
                    {/* ... other inputs simplified for brevity ... */}
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input id="capacity" type="number" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) })} required />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" type="number" value={newEvent.price} onChange={e => setNewEvent({ ...newEvent, price: parseFloat(e.target.value) })} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea id="description" className="w-full p-2 border rounded-md" rows={4} value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
                  </div>
                  <Button type="submit">Create Event</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">All Events</h2>
              {events.map(event => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <p className="font-semibold">₹{event.price} - {event.capacity} spots</p>
                    </div>
                    <Button variant="destructive" onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tickets Tab (Read-only mostly) */}
          <TabsContent value="tickets">
            {/* Render tickets list */}
            <Card>
              <CardHeader><CardTitle>All Tickets</CardTitle><CardDescription>Total: {tickets.length}</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="p-3 border rounded-md flex justify-between">
                      <div>
                        <p className="font-semibold">{ticket.event?.title}</p>
                        <p className="font-mono text-sm text-muted-foreground">{ticket.id}</p>
                      </div>
                      <span>{ticket.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redeem Codes Tab */}
          <TabsContent value="redeem">
            <Card>
              <CardHeader><CardTitle>Create Redeem Code</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRedeemCode} className="space-y-4">
                  <div>
                    <Label>Code</Label>
                    <Input value={newRedeemCode.code} onChange={e => setNewRedeemCode({ ...newRedeemCode, code: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Event</Label>
                    <select className="w-full p-2 border rounded-md" value={newRedeemCode.eventId} onChange={e => setNewRedeemCode({ ...newRedeemCode, eventId: e.target.value })} required>
                      <option value="">Select Event</option>
                      {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                  </div>
                  <Button type="submit">Create Code</Button>
                </form>
              </CardContent>
            </Card>
            {/* List redeem codes */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
