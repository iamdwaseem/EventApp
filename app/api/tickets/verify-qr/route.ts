import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find ticket directly by searching content of QR code?
    // The QR code contains the ticket ID (based on my capture-order logic).
    // But the stored qrCode field in DB contains the Base64 IMAGE string!
    // Wait. In `verify-qr`, the input `qrCode` from scanner is usually the CONTENT of the QR code.
    // If I generated QR from `ticket.id`, then the scanner reads `ticket.id`.
    // But I stored `qrCode: Base64Image` in the DB.
    // So I cannot query `where: { qrCode: scannedValue }` because DB has image, scanned has ID.

    // CORRECTION: The schema says `qrCode String`. It stores the Base64 string of the image? 
    // The user said: "Generate QR from ticket.id and store as base64 string."
    // Usually one stores the DATA (ticket.id) and generating image on fly, OR stores image.
    // If I store image, I can't easily search by "image content".
    // I should probably query by ID (which is the content of the QR).
    // So: Scanner reads `ticket.id`.
    // I query `prisma.ticket.findUnique({ where: { id: scannedValue } })`.
    // The `qrCode` field in DB is just for displaying the image to the user.

    // Let's assume input `qrCode` is actually the `ticketId` scanned.
    const ticketId = qrCode;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: { select: { title: true } },
        user: { select: { email: true } }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    if (ticket.status === "redeemed") {
      return NextResponse.json({ error: "This ticket has already been redeemed" }, { status: 400 })
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "redeemed" }
    })

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        events: ticket.event, // legacy structure matching frontend
        user_email: ticket.user.email,
      },
    })
  } catch (error) {
    console.error("Error in verify-qr route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
