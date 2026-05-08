import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

export function requireRole(session: any, allowedRoles: string[]) {
  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    throw new Error("Unauthorized: Insufficient clearance level.");
  }
}

export async function getUserFromSession() {
  return await getServerSession(authOptions);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error("This account was created with a social provider. Please sign in with Google, Discord, or GitHub.");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }

        // Handle role elevation for credentials login
        const cookieStore = await cookies();
        const pendingRole = cookieStore.get("pending_role")?.value;
        if (pendingRole && (pendingRole === "architect" || pendingRole === "respawner" || pendingRole === "spectator")) {
          if (user.role !== pendingRole) {
            user.role = pendingRole;
            await user.save();
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          xp: user.xp || 0,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      await dbConnect();
      const existingUser = await User.findOne({ email: user.email });
      const cookieStore = await cookies();
      const pendingRole = cookieStore.get("pending_role")?.value;
      const role = (pendingRole === "architect" || pendingRole === "respawner" || pendingRole === "spectator") 
        ? pendingRole 
        : null;

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: role || "spectator",
        });
      } else if (role && existingUser.role !== role) {
        // Elevate/Change role if a valid pending_role exists and is different
        existingUser.role = role;
        await existingUser.save();
      }

      // Clean up the cookie
      if (pendingRole) {
        cookieStore.delete("pending_role");
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.xp = (user as any).xp;
      }

      // If it's an OAuth sign in, we need to fetch the user from DB to get their role/xp
      if (account && account.provider !== "credentials") {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser._id.toString();
          token.xp = dbUser.xp;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.xp = token.xp;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
