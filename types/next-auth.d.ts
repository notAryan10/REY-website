import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      xp: number;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    xp: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string;
    id: string;
    xp: number;
    permissions?: string[];
  }
}
