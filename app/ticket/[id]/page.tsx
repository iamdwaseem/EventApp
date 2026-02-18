import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { TicketGiftForm } from "@/components/ticket-gift-form"

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      event: true
    }
  })

  if (!ticket) {
    return <div className="text-center py-12">Ticket not found</div>
  }

  // Security check: only show if user owns ticket (or is admin?)
  // Assuming strict ownership for now
  if (ticket.userId !== session.user.id && !session.user.isAdmin) {
    return <div className="text-center py-12">Unauthorized</div>
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{ticket.event.title}</CardTitle>
            <CardDescription>{ticket.event.date.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                {/* 
                  QR Code Display
                  If qrCode is a data URL (image), show it.
                  If it's just a string ID, we might need a client component to render it as QR?
                  But the backend refs say we store base64 image now (from new capture-order logic).
                  So <img> tag should work for base64.
                */}
                {ticket.qrCode && ticket.qrCode.startsWith("data:image") ? (
                  <img src={ticket.qrCode} alt="Ticket QR" className="w-64 h-64" />
                ) : (
                  // Fallback if it's text (legacy or error)
                  <div className="w-64 h-64 flex items-center justify-center border">
                    <p className="text-xs break-all">{ticket.qrCode}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Ticket ID</p>
                <p className="font-mono text-sm font-semibold">{ticket.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p
                  className={`font-semibold capitalize ${ticket.status === "redeemed" ? "text-destructive" : "text-green-600"
                    }`}
                >
                  {ticket.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {ticket.status !== "redeemed" && (
          <TicketGiftForm ticketId={ticket.id} />
        )}
      </div>
    </div>
  )
}
