"use client"

import { useEffect, useRef } from "react"
import { loadPayPalScript, PAYPAL_CLIENT_ID } from "@/lib/paypal/client"

interface PayPalButtonProps {
  eventId: string
  eventTitle: string
  price: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PayPalButton({ eventId, eventTitle, price, onSuccess, onError }: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) {
      onError?.("PayPal is not configured")
      return
    }

    const initializePayPal = async () => {
      try {
        await loadPayPalScript()

        if (isInitialized.current || !containerRef.current) return
        isInitialized.current = true
        ;(window as any).paypal
          .Buttons({
            createOrder: async () => {
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eventId, eventTitle, price }),
              })

              const data = await response.json()

              if (!response.ok) {
                throw new Error(data.error || "Failed to create order")
              }

              return data.orderId
            },
            onApprove: async (data: any) => {
              window.location.href = `/api/paypal/capture-order?token=${data.orderID}`
            },
            onError: (err: any) => {
              console.error("[v0] PayPal error:", err)
              onError?.(err.message || "Payment failed")
            },
          })
          .render(containerRef.current)
      } catch (error) {
        console.error("[v0] PayPal initialization error:", error)
        onError?.(error instanceof Error ? error.message : "Failed to initialize PayPal")
      }
    }

    initializePayPal()
  }, [eventId, eventTitle, price, onError])

  return <div ref={containerRef} className="w-full" />
}
