import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasSupabaseConfig) {
    return (
      <main className="min-h-screen">
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

        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-2">Configuration Required</h2>
            <p className="text-yellow-800 mb-4">
              To use Eventify, you need to set up your Supabase environment variables:
            </p>
            <ul className="list-disc list-inside text-yellow-800 space-y-2">
              <li>
                <code className="bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase
                project URL
              </li>
              <li>
                <code className="bg-yellow-100 px-2 py-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase
                anon key
              </li>
            </ul>
            <p className="text-yellow-800 mt-4">
              You can find these values in your Supabase project settings at{" "}
              <a href="https://supabase.com/dashboard" className="underline font-bold">
                supabase.com/dashboard
              </a>
            </p>
          </div>
        </section>
      </main>
    )
  }

  try {
    const supabase = await createClient()

    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .limit(3)

    if (error) {
      console.error("[v0] Error fetching events:", error)
      // Show hero section without featured events if there's an error
      return (
        <main className="min-h-screen">
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
        </main>
      )
    }

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
                      <CardDescription>{new Date(event.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">${event.price}</span>
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
  } catch (error) {
    console.error("[v0] Error loading home page:", error)
    return (
      <main className="min-h-screen">
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
      </main>
    )
  }
}
