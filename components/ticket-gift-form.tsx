"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TicketGiftForm({ ticketId }: { ticketId: string }) {
    const [giftEmail, setGiftEmail] = useState("")
    const [isGifting, setIsGifting] = useState(false)
    const [giftMessage, setGiftMessage] = useState("")

    const handleGiftTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsGifting(true)

        try {
            const response = await fetch("/api/tickets/gift", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketId: ticketId,
                    recipientEmail: giftEmail,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setGiftMessage("Ticket gifted successfully!")
                setGiftEmail("")
                setTimeout(() => setGiftMessage(""), 3000)
                // Ideally prompt refresh or redirect, but for now message is enough
            } else {
                setGiftMessage(data.error || "Failed to gift ticket")
            }
        } catch (error) {
            console.error("Error gifting ticket:", error)
            setGiftMessage("Error gifting ticket")
        } finally {
            setIsGifting(false)
        }
    }

    return (
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
                    {giftMessage && (
                        <p className={`text-sm text-center ${giftMessage.includes("successfully") ? "text-green-600" : "text-destructive"}`}>
                            {giftMessage}
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
