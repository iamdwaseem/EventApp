"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function QRScannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [qrCode, setQrCode] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated" || !session?.user?.isAdmin) {
      router.push("/login")
    }
  }, [session, status, router])

  const handleScanQR = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsScanning(true)
    setScanResult(null)

    try {
      const response = await fetch("/api/tickets/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setScanResult({
          success: true,
          ticket: data.ticket,
          message: "Ticket verified and redeemed successfully!",
        })
        setQrCode("")
      } else {
        setScanResult({
          success: false,
          message: data.error || "Failed to verify ticket",
        })
      }
    } catch (error) {
      console.error("Error scanning QR:", error)
      setScanResult({
        success: false,
        message: "Error scanning QR code",
      })
    } finally {
      setIsScanning(false)
    }
  }

  if (status === "loading") return <div>Loading...</div>
  if (!session?.user?.isAdmin) return null

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">QR Code Scanner</h1>
        <Card>
          <CardHeader>
            <CardTitle>Scan Ticket QR Code</CardTitle>
            <CardDescription>Enter or scan a QR code to verify and redeem a ticket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleScanQR} className="space-y-4">
              <div>
                <Label htmlFor="qrCode">QR Code</Label>
                <Input
                  id="qrCode"
                  placeholder="Paste QR code here or scan"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isScanning}>
                {isScanning ? "Verifying..." : "Verify & Redeem"}
              </Button>
            </form>
            {scanResult && (
              <div
                className={`p-4 rounded-lg ${scanResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                  }`}
              >
                <p className={`font-semibold ${scanResult.success ? "text-green-800" : "text-red-800"}`}>
                  {scanResult.message}
                </p>
                {/* Simplified result display */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
