import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const redeemCode = await prisma.redeemCode.findUnique({
      where: { code },
    })

    if (!redeemCode) {
      return NextResponse.json({ error: "Invalid redeem code" }, { status: 404 })
    }

    if (redeemCode.isUsed) {
      return NextResponse.json({ error: "This code has already been used" }, { status: 400 })
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        userId: session.user.id,
        eventId: redeemCode.eventId,
        qrCode: "PENDING",
        status: "active"
      }
    })

    // Create QR
    const qrData = await QRCode.toDataURL(ticket.id)

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { qrCode: qrData }
    })

    // Mark code as used
    await prisma.redeemCode.update({
      where: { id: redeemCode.id },
      data: { isUsed: true }
    })

    return NextResponse.json({ success: true, message: "Code redeemed successfully" })
  } catch (error) {
    console.error("Error in redeem-code route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
