import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.fullName,
                    isAdmin: user.isAdmin,
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
                session.user.isAdmin = token.isAdmin as boolean
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.isAdmin = user.isAdmin
            }
            return token
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login", // Assuming a login page exists or will be created
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
