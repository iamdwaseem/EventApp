import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { ticketId, recipientEmail, message } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .eq("user_id", user.id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.status === "redeemed") {
      return NextResponse.json({ error: "Cannot gift a redeemed ticket" }, { status: 400 })
    }

    // Get recipient user
    const { data: recipientData, error: recipientError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", recipientEmail)
      .single()

    if (recipientError || !recipientData) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    // Transfer ticket to recipient
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ user_id: recipientData.id })
      .eq("id", ticketId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to gift ticket" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Ticket gifted successfully" })
  } catch (error) {
    console.error("[v0] Error in gift route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
