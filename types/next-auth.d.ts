import { type Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      shelterId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    shelterId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    shelterId?: string | null;
  }
}
