import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

// Hardcoded admin user
const HARDCODED_ADMIN = {
  email: "admin@example.com",
  password: "admin123",
  name: "Admin User",
  role: "ADMIN",
  id: "hardcoded-admin-id"
}

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Check for hardcoded admin user first
        if (credentials.email === HARDCODED_ADMIN.email && credentials.password === HARDCODED_ADMIN.password) {
          return {
            id: HARDCODED_ADMIN.id,
            name: HARDCODED_ADMIN.name,
            email: HARDCODED_ADMIN.email,
            role: HARDCODED_ADMIN.role,
          };
        }
        
        // Fallback to database authentication
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      // Handle hardcoded admin user
      if (token.email === HARDCODED_ADMIN.email) {
        return {
          id: HARDCODED_ADMIN.id,
          name: HARDCODED_ADMIN.name,
          email: HARDCODED_ADMIN.email,
          role: HARDCODED_ADMIN.role,
        };
      }
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}); 