"use server";

import { headers } from "next/headers";

import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { getAuthSession } from "@/lib/auth-redirect";
import { isAppRole, type AppRole } from "@/lib/auth-role";

const pageSize = 10;

export type RoleFilter = "all" | AppRole | "none";
export type StatusFilter = "all" | "active" | "banned";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AppRole | null;
  banned: boolean;
};

type ListedUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
};

async function requireAdmin() {
  const session = await getAuthSession();

  if (session?.user.role !== "admin") {
    return null;
  }

  return session;
}

function toAdminUser(user: ListedUser): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: isAppRole(user.role) ? user.role : null,
    banned: Boolean(user.banned),
  };
}

function roleFilter(value: string | undefined): RoleFilter {
  if (
    value === "learner" ||
    value === "instructor" ||
    value === "admin" ||
    value === "none"
  ) {
    return value;
  }

  return "all";
}

function statusFilter(value: string | undefined): StatusFilter {
  if (value === "active" || value === "banned") {
    return value;
  }

  return "all";
}

export async function listUsers(input?: {
  search?: string;
  page?: number;
  role?: string;
  status?: string;
}) {
  const session = await requireAdmin();

  if (!session) {
    return { error: "Only an admin can do that." };
  }

  const search = input?.search?.trim() ?? "";
  const page = Math.max(0, input?.page ?? 0);
  const role = roleFilter(input?.role);
  const status = statusFilter(input?.status);
  const filters: Prisma.UserWhereInput[] = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (role === "none") {
    filters.push({ OR: [{ role: null }, { role: "" }] });
  } else if (role !== "all") {
    filters.push({ role });
  }

  if (status === "banned") {
    filters.push({ banned: true });
  } else if (status === "active") {
    filters.push({ NOT: { banned: true } });
  }

  const where: Prisma.UserWhereInput = filters.length > 0 ? { AND: filters } : {};

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: page * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map(toAdminUser),
      total,
      page,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load people.";
    return { error: message };
  }
}

export async function setUserRole(userId: string, role: AppRole) {
  const session = await requireAdmin();

  if (!session) {
    return { error: "Only an admin can do that." };
  }

  if (userId === session.user.id) {
    return { error: "You cannot change your own role." };
  }

  if (!isAppRole(role)) {
    return { error: "Pick Learner, Instructor, or Admin." };
  }

  try {
    await auth.api.setRole({
      body: { userId, role },
      headers: await headers(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not change the role.";
    return { error: message };
  }

  return { ok: true };
}

export async function banUser(userId: string) {
  const session = await requireAdmin();

  if (!session) {
    return { error: "Only an admin can do that." };
  }

  if (userId === session.user.id) {
    return { error: "You cannot ban yourself." };
  }

  try {
    await auth.api.banUser({
      body: {
        userId,
        banReason: "Banned by an admin.",
      },
      headers: await headers(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not ban this person.";
    return { error: message };
  }

  return { ok: true };
}

export async function unbanUser(userId: string) {
  const session = await requireAdmin();

  if (!session) {
    return { error: "Only an admin can do that." };
  }

  try {
    await auth.api.unbanUser({
      body: { userId },
      headers: await headers(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not unban this person.";
    return { error: message };
  }

  return { ok: true };
}
