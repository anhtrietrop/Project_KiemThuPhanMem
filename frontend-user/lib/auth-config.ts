import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";

// AuthOptions configuration for NextAuth
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
          });
          if (user) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password!
            );
            if (isPasswordCorrect) {
              return {
                id: user.id,
                email: user.email,
                role: user.role,
              } as User;
            }
          }
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : String(err));
        }
        return null;
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ account }: { account: any }) {
      // Only allow credentials login
      if (account?.provider === "credentials") {
        return true;
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.iat = Math.floor(Date.now() / 1000); // Issued at time
      }

      // Check if token is expired (15 minutes)
      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - (token.iat || now);
      const maxAge = 15 * 60; // 15 minutes

      if (tokenAge > maxAge) {
        // Token expired, return empty object to force re-authentication
        return {};
      }

      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on auth errors
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes in seconds
    updateAge: 5 * 60, // Update session every 5 minutes
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes in seconds
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
