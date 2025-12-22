"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "./types"
import { getCurrentUser, setCurrentUser, getUsers } from "./storage"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const users = getUsers()
    const foundUser = users.find((u) => u.email === email)

    if (!foundUser) {
      throw new Error("User not found")
    }

    // Mock password validation (in real app, this would be hashed)
    if (password !== "password") {
      throw new Error("Invalid password")
    }

    setCurrentUser(foundUser)
    setUser(foundUser)
  }

  const logout = () => {
    setCurrentUser(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
