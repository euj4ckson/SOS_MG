import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

type SessionUser = Session["user"];

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Acesso negado. Faça login." }, { status: 401 }),
    };
  }

  return { user };
}

export function canAccessShelter(user: SessionUser, shelterId: string) {
  return user.role === "ADMIN" || user.shelterId === shelterId;
}

export function isAdmin(user: SessionUser) {
  return user.role === "ADMIN";
}
