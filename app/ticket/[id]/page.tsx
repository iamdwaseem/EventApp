"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import QRCode from "qrcode.react"

export default function TicketPage() {
  const params = useParams()
  const [ticket, setTicket] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [giftEmail, setGiftEmail] = useState("")
  const [isGifting, setIsGifting] = useState(false)
  const [giftMessage, setGiftMessage] = useState("")

  useEffect(() => {
    const fetchTicket = async () => {
      const supabase = createClient()

      const { data: ticketData } = await supabase
        .from("tickets")
        .select(
          `
          id,
          qr_code,
          status,
          events:event_id (
            id,
            title,
            date,
            location
          )
        `,
        )
        .eq("id", params.id)
        .single()

      if (ticketData) {
        setTicket(ticketData)
        setEvent(ticketData.events)
      }

      setIsLoading(false)
    }

    fetchTicket()
  }, [params.id])

  const handleGiftTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGifting(true)

    try {
      const response = await fetch("/api/tickets/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          recipientEmail: giftEmail,
          message: giftMessage,
        }),
      })

      if (response.ok) {
        setGiftMessage("Ticket gifted successfully!")
        setGiftEmail("")
        setGiftMessage("")
        setTimeout(() => setGiftMessage(""), 3000)
      } else {
        setGiftMessage("Failed to gift ticket")
      }
    } catch (error) {
      console.error("[v0] Error gifting ticket:", error)
      setGiftMessage("Error gifting ticket")
    } finally {
      setIsGifting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!ticket || !event) {
    return <div className="text-center py-12">Ticket not found</div>
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={ticket.qr_code} size={256} />
              </div>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Ticket ID</p>
                <p className="font-mono text-sm font-semibold">{ticket.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">QR Code</p>
                <p className="font-mono text-sm font-semibold">{ticket.qr_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p
                  className={`font-semibold capitalize ${
                    ticket.status === "redeemed" ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {ticket.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {ticket.status !== "redeemed" && (
          <Card>
            <CardHeader>
              <CardTitle>Gift This Ticket</CardTitle>
              <CardDescription>Share this ticket with someone else</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGiftTicket} className="space-y-4">
                <div>
                  <Label htmlFor="giftEmail">Recipient Email</Label>
                  <Input
                    id="giftEmail"
                    type="email"
                    placeholder="recipient@example.com"
                    value={giftEmail}
                    onChange={(e) => setGiftEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isGifting}>
                  {isGifting ? "Gifting..." : "Gift Ticket"}
                </Button>
                {giftMessage && <p className="text-sm text-center text-green-600">{giftMessage}</p>}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
