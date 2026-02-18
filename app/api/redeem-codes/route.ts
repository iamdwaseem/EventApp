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
        const codes = await prisma.redeemCode.findMany({
            include: { event: { select: { title: true } } }
        })
        return NextResponse.json(codes)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch codes" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const code = await prisma.redeemCode.create({
            data: {
                code: body.code,
                eventId: body.eventId,
                createdBy: session.user.id
            },
            include: { event: { select: { title: true } } }
        })
        return NextResponse.json(code)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create code" }, { status: 500 })
    }
}
