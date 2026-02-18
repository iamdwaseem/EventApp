"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { QRCodeCanvas } from "qrcode.react"

interface ManualUPICheckoutProps {
    event: {
        id: string
        title: string
        price: number
    }
}

export function ManualUPICheckout({ event }: ManualUPICheckoutProps) {
    const [loading, setLoading] = useState(false)
    const [showQR, setShowQR] = useState(false)
    const router = useRouter()

    // UPI URL
    // Replace 'merchant@upi' with real VPA or env var
    const vpa = process.env.NEXT_PUBLIC_UPI_VPA || "merchant@upi"
    const upiUrl = `upi://pay?pa=${vpa}&pn=Eventify&am=${event.price}&cu=INR&tn=${encodeURIComponent(event.title)}`

    const handleConfirmPayment = async () => {
        setLoading(true)

        try {
            const res = await fetch("/api/tickets/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId: event.id })
            })

            if (!res.ok) {
                throw new Error("Failed to purchase ticket")
            }

            router.push("/my-tickets")
        } catch (error) {
            console.error("Purchase error:", error)
            alert("Failed to process ticket. Please try again.")
            setLoading(false)
        }
    }

    if (showQR) {
        return (
            <div className="space-y-6 text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm border inline-block">
                    <QRCodeCanvas value={upiUrl} size={200} />
                    <p className="mt-4 text-sm text-gray-500 font-mono break-all">{vpa}</p>
                </div>

                <div className="space-y-2">
                    <p className="font-semibold">Scan with any UPI App</p>
                    <p className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm, etc.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={handleConfirmPayment}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                        {loading ? "Verifying..." : "I have made the payment"}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => setShowQR(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Button
            onClick={() => setShowQR(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
            Buy Ticket (₹{event.price})
        </Button>
    )
}
