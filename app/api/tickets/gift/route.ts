import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ticketId, recipientEmail, message } = await request.json()

    // Get the ticket
    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, userId: session.user.id }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.status === "redeemed") {
      return NextResponse.json({ error: "Cannot gift a redeemed ticket" }, { status: 400 })
    }

    // Get recipient user
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail }
    })

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    // Check if gifting to self
    if (recipient.id === session.user.id) {
      return NextResponse.json({ error: "Cannot gift ticket to yourself" }, { status: 400 })
    }

    // Transfer ticket to recipient
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { userId: recipient.id }
    })

    return NextResponse.json({ success: true, message: "Ticket gifted successfully" })
  } catch (error) {
    console.error("Error in gift route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
