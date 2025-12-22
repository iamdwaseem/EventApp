import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const PAYPAL_API_BASE = "https://api.sandbox.paypal.com"
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_SECRET = process.env.PAYPAL_SECRET

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64")

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await response.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/events", request.url))
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const accessToken = await getAccessToken()

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${token}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const order = await response.json()

    if (!response.ok) {
      console.error("[v0] PayPal capture failed:", order)
      return NextResponse.redirect(new URL("/events", request.url))
    }

    // Extract event ID from custom_id
    const eventId = order.purchase_units[0].custom_id

    // Create ticket in database
    const qrCode = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const { error: ticketError } = await supabase.from("tickets").insert({
      event_id: eventId,
      user_id: user.id,
      qr_code: qrCode,
      status: "active",
    })

    if (ticketError) {
      console.error("[v0] Error creating ticket:", ticketError)
      return NextResponse.redirect(new URL("/events", request.url))
    }

    return NextResponse.redirect(new URL("/my-tickets", request.url))
  } catch (error) {
    console.error("[v0] PayPal capture order error:", error)
    return NextResponse.redirect(new URL("/events", request.url))
  }
}
