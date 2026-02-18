import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import QRCode from "qrcode"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { eventId } = await req.json()

        if (!eventId) {
            return NextResponse.json({ error: "Event ID required" }, { status: 400 })
        }

        // Create the ticket
        const ticket = await prisma.ticket.create({
            data: {
                eventId,
                userId: session.user.id,
                qrCode: "", // Placeholder
                status: "active"
            }
        })

        // Generate QR Code for the ticket (Ticket Verification)
        const qr = await QRCode.toDataURL(ticket.id)

        // Update ticket with QR
        await prisma.ticket.update({
            where: { id: ticket.id },
            data: { qrCode: qr }
        })

        return NextResponse.json({ success: true, ticketId: ticket.id })
    } catch (error) {
        console.error("Ticket Purchase Error:", error)
        return NextResponse.json({ error: "Failed to purchase ticket" }, { status: 500 })
    }
}
