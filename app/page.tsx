import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Home() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    take: 3
  })

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Eventify</h1>
          <p className="text-xl mb-8 opacity-90">Discover and book amazing events near you</p>
          <Link href="/events">
            <Button size="lg" variant="secondary">
              Browse Events
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events && events.length > 0 ? (
            events.map((event: any) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="hover:shadow-lg transition cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription>{event.date.toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">₹{event.price}</span>
                      <span className="text-sm text-muted-foreground">{event.capacity} spots</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No events available yet.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
