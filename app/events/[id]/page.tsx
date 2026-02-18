import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ManualUPICheckout } from "@/components/manual-upi-checkout"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const event = await prisma.event.findUnique({
    where: { id }
  })

  if (!event) {
    return <div className="text-center py-12">Event not found</div>
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/events">
          <Button variant="outline" className="mb-6 bg-transparent">
            Back
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{event.title}</CardTitle>
            <CardDescription>{event.date.toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{event.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="font-semibold">{event.capacity} spots available</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold text-primary text-lg">₹{event.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{event.date.toLocaleDateString()}</p>
              </div>
            </div>

            <ManualUPICheckout event={event} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
