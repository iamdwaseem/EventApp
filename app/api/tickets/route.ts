import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                event: { select: { title: true } },
                user: { select: { email: true } }
            },
            orderBy: { purchasedAt: "desc" }
        })

        // Transform to match admin page expectation
        const formattedTickets = tickets.map(t => ({
            id: t.id,
            qr_code: t.qrCode, // Frontend expects underscore based on Supabase schema
            status: t.status,
            user_id: t.userId,
            event_id: t.eventId,
            events: t.event,
            // profiles: t.user // if needed
        }))

        return NextResponse.json(formattedTickets)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }
}
