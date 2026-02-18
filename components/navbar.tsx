"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { data: session } = useSession()
  const user = session?.user

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
              {user.isAdmin && (
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
              <Button onClick={() => signOut()} variant="outline" size="sm">
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
