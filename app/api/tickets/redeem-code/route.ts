import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { code } = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the redeem code
    const { data: redeemCode, error: codeError } = await supabase
      .from("redeem_codes")
      .select("*")
      .eq("code", code)
      .single()

    if (codeError || !redeemCode) {
      return NextResponse.json({ error: "Invalid redeem code" }, { status: 404 })
    }

    if (redeemCode.is_used) {
      return NextResponse.json({ error: "This code has already been used" }, { status: 400 })
    }

    // Create a new ticket for the user
    const qrCode = crypto.randomBytes(16).toString("hex")
    const { error: ticketError } = await supabase.from("tickets").insert({
      user_id: user.id,
      event_id: redeemCode.event_id,
      qr_code: qrCode,
      status: "active",
    })

    if (ticketError) {
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
    }

    // Mark redeem code as used
    const { error: updateError } = await supabase.from("redeem_codes").update({ is_used: true }).eq("id", redeemCode.id)

    if (updateError) {
      console.error("[v0] Error marking code as used:", updateError)
    }

    return NextResponse.json({ success: true, message: "Code redeemed successfully" })
  } catch (error) {
    console.error("[v0] Error in redeem-code route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
