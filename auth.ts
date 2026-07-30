import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { query } from "@/lib/db";
import { consumeRateLimit, resetRateLimit } from "@/lib/rateLimit";

const AUTH_IP_WINDOW_MS = 10 * 60 * 1000;
const AUTH_USER_WINDOW_MS = 10 * 60 * 1000;
const AUTH_IP_LIMIT = 30;
const AUTH_USER_LIMIT = 8;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email", placeholder: "test@example.com" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for")?.split(",")[0]?.trim();
        const ip = forwardedFor || headersList.get("x-real-ip") || "unknown";
        const email = (credentials.email as string).trim().toLowerCase();

        const ipLimit = consumeRateLimit(`auth:ip:${ip}`, AUTH_IP_LIMIT, AUTH_IP_WINDOW_MS);
        const userLimit = consumeRateLimit(`auth:user:${ip}:${email}`, AUTH_USER_LIMIT, AUTH_USER_WINDOW_MS);

        if (!ipLimit.allowed || !userLimit.allowed) {
          return null;
        }

        try {
          const result = await query('SELECT user_id, email, username, password FROM users WHERE email = $1', [email]);
          const user = result.rows[0];

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isPasswordValid) {
            return null;
          }

          resetRateLimit(`auth:user:${ip}:${email}`);

          return {
            id: user.user_id.toString(),
            email: user.email,
            name: user.username,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
});
