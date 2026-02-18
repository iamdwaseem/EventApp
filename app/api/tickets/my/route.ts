import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const tickets = await prisma.ticket.findMany({
            where: { userId: session.user.id },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        date: true,
                        location: true
                    }
                }
            },
            orderBy: { purchasedAt: "desc" }
        })

        // Map to structure expected by frontend (snake_case if needed or update frontend)
        // The previous frontend used snake_case from Supabase.
        // I should probably update the FRONTEND to use camelCase to match Prisma (or map here).
        // Let's map here for minimal frontend changes in `my-tickets/page.tsx` initially,
        // BUT I am rewriting `my-tickets/page.tsx` anyway.
        // So I will update `my-tickets/page.tsx` to use camelCase and use this API.

        return NextResponse.json(tickets)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
    }
}
