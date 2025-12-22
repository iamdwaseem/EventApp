import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { qrCode } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Only admins can verify tickets" }, { status: 403 })
    }

    // Find the ticket by QR code
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select(
        `
        id,
        qr_code,
        status,
        user_id,
        event_id,
        events:event_id (id, title),
        profiles:user_id (email)
      `,
      )
      .eq("qr_code", qrCode)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.status === "redeemed") {
      return NextResponse.json({ error: "This ticket has already been redeemed" }, { status: 400 })
    }

    // Mark ticket as redeemed
    const { error: updateError } = await supabase.from("tickets").update({ status: "redeemed" }).eq("id", ticket.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to redeem ticket" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        events: ticket.events,
        user_email: ticket.profiles?.email,
      },
    })
  } catch (error) {
    console.error("[v0] Error in verify-qr route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
