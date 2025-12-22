"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [redeemCode, setRedeemCode] = useState("")
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data: ticketsData, error } = await supabase
          .from("tickets")
          .select(
            `
          id,
          qr_code,
          status,
          purchased_at,
          events:event_id (
            id,
            title,
            date,
            location
          )
        `,
          )
          .eq("user_id", user.id)
          .order("purchased_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching tickets:", error)
        }

        setTickets(ticketsData || [])
      } catch (error) {
        console.error("[v0] Error in fetchTickets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [router])

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRedeeming(true)
    setRedeemMessage("")

    try {
      const response = await fetch("/api/tickets/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setRedeemMessage("Code redeemed successfully! Ticket added to your collection.")
        setRedeemCode("")
        // Refresh tickets
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: ticketsData } = await supabase
            .from("tickets")
            .select(
              `
            id,
            qr_code,
            status,
            purchased_at,
            events:event_id (
              id,
              title,
              date,
              location
            )
          `,
            )
            .eq("user_id", user.id)
            .order("purchased_at", { ascending: false })

          setTickets(ticketsData || [])
        }
      } else {
        setRedeemMessage(data.error || "Failed to redeem code")
      }
    } catch (error) {
      console.error("[v0] Error redeeming code:", error)
      setRedeemMessage("Error redeeming code")
    } finally {
      setIsRedeeming(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading your tickets...</div>
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Redeem a Code</CardTitle>
            <CardDescription>Enter a redeem code to get a free ticket</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRedeemCode} className="space-y-4">
              <div>
                <Label htmlFor="redeemCode">Redeem Code</Label>
                <Input
                  id="redeemCode"
                  placeholder="Enter redeem code"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isRedeeming}>
                {isRedeeming ? "Redeeming..." : "Redeem Code"}
              </Button>
              {redeemMessage && (
                <p
                  className={`text-sm ${redeemMessage.includes("successfully") ? "text-green-600" : "text-destructive"}`}
                >
                  {redeemMessage}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {!tickets || tickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't booked any tickets yet.</p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <CardTitle>{ticket.events?.title}</CardTitle>
                  <CardDescription>{new Date(ticket.events?.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Ticket ID</p>
                      <p className="font-mono text-sm">{ticket.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">QR Code</p>
                      <p className="font-mono text-sm">{ticket.qr_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-semibold capitalize">{ticket.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{ticket.events?.location}</p>
                    </div>
                  </div>
                  <Link href={`/ticket/${ticket.id}`} className="w-full">
                    <Button variant="outline" className="w-full bg-transparent">
                      View & Gift Ticket
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
