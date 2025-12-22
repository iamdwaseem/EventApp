"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const hasSupabaseConfig =
    typeof window !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setIsLoading(false)
      return
    }

    const checkUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        setUser(user || null)

        if (user) {
          const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

          setIsAdmin(profile?.is_admin || false)
        }
      } catch (error) {
        console.error("[v0] Error checking user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [hasSupabaseConfig])

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    router.push("/")
  }, [router])

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Eventify
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/events" className="text-foreground hover:text-primary transition">
            Events
          </Link>

          {user && (
            <>
              <Link href="/my-tickets" className="text-foreground hover:text-primary transition">
                My Tickets
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-foreground hover:text-primary transition">
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
