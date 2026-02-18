import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    try {
        const events = await prisma.event.findMany({
            orderBy: { date: "asc" },
            include: {
                _count: { select: { tickets: true } }
            }
        })
        return NextResponse.json(events)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const event = await prisma.event.create({
            data: {
                ...body,
                date: new Date(body.date),
                price: parseFloat(body.price),
                capacity: parseInt(body.capacity),
                createdBy: session.user.id
            }
        })
        return NextResponse.json(event)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    try {
        await prisma.event.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
    }
}
