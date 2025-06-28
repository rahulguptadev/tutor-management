import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"

declare module "next-auth" {
  interface User {
    id: string
    role: string
  }

  interface Session {
    user: User & {
      id: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

// Hardcoded admin user
const HARDCODED_ADMIN = {
  email: "admin@example.com",
  password: "admin123",
  name: "Admin User",
  role: "ADMIN",
  id: "hardcoded-admin-id"
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check for hardcoded admin user first
        if (credentials.email === HARDCODED_ADMIN.email && credentials.password === HARDCODED_ADMIN.password) {
          return {
            id: HARDCODED_ADMIN.id,
            email: HARDCODED_ADMIN.email,
            name: HARDCODED_ADMIN.name,
            role: HARDCODED_ADMIN.role,
          }
        }

        // Fallback to database authentication
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role
      }

      return session
    },
    async jwt({ token, user }) {
      // Handle hardcoded admin user
      if (token.email === HARDCODED_ADMIN.email) {
        return {
          id: HARDCODED_ADMIN.id,
          name: HARDCODED_ADMIN.name,
          email: HARDCODED_ADMIN.email,
          role: HARDCODED_ADMIN.role,
        }
      }

      // Handle database users
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user?.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      }
    },
  },
} 