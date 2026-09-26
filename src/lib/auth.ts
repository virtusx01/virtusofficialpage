import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const admin1User = process.env.ADMIN_USERNAME || "admin_virtus";
        const admin1Pass = process.env.ADMIN_PASSWORD || "@Deathready0";

        const admin2User = process.env.ADMIN2_USERNAME || "admin_aoi";
        const admin2Pass = process.env.ADMIN2_PASSWORD || "@Aoicantik";

        if (
          (credentials?.username === admin1User && credentials?.password === admin1Pass) ||
          (credentials?.username === admin2User && credentials?.password === admin2Pass)
        ) {
          return { id: credentials?.username || "admin", name: credentials?.username || "Administrator", role: "admin" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const prodUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL;
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        const targetUrl = new URL(url);
        const baseHost = new URL(baseUrl).host;
        if (targetUrl.host === baseHost) {
          return url;
        }
        if (prodUrl) {
          const prodHost = new URL(prodUrl).host;
          if (targetUrl.host === prodHost) {
            return url;
          }
        }
      } catch {
        return baseUrl;
      }
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "virtus-official-mabarvip-secret-key-2026-supersecret",
};

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === "admin";
}
