"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@supabase/supabase-js"

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [redeemCodes, setRedeemCodes] = useState<any[]>([])
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
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

        if (!profile?.is_admin) {
          router.push("/")
          return
        }

        setUser(user)
        setIsAdmin(true)

        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true })

        if (eventsError) console.error("[v0] Error fetching events:", eventsError)

        const { data: ticketsData, error: ticketsError } = await supabase.from("tickets").select(`
          id,
          qr_code,
          status,
          user_id,
          event_id,
          events:event_id (title)
        `)

        if (ticketsError) console.error("[v0] Error fetching tickets:", ticketsError)

        const { data: redeemCodesData, error: redeemError } = await supabase.from("redeem_codes").select(`
          id,
          code,
          is_used,
          event_id,
          events:event_id (title)
        `)

        if (redeemError) console.error("[v0] Error fetching redeem codes:", redeemError)

        setEvents(eventsData || [])
        setTickets(ticketsData || [])
        setRedeemCodes(redeemCodesData || [])
      } catch (error) {
        console.error("[v0] Error in admin check:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const supabase = createClient()
    const { data, error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      location: newEvent.location,
      capacity: newEvent.capacity,
      price: newEvent.price,
      created_by: user.id,
    })

    if (error) {
      console.error("[v0] Error creating event:", error)
      return
    }

    setEvents([...events, data?.[0]])
    setNewEvent({
      title: "",
      description: "",
      date: "",
      location: "",
      capacity: 100,
      price: 50,
    })
  }

  const handleDeleteEvent = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting event:", error)
      return
    }

    setEvents(events.filter((e) => e.id !== id))
  }

  const handleCreateRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const supabase = createClient()
    const { data, error } = await supabase.from("redeem_codes").insert({
      code: newRedeemCode.code,
      event_id: newRedeemCode.eventId,
      created_by: user.id,
    })

    if (error) {
      console.error("[v0] Error creating redeem code:", error)
      return
    }

    setRedeemCodes([...redeemCodes, data?.[0]])
    setNewRedeemCode({
      code: "",
      eventId: "",
    })
  }

  const handleRedeemTicket = async (ticketId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("tickets").update({ status: "redeemed" }).eq("id", ticketId)

    if (error) {
      console.error("[v0] Error redeeming ticket:", error)
      return
    }

    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status: "redeemed" } : t)))
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>
  }

  if (!isAdmin) {
    return null
  }

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

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        placeholder="Event Title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="Location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="datetime-local"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Capacity"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: Number.parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="Price"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: Number.parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      placeholder="Event Description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Event
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">All Events</h2>
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      <p className="font-semibold">
                        ${event.price} - {event.capacity} spots
                      </p>
                    </div>
                    <Button variant="destructive" onClick={() => handleDeleteEvent(event.id)}>
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>All Tickets</CardTitle>
                <CardDescription>Total: {tickets.length} tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 border rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{ticket.events?.title}</p>
                        <p className="font-mono text-sm text-muted-foreground">{ticket.qr_code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold capitalize ${
                            ticket.status === "redeemed" ? "text-destructive" : "text-green-600"
                          }`}
                        >
                          {ticket.status}
                        </span>
                        {ticket.status !== "redeemed" && (
                          <Button size="sm" onClick={() => handleRedeemTicket(ticket.id)}>
                            Redeem
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem">
            <Card>
              <CardHeader>
                <CardTitle>Create Redeem Code</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRedeemCode} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      placeholder="REDEEM-CODE-123"
                      value={newRedeemCode.code}
                      onChange={(e) => setNewRedeemCode({ ...newRedeemCode, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventId">Event</Label>
                    <select
                      id="eventId"
                      value={newRedeemCode.eventId}
                      onChange={(e) => setNewRedeemCode({ ...newRedeemCode, eventId: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Create Code
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Redeem Codes</CardTitle>
                <CardDescription>Total: {redeemCodes.length} codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {redeemCodes.map((code) => (
                    <div key={code.id} className="p-3 border rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{code.events?.title}</p>
                        <p className="font-mono text-sm font-semibold">{code.code}</p>
                      </div>
                      <span className={`text-sm font-semibold ${code.is_used ? "text-destructive" : "text-green-600"}`}>
                        {code.is_used ? "Used" : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
