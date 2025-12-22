"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabase = createClient()

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data: eventsData, error } = await supabase.from("events").select("*").order("date", { ascending: true })

        if (error) {
          console.error("[v0] Error fetching events:", error)
        }

        setEvents(eventsData || [])
      } catch (error) {
        console.error("[v0] Error in fetchEvents:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [router])

  if (isLoading) {
    return <div className="text-center py-12">Loading events...</div>
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">All Events</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events && events.length > 0 ? (
            events.map((event: any) => (
              <Card key={event.id} className="hover:shadow-lg transition flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Capacity:</span> {event.capacity} spots
                    </p>
                    <p className="text-lg font-bold text-primary">${event.price}</p>
                  </div>
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No events available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
