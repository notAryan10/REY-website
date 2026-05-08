import { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

import AdminPermission from "@/models/AdminPermission";

const FOUNDER_EMAIL = "aryanverma1857@gmail.com";

export function requireRole(session: Session | null, allowedRoles: string[]) {
  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    throw new Error("Unauthorized: Insufficient clearance level.");
  }
}

export function hasPermission(session: Session | null, permission: string) {
  if (!session || !session.user) return false;
  if (session.user.role === "Founder") return true;
  return session.user.permissions?.includes(permission) || session.user.permissions?.includes("FULL_ACCESS");
}

export async function getUserFromSession() {
  return await getServerSession(authOptions);
}

const ALLOWED_ROLES = ["Founder", "Core Architect", "Moderator", "architect", "respawner", "spectator"];

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
        if (pendingRole && ALLOWED_ROLES.includes(pendingRole)) {
          if (user.role !== pendingRole) {
            user.role = pendingRole;
            await user.save();
          }
        }

        // Auto-assign Founder role if email matches
        if (user.email === FOUNDER_EMAIL && user.role !== "Founder") {
          user.role = "Founder";
          await user.save();
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
      const role = (pendingRole && ALLOWED_ROLES.includes(pendingRole)) 
        ? pendingRole 
        : (user.email === FOUNDER_EMAIL ? "Founder" : null);

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
          role: role || "spectator",
        });
      } else {
        let needsSave = false;
        if (role && existingUser.role !== role) {
          existingUser.role = role;
          needsSave = true;
        }
        if (existingUser.email === FOUNDER_EMAIL && existingUser.role !== "Founder") {
          existingUser.role = "Founder";
          needsSave = true;
        }
        if (needsSave) await existingUser.save();
      }

      // Clean up the cookie
      if (pendingRole) {
        cookieStore.delete("pending_role");
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as NextAuthUser).role;
        token.id = user.id;
        token.xp = (user as NextAuthUser).xp;
      }

      // If it's an OAuth sign in or session update, fetch from DB
      await dbConnect();
      const dbUser = await User.findOne({ email: token.email });
      if (dbUser) {
        token.role = dbUser.role;
        token.id = dbUser._id.toString();
        token.xp = dbUser.xp;

        // Fetch permissions if they are an admin
        if (["Founder", "Core Architect", "Moderator"].includes(dbUser.role)) {
          const adminPerms = await AdminPermission.findOne({ userId: dbUser._id });
          token.permissions = adminPerms ? adminPerms.permissions : [];
        }
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.xp = token.xp;
        session.user.permissions = token.permissions || [];
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
